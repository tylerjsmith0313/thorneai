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

    // 2. Credential Prioritization: User config ONLY if enabled, otherwise ONLY global env vars
    const useUserConfig = !!(userInt?.mailgun_enabled && userInt?.mailgun_api_key)
    
    // Resolve credentials with strict priority (no mixing)
    const apiKey = useUserConfig ? userInt.mailgun_api_key : process.env.MAILGUN_API_KEY
    const domain = useUserConfig ? userInt.mailgun_domain : "simplyflourish.space"
    const fromEmail = useUserConfig ? userInt.mailgun_from_email : "noreply@simplyflourish.space"
    const region = (useUserConfig ? userInt.mailgun_region : process.env.MAILGUN_REGION) || "US"

    // Safe logging for debugging (no API key exposed)
    console.log(`[Mailgun] Config: ${useUserConfig ? "USER_DB" : "ENV_GLOBAL"} | Domain: ${domain} | Region: ${region} | From: ${fromEmail}`)

    if (!apiKey || !domain || !fromEmail) {
      console.error(`[Mailgun] Missing config - apiKey: ${!!apiKey}, domain: ${!!domain}, fromEmail: ${!!fromEmail}`)
      return NextResponse.json({ 
        error: "Mailgun not configured properly",
        details: `Missing: ${!apiKey ? "apiKey " : ""}${!domain ? "domain " : ""}${!fromEmail ? "fromEmail" : ""}`.trim()
      }, { status: 500 })
    }

    // 3. Set correct Base URL based on resolved region
    const baseUrl = region.toUpperCase() === "EU" 
      ? "https://api.eu.mailgun.net" 
      : "https://api.mailgun.net"
    
    const mailgunUrl = `${baseUrl}/v3/${domain}/messages`
    
    // 4. Use Buffer.from for Node.js compatibility + URLSearchParams for proper format
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

    // 5. Enhanced error reporting - return exact Mailgun error
    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = "Mailgun rejected request"
      
      // Try to parse Mailgun's JSON error response
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorText
      } catch {
        errorMessage = errorText
      }
      
      console.error(`[Mailgun Error] Status: ${response.status} | Domain: ${domain} | Region: ${region} | Message: ${errorMessage}`)
      
      return NextResponse.json({ 
        error: errorMessage,
        status: response.status,
        domain,
        region
      }, { status: response.status })
    }

    const result = await response.json()

    // 6. Log to email_messages table with the actual fromEmail used
    const { data: tenantUser } = await supabase
      .from("tenant_users")
      .select("tenant_id")
      .eq("user_id", user.id)
      .single()

    await supabase.from("email_messages").insert({
      tenant_id: tenantUser?.tenant_id,
      contact_id: contactId || null,
      message_id: result.id,
      from_email: fromEmail, // Uses the actual fromEmail that was sent
      to_email: to,
      subject: subject,
      body_plain: text,
      body_html: html,
      direction: "outbound",
      status: "sent",
      sent_at: new Date().toISOString(),
    })

    console.log(`[Mailgun] Email sent successfully | ID: ${result.id} | To: ${to}`)
    return NextResponse.json({ success: true, messageId: result.id })
  } catch (error: any) {
    const debugObject = {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack?.split("\n").slice(0, 3).join("\n"),
    }
    console.error("[Mailgun] Server error:", debugObject)
    return NextResponse.json({ 
      error: error.message || "Internal server error",
      debug: debugObject 
    }, { status: 500 })
  }
}
