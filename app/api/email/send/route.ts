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

    // Handle region mismatch (US vs EU) - common fix for 401 errors
    const region = process.env.MAILGUN_REGION || "US"
    const baseUrl = region.toUpperCase() === "EU" 
      ? "https://api.eu.mailgun.net" 
      : "https://api.mailgun.net"
    
    const mailgunUrl = `${baseUrl}/v3/${domain}/messages`
    
    // Use URLSearchParams for proper x-www-form-urlencoded format (Mailgun requirement)
    const response = await fetch(mailgunUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        from: fromEmail,
        to,
        subject,
        text: text || "",
        html: html || "",
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Mailgun error:", errorText)
      return NextResponse.json({ error: "Failed to send email", details: errorText }, { status: 500 })
    }

    const result = await response.json()

    // Log the email in email_messages table
    const { data: tenantUser } = await supabase
      .from("tenant_users")
      .select("tenant_id")
      .eq("user_id", user.id)
      .single()

    await supabase.from("email_messages").insert({
      tenant_id: tenantUser?.tenant_id,
      contact_id: contactId || null,
      message_id: result.id,
      from_email: fromEmail,
      to_email: to,
      subject: subject,
      body_plain: text,
      body_html: html,
      direction: "outbound",
      status: "sent",
      sent_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, messageId: result.id })
  } catch (error) {
    console.error("[v0] Email send error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
