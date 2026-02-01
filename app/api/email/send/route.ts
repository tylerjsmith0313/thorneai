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

    // 1. Fetch User Integration settings
    const { data: userInt } = await supabase
      .from("user_integrations")
      .select("mailgun_api_key, mailgun_domain, mailgun_from_email, mailgun_enabled, mailgun_region")
      .eq("user_id", user.id)
      .single()

    // 2. Credential Prioritization
    const useUserConfig = !!(userInt?.mailgun_enabled && userInt?.mailgun_api_key)
    
    const apiKey = useUserConfig ? userInt.mailgun_api_key : process.env.MAILGUN_API_KEY
    const domain = useUserConfig ? userInt.mailgun_domain : "simplyflourish.space"
    const fromEmail = useUserConfig ? userInt.mailgun_from_email : "noreply@simplyflourish.space"
    // Defaulting to US if not specified
    const region = (useUserConfig ? userInt.mailgun_region : process.env.MAILGUN_REGION) || "US"

    console.log(`[Mailgun] Config: ${useUserConfig ? "USER_DB" : "ENV_GLOBAL"} | Domain: ${domain} | Region: ${region}`)

    if (!apiKey || !domain || !fromEmail) {
      return NextResponse.json({ 
        error: "Mailgun not configured properly",
        details: `Missing: ${!apiKey ? "apiKey " : ""}${!domain ? "domain " : ""}${!fromEmail ? "fromEmail" : ""}`.trim()
      }, { status: 500 })
    }

    // 3. Set correct Base URL (Fixed Syntax)
    const baseUrl = region.toUpperCase() === "EU" 
      ? "https://api.eu.mailgun.net" 
      : "https://api.mailgun.net"
    
    const mailgunUrl = `${baseUrl}/v3/${domain}/messages`
    
    // 4. Execute Fetch
    const response = await fetch(mailgunUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from("api:" + apiKey).toString("base64")}`,
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
      console.error(`[Mailgun Error] Status: ${response.status} | Message: ${errorText}`)
      
      return NextResponse.json({ 
        error: errorText,
        status: response.status,
        domain,
      }, { status: response.status })
    }

    const result = await response.json()

    // 5. Log to database
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

  } catch (error: any) {
    console.error("[Mailgun] Server error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
