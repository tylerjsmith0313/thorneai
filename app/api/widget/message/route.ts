import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// POST - Receive messages from embedded widget
export async function POST(request: Request) {
  try {
    const { chatbotId, sessionId, message, visitorName, visitorEmail } = await request.json()

    if (!chatbotId || !message) {
      return NextResponse.json(
        { error: "Missing chatbotId or message" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify chatbot exists and is active
    const { data: chatbot, error: chatbotError } = await supabase
      .from("widget_chatbots")
      .select("id, user_id, name, welcome_message, ai_instructions, theme_color, is_active")
      .eq("id", chatbotId)
      .eq("is_active", true)
      .single()

    if (chatbotError || !chatbot) {
      return NextResponse.json(
        { error: "Chatbot not found or inactive" },
        { status: 404 }
      )
    }

    // Get or create session
    let currentSessionId = sessionId
    let session = null

    if (sessionId) {
      const { data: existingSession } = await supabase
        .from("widget_sessions")
        .select("*")
        .eq("id", sessionId)
        .single()
      session = existingSession
    }

    if (!session) {
      // Create new session
      const { data: newSession, error: sessionError } = await supabase
        .from("widget_sessions")
        .insert({
          chatbot_id: chatbotId,
          user_id: chatbot.user_id,
          visitor_name: visitorName || null,
          visitor_email: visitorEmail || null,
          source_url: request.headers.get("referer") || null,
          ip_address: request.headers.get("x-forwarded-for")?.split(",")[0] || null,
          user_agent: request.headers.get("user-agent") || null,
          status: "active",
        })
        .select()
        .single()

      if (sessionError) {
        console.error("[v0] Error creating session:", sessionError)
        return NextResponse.json(
          { error: "Failed to create session" },
          { status: 500 }
        )
      }
      session = newSession
      currentSessionId = newSession.id

      // If visitor provided email, try to link to existing contact or create new one
      if (visitorEmail) {
        const { data: existingContact } = await supabase
          .from("contacts")
          .select("id")
          .eq("email", visitorEmail)
          .eq("user_id", chatbot.user_id)
          .single()

        if (existingContact) {
          await supabase
            .from("widget_sessions")
            .update({ contact_id: existingContact.id })
            .eq("id", currentSessionId)
        } else {
          // Create new contact from widget visitor
          const nameParts = (visitorName || "").split(" ")
          const { data: newContact } = await supabase
            .from("contacts")
            .insert({
              user_id: chatbot.user_id,
              email: visitorEmail,
              firstName: nameParts[0] || "Widget",
              lastName: nameParts.slice(1).join(" ") || "Visitor",
              source: "Widget Chat",
              tags: ["widget-chat"],
              notes: `Lead captured via widget: ${chatbot.name}`,
            })
            .select("id")
            .single()

          if (newContact) {
            await supabase
              .from("widget_sessions")
              .update({ contact_id: newContact.id })
              .eq("id", currentSessionId)
          }
        }
      }
    }

    // Save the visitor message
    const { data: savedMessage, error: messageError } = await supabase
      .from("widget_messages")
      .insert({
        session_id: currentSessionId,
        chatbot_id: chatbotId,
        user_id: chatbot.user_id,
        sender_type: "visitor",
        content: message,
        is_read: false,
      })
      .select()
      .single()

    if (messageError) {
      console.error("[v0] Error saving message:", messageError)
      return NextResponse.json(
        { error: "Failed to save message" },
        { status: 500 }
      )
    }

    // Update session last activity
    await supabase
      .from("widget_sessions")
      .update({ 
        last_message_at: new Date().toISOString(),
        unread_count: session ? (session.unread_count || 0) + 1 : 1,
      })
      .eq("id", currentSessionId)

    return NextResponse.json({
      success: true,
      sessionId: currentSessionId,
      messageId: savedMessage.id,
      chatbot: {
        name: chatbot.name,
        welcomeMessage: chatbot.welcome_message,
        themeColor: chatbot.theme_color,
      },
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    console.error("[v0] Widget message error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET - Fetch messages for a session (for real-time polling)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")
    const since = searchParams.get("since") // timestamp to fetch messages after

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    let query = supabase
      .from("widget_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })

    if (since) {
      query = query.gt("created_at", since)
    }

    const { data: messages, error } = await query

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      messages: messages || [],
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    console.error("[v0] Widget fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Allow CORS for embedded widgets
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
