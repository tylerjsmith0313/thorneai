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
    const { to, subject, text, html, contactId } = body

    if (!to || !subject || (!text && !html)) {
      return NextResponse.json({ error: "Missing required fields: to, subject, and text or html" }, { status: 400 })
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

    // Use user-specific credentials if available and enabled
    if (userIntegrations?.mailgun_enabled && userIntegrations?.mailgun_api_key) {
      apiKey = userIntegrations.mailgun_api_key
      domain = userIntegrations.mailgun_domain
      fromEmail = userIntegrations.mailgun_from_email
    }

    if (!apiKey || !domain || !fromEmail) {
      return NextResponse.json({ error: "Mailgun not configured" }, { status: 500 })
    }

    // Send email via Mailgun API
    const mailgunUrl = `https://api.mailgun.net/v3/${domain}/messages`
    
    const formData = new FormData()
    formData.append("from", fromEmail)
    formData.append("to", to)
    formData.append("subject", subject)
    if (text) formData.append("text", text)
    if (html) formData.append("html", html)

    const response = await fetch(mailgunUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Mailgun error:", errorText)
      return NextResponse.json({ error: "Failed to send email", details: errorText }, { status: 500 })
    }

    const result = await response.json()

    // Log the communication in the database
    if (contactId) {
      await supabase.from("contact_communications").insert({
        contact_id: contactId,
        user_id: user.id,
        channel: "email",
        direction: "outbound",
        subject: subject,
        content: text || html,
        status: "sent",
        metadata: { mailgun_id: result.id }
      })
    }

    return NextResponse.json({ success: true, messageId: result.id })
  } catch (error) {
    console.error("[v0] Email send error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
