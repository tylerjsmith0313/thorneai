import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { emailId, text, html } = body

    if (!emailId || !text) {
      return NextResponse.json({ error: "Missing required fields: emailId and text" }, { status: 400 })
    }

    // Get the original email
    const { data: originalEmail, error: fetchError } = await supabase
      .from("email_messages")
      .select("*")
      .eq("id", emailId)
      .single()

    if (fetchError || !originalEmail) {
      return NextResponse.json({ error: "Original email not found" }, { status: 404 })
    }

    // Check for user-specific Mailgun credentials first
    const { data: userIntegrations } = await supabase
      .from("user_integrations")
      .select("mailgun_api_key, mailgun_domain, mailgun_from_email, mailgun_enabled")
      .eq("user_id", user.id)
      .single()

    let apiKey = process.env.MAILGUN_API_KEY
    let domain = process.env.MAILGUN_DOMAIN
    let fromEmail = process.env.MAILGUN_FROM_EMAIL

    if (userIntegrations?.mailgun_enabled && userIntegrations?.mailgun_api_key) {
      apiKey = userIntegrations.mailgun_api_key
      domain = userIntegrations.mailgun_domain
      fromEmail = userIntegrations.mailgun_from_email
    }

    if (!apiKey || !domain || !fromEmail) {
      return NextResponse.json({ error: "Mailgun not configured" }, { status: 500 })
    }

    // Determine reply-to address (reply to sender for inbound, original recipient for outbound)
    const replyTo = originalEmail.direction === "inbound" 
      ? originalEmail.from_email 
      : originalEmail.to_email

    // Build subject with Re: prefix if not already present
    const subject = originalEmail.subject?.startsWith("Re:") 
      ? originalEmail.subject 
      : `Re: ${originalEmail.subject || "(no subject)"}`

    // Send email via Mailgun API
    const mailgunUrl = `https://api.mailgun.net/v3/${domain}/messages`
    
    const formData = new FormData()
    formData.append("from", fromEmail)
    formData.append("to", replyTo)
    formData.append("subject", subject)
    formData.append("text", text)
    if (html) formData.append("html", html)
    
    // Add threading headers
    if (originalEmail.message_id) {
      formData.append("h:In-Reply-To", originalEmail.message_id)
      formData.append("h:References", originalEmail.message_id)
    }
    
    // Enable tracking
    formData.append("o:tracking-opens", "yes")
    formData.append("o:tracking-clicks", "yes")

    const response = await fetch(mailgunUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Mailgun reply error:", errorText)
      return NextResponse.json({ error: "Failed to send reply", details: errorText }, { status: 500 })
    }

    const result = await response.json()

    // Store the reply in the database
    const { data: storedReply, error: storeError } = await supabase
      .from("email_messages")
      .insert({
        tenant_id: originalEmail.tenant_id,
        contact_id: originalEmail.contact_id,
        conversation_id: originalEmail.conversation_id,
        message_id: result.id,
        from_email: fromEmail,
        to_email: replyTo,
        subject: subject,
        body_plain: text,
        body_html: html,
        direction: "outbound",
        status: "sent",
        in_reply_to: originalEmail.message_id,
        thread_id: originalEmail.thread_id || originalEmail.id,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (storeError) {
      console.error("[v0] Error storing reply:", storeError)
    }

    // Log the communication
    if (originalEmail.contact_id) {
      await supabase.from("contact_communications").insert({
        contact_id: originalEmail.contact_id,
        user_id: user.id,
        channel: "email",
        direction: "outbound",
        subject: subject,
        content: text,
        status: "sent",
        metadata: { mailgun_id: result.id, reply_to: emailId }
      })

      // Update contact's last_contact_date
      await supabase
        .from("contacts")
        .update({ last_contact_date: new Date().toISOString().split("T")[0] })
        .eq("id", originalEmail.contact_id)
    }

    return NextResponse.json({ 
      success: true, 
      messageId: result.id,
      replyId: storedReply?.id 
    })
  } catch (error) {
    console.error("[v0] Email reply error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
