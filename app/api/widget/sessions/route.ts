import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET - Fetch widget chat sessions for the dashboard
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get("contactId")
    const email = searchParams.get("email")
    const status = searchParams.get("status") // 'active', 'closed', or null for all

    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // If we have both contactId and email, fetch sessions matching either
    // This ensures we get sessions linked by contact_id OR by email matching
    if (contactId && email) {
      const { data: sessions, error } = await supabase
        .from("widget_sessions")
        .select(`
          *,
          widget_chatbots (name, theme_color)
        `)
        .eq("user_id", user.id)
        .or(`contact_id.eq.${contactId},visitor_email.eq.${email}`)
        .order("last_message_at", { ascending: false })

      if (error) {
        console.error("[v0] Error fetching sessions:", error)
        return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
      }

      // Also link any unlinked sessions to this contact
      const unlinkedSessions = sessions?.filter(s => !s.contact_id && s.visitor_email === email) || []
      if (unlinkedSessions.length > 0) {
        await supabase
          .from("widget_sessions")
          .update({ contact_id: contactId })
          .in("id", unlinkedSessions.map(s => s.id))
      }

      return NextResponse.json({ sessions: sessions || [] })
    }

    // Standard query
    let query = supabase
      .from("widget_sessions")
      .select(`
        *,
        widget_chatbots (name, theme_color),
        contacts (first_name, last_name, email, company)
      `)
      .eq("user_id", user.id)
      .order("last_message_at", { ascending: false })

    if (contactId) {
      query = query.eq("contact_id", contactId)
    }

    if (status) {
      query = query.eq("status", status)
    }

    const { data: sessions, error } = await query

    if (error) {
      console.error("[v0] Error fetching sessions:", error)
      return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
    }

    return NextResponse.json({ sessions: sessions || [] })
  } catch (error) {
    console.error("[v0] Sessions fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH - Update session status (mark as read, close, etc.)
export async function PATCH(request: Request) {
  try {
    const { sessionId, status, unreadCount } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updates: Record<string, any> = {}
    if (status) updates.status = status
    if (typeof unreadCount === "number") updates.unread_count = unreadCount

    const { error } = await supabase
      .from("widget_sessions")
      .update(updates)
      .eq("id", sessionId)
      .eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ error: "Failed to update session" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Session update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
