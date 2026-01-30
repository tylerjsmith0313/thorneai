import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// POST - Send reply from dashboard to widget visitor
export async function POST(request: Request) {
  try {
    const { sessionId, message, senderType = "agent" } = await request.json()

    if (!sessionId || !message) {
      return NextResponse.json(
        { error: "Missing sessionId or message" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get session to verify ownership and get chatbot_id
    const { data: session, error: sessionError } = await supabase
      .from("widget_sessions")
      .select("id, chatbot_id, user_id, contact_id")
      .eq("id", sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    // Save the reply message
    const { data: savedMessage, error: messageError } = await supabase
      .from("widget_messages")
      .insert({
        session_id: sessionId,
        chatbot_id: session.chatbot_id,
        user_id: session.user_id,
        sender_type: senderType, // 'agent' or 'ai'
        content: message,
        is_read: true,
      })
      .select()
      .single()

    if (messageError) {
      console.error("[v0] Error saving reply:", messageError)
      return NextResponse.json(
        { error: "Failed to save reply" },
        { status: 500 }
      )
    }

    // Update session last activity
    await supabase
      .from("widget_sessions")
      .update({ 
        last_message_at: new Date().toISOString(),
      })
      .eq("id", sessionId)

    return NextResponse.json({
      success: true,
      messageId: savedMessage.id,
    })
  } catch (error) {
    console.error("[v0] Widget reply error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
