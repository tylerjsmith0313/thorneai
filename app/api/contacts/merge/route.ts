import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// POST - Merge multiple contacts into one
export async function POST(request: Request) {
  try {
    const { targetContactId, sourceContactIds } = await request.json()

    if (!targetContactId || !sourceContactIds || sourceContactIds.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify all contacts belong to this user
    const allContactIds = [targetContactId, ...sourceContactIds]
    console.log("[v0] Merging contacts:", { targetContactId, sourceContactIds, allContactIds })
    
    const { data: contacts, error: contactsError } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", user.id)
      .in("id", allContactIds)

    console.log("[v0] Found contacts:", { count: contacts?.length, expected: allContactIds.length, error: contactsError })

    if (contactsError) {
      console.error("[v0] Error fetching contacts:", contactsError)
      return NextResponse.json({ error: `Failed to fetch contacts: ${contactsError.message}` }, { status: 500 })
    }
    
    if (!contacts || contacts.length !== allContactIds.length) {
      return NextResponse.json({ 
        error: `One or more contacts not found. Expected ${allContactIds.length}, found ${contacts?.length || 0}` 
      }, { status: 404 })
    }

    const targetContact = contacts.find(c => c.id === targetContactId)
    const sourceContacts = contacts.filter(c => sourceContactIds.includes(c.id))

    if (!targetContact) {
      return NextResponse.json({ error: "Target contact not found" }, { status: 404 })
    }

    // Merge data - fill in any missing fields from source contacts
    const mergedData: Record<string, any> = {}
    const fieldsToMerge = [
      "phone", "job_title", "industry", "street_address", "address", "city", 
      "state", "zip_code", "country", "company_address", "linkedin_url", 
      "twitter_handle", "instagram_handle", "facebook_url", "youtube_url",
      "tiktok_handle", "website_url", "interests", "hobbies", "notes",
      "demeanor", "communication_pace", "preferred_channel", "outreach_budget",
      "outreach_channels", "engagement_score"
    ]

    for (const field of fieldsToMerge) {
      // If target doesn't have this field, check sources
      if (!targetContact[field]) {
        for (const source of sourceContacts) {
          if (source[field]) {
            mergedData[field] = source[field]
            break
          }
        }
      }
    }

    // Merge arrays (interests, hobbies, outreach_channels)
    const arrayFields = ["interests", "hobbies", "outreach_channels"]
    for (const field of arrayFields) {
      const combined = new Set<string>()
      if (targetContact[field]) {
        targetContact[field].forEach((v: string) => combined.add(v))
      }
      for (const source of sourceContacts) {
        if (source[field]) {
          source[field].forEach((v: string) => combined.add(v))
        }
      }
      if (combined.size > 0) {
        mergedData[field] = Array.from(combined)
      }
    }

    // Merge notes
    const allNotes: string[] = []
    if (targetContact.notes) allNotes.push(targetContact.notes)
    for (const source of sourceContacts) {
      if (source.notes && source.notes !== targetContact.notes) {
        allNotes.push(`[Merged from ${source.first_name} ${source.last_name}]: ${source.notes}`)
      }
    }
    if (allNotes.length > 0) {
      mergedData.notes = allNotes.join("\n\n")
    }

    // Update engagement score - take the highest
    const scores = contacts.map(c => c.engagement_score || 0)
    mergedData.engagement_score = Math.max(...scores)

    // Update target contact with merged data
    if (Object.keys(mergedData).length > 0) {
      const { error: updateError } = await supabase
        .from("contacts")
        .update(mergedData)
        .eq("id", targetContactId)

      if (updateError) {
        console.error("Error updating target contact:", updateError)
      }
    }

    // Update all related records to point to target contact
    // 1. Widget sessions
    await supabase
      .from("widget_sessions")
      .update({ contact_id: targetContactId })
      .in("contact_id", sourceContactIds)

    // 2. Conversations
    await supabase
      .from("conversations")
      .update({ contact_id: targetContactId })
      .in("contact_id", sourceContactIds)

    // 3. Activities
    await supabase
      .from("activities")
      .update({ contact_id: targetContactId })
      .in("contact_id", sourceContactIds)

    // 4. Deals
    await supabase
      .from("deals")
      .update({ contact_id: targetContactId })
      .in("contact_id", sourceContactIds)

    // Create activity log for the merge
    await supabase
      .from("activities")
      .insert({
        user_id: user.id,
        contact_id: targetContactId,
        type: "System",
        title: "Contacts Merged",
        detail: `Merged ${sourceContacts.length} contact(s): ${sourceContacts.map(c => `${c.first_name} ${c.last_name}`).join(", ")}`,
      })

    // Delete source contacts
    const { error: deleteError } = await supabase
      .from("contacts")
      .delete()
      .in("id", sourceContactIds)

    if (deleteError) {
      console.error("Error deleting source contacts:", deleteError)
      return NextResponse.json({ 
        error: "Merge partially completed but failed to delete source contacts" 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      mergedCount: sourceContacts.length,
      targetContactId,
    })
  } catch (error) {
    console.error("Contacts merge error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET - Find potential duplicate contacts
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find contacts with duplicate emails
    const { data: contacts, error } = await supabase
      .from("contacts")
      .select("id, first_name, last_name, email, company, phone")
      .eq("user_id", user.id)
      .not("email", "is", null)
      .order("email")

    if (error) {
      return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 })
    }

    // Group by email
    const emailGroups: Record<string, typeof contacts> = {}
    for (const contact of contacts || []) {
      const email = contact.email?.toLowerCase()
      if (email) {
        if (!emailGroups[email]) {
          emailGroups[email] = []
        }
        emailGroups[email].push(contact)
      }
    }

    // Filter to only groups with duplicates
    const duplicates = Object.entries(emailGroups)
      .filter(([, group]) => group.length > 1)
      .map(([email, contacts]) => ({ email, contacts }))

    return NextResponse.json({ duplicates })
  } catch (error) {
    console.error("Find duplicates error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
