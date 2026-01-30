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
    // First try to find an existing contact by email
    const { data: existingContact } = await supabaseAdmin
      .from("contacts")
      .select("id")
      .eq("user_id", userId)
      .eq("email", visitorInfo.email)
      .single()

    let contactId = existingContact?.id

    if (!contactId) {
      // Create a new contact
      const nameParts = visitorInfo.name.split(" ")
      const firstName = nameParts[0] || visitorInfo.name
      const lastName = nameParts.slice(1).join(" ") || ""

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

      contactId = newContact?.id
    } else {
      // Update existing contact with opt-in preferences if they've changed
      await supabaseAdmin
        .from("contacts")
        .update({
          phone: visitorInfo.phone,
          opt_in_email: visitorInfo.optInEmail,
          opt_in_sms: visitorInfo.optInSms,
          opt_in_phone: visitorInfo.optInPhone,
        })
        .eq("id", contactId)
    }

    // Link session to contact
    if (contactId) {
      await supabaseAdmin
        .from("widget_sessions")
        .update({ contact_id: contactId })
        .eq("id", sessionId)
    }
  } catch (error) {
    console.error("Contact matching error:", error)
    // Don't fail the request if contact matching fails
  }
}
