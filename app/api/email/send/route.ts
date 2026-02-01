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
    // Note: Ensure you define 'userInt' by fetching it from your database here
    const { data: userInt } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", user.id)
      .single()

    // 3. Prioritize Credentials & Define Variables FIRST
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
    // We only use 'const response' once here to avoid the "defined multiple times" error
    const response = await fetch(mailgunUrl, {
      method: "POST",
      headers: {
        // Correctly formatted Basic Auth for Mailgun
        Authorization: `Basic ${Buffer.from("api:" + apiKey).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        from: fromEmail,
        to: to,
        subject: subject,
        text: text || "",
        html: html || "",
      }),
    })

    // 5. Handle the Response
    if (!response.ok) {
      const errorText = await response.text()
      console.error("[Mailgun] API Error:", errorText)
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json({ success: true, messageId: result.id })

  } catch (error: any) {
    console.error("[Mailgun] Catch Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
