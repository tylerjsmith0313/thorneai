import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Use service role client for widget operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { chatbotId, sessionId, visitorInfo } = await request.json()

    if (!chatbotId || !visitorInfo) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the chatbot to verify it exists and get owner info
    const { data: chatbot, error: chatbotError } = await supabaseAdmin
      .from("widget_chatbots")
      .select("*")
      .eq("id", chatbotId)
      .eq("is_active", true)
      .single()

    if (chatbotError || !chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    // Check if we already have a session
    if (sessionId) {
      // Update existing session with lead info
      const { error: updateError } = await supabaseAdmin
        .from("widget_sessions")
        .update({
          visitor_name: visitorInfo.name,
          visitor_email: visitorInfo.email,
          visitor_phone: visitorInfo.phone,
          opt_in_email: visitorInfo.optInEmail,
          opt_in_sms: visitorInfo.optInSms,
          opt_in_phone: visitorInfo.optInPhone,
        })
        .eq("id", sessionId)

      if (!updateError) {
        // Try to match with existing contact by email
        await matchOrCreateContact(chatbot.user_id, visitorInfo, sessionId)
        
        return NextResponse.json({ 
          sessionId: sessionId,
          success: true 
        })
      }
    }

    // Create a new session with lead info
    const visitorId = `v_${Date.now()}_${Math.random().toString(36).substring(7)}`

    const { data: session, error: sessionError } = await supabaseAdmin
      .from("widget_sessions")
      .insert({
        chatbot_id: chatbotId,
        user_id: chatbot.user_id,
        visitor_id: visitorId,
        visitor_name: visitorInfo.name,
        visitor_email: visitorInfo.email,
        visitor_phone: visitorInfo.phone,
        opt_in_email: visitorInfo.optInEmail,
        opt_in_sms: visitorInfo.optInSms,
        opt_in_phone: visitorInfo.optInPhone,
        status: "active",
      })
      .select()
      .single()

    if (sessionError) {
      console.error("Session creation error:", sessionError)
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
    }

    // Try to match with existing contact or create one
    await matchOrCreateContact(chatbot.user_id, visitorInfo, session.id)

    return NextResponse.json({
      sessionId: session.id,
      success: true,
    })
  } catch (error) {
    console.error("Widget lead error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function matchOrCreateContact(userId: string, visitorInfo: any, sessionId: string) {
  try {
    // First try to find an existing contact by email (case-insensitive)
    const { data: existingContacts } = await supabaseAdmin
      .from("contacts")
      .select("id, first_name, last_name, email, phone")
      .eq("user_id", userId)
      .ilike("email", visitorInfo.email)

    let contactId: string | null = null

    if (existingContacts && existingContacts.length > 0) {
      // Use the first matching contact
      contactId = existingContacts[0].id

      // Update existing contact with new info (merge data)
      const updateData: Record<string, any> = {
        opt_in_email: visitorInfo.optInEmail,
        opt_in_sms: visitorInfo.optInSms,
        opt_in_phone: visitorInfo.optInPhone,
      }
      
      // Only update phone if the existing one is empty
      if (!existingContacts[0].phone && visitorInfo.phone) {
        updateData.phone = visitorInfo.phone
      }

      await supabaseAdmin
        .from("contacts")
        .update(updateData)
        .eq("id", contactId)

      // If there are multiple contacts with same email, log it for potential merge
      if (existingContacts.length > 1) {
        console.log(`[Widget] Found ${existingContacts.length} contacts with email ${visitorInfo.email} - consider merging`)
      }
    } else {
      // Also check by name similarity if no email match
      // Use firstName and lastName if provided, otherwise parse from name
      const firstName = visitorInfo.firstName || visitorInfo.name?.split(" ")[0] || ""
      const lastName = visitorInfo.lastName || visitorInfo.name?.split(" ").slice(1).join(" ") || ""

      // Check if there's a contact with same first and last name
      const { data: nameMatches } = await supabaseAdmin
        .from("contacts")
        .select("id, email")
        .eq("user_id", userId)
        .ilike("first_name", firstName)
        .ilike("last_name", lastName || firstName)

      if (nameMatches && nameMatches.length > 0 && !nameMatches[0].email) {
        // Found a name match with no email - update it
        contactId = nameMatches[0].id
        await supabaseAdmin
          .from("contacts")
          .update({
            email: visitorInfo.email,
            phone: visitorInfo.phone,
            opt_in_email: visitorInfo.optInEmail,
            opt_in_sms: visitorInfo.optInSms,
            opt_in_phone: visitorInfo.optInPhone,
          })
          .eq("id", contactId)
      } else {
        // Create a new contact
        const { data: newContact } = await supabaseAdmin
          .from("contacts")
          .insert({
            user_id: userId,
            first_name: firstName,
            last_name: lastName,
            email: visitorInfo.email,
            phone: visitorInfo.phone,
            source: "widget",
            status: "lead",
            opt_in_email: visitorInfo.optInEmail,
            opt_in_sms: visitorInfo.optInSms,
            opt_in_phone: visitorInfo.optInPhone,
          })
          .select("id")
          .single()

        contactId = newContact?.id || null
      }
    }

    // Link session to contact
    if (contactId) {
      await supabaseAdmin
        .from("widget_sessions")
        .update({ contact_id: contactId })
        .eq("id", sessionId)

      // Also link any other sessions from this email that aren't linked
      await supabaseAdmin
        .from("widget_sessions")
        .update({ contact_id: contactId })
        .eq("user_id", userId)
        .eq("visitor_email", visitorInfo.email)
        .is("contact_id", null)
    }
  } catch (error) {
    console.error("Contact matching error:", error)
    // Don't fail the request if contact matching fails
  }
}
