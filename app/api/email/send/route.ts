import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    // 1. Initialize Supabase
    const supabase = await createClient()
    
    // Check if user is logged in
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { to, subject, text, html, contactId } = body

    // 2. Fetch User Integration settings
    const { data: userInt } = await supabase
      .from("user_integrations")
      .select("mailgun_api_key, mailgun_domain, mailgun_from_email, mailgun_enabled")
      .eq("user_id", user.id)
      .single()

    // 3. Prioritize Credentials (Using your US-based logic)
    const useUserConfig = !!(userInt?.mailgun_enabled && userInt?.mailgun_api_key)
    
    const apiKey = useUserConfig ? userInt.mailgun_api_key : process.env.MAILGUN_API_KEY
    const domain = useUserConfig ? userInt.mailgun_domain : "simplyflourish.space"
    const fromEmail = useUserConfig ? userInt.mailgun_from_email : "noreply@simplyflourish.space"

    // US API Endpoint
    const mailgunUrl = `https://api.mailgun.net/v3/${domain}/messages`

    if (!apiKey || !domain) {
      return NextResponse.json({ error: "Mailgun credentials missing" }, { status: 500 })
    }

    // 4. Send the Email
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
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json({ success: true, messageId: result.id })

  } catch (error: any) {
    console.error("[Mailgun] Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
