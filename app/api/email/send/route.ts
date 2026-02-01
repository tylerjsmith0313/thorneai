import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // 1. Initialize Supabase
    const supabase = await createClient();
    
    // Check if user is logged in
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { to, subject, text, html } = body;

    // 3. Fetch User Integration settings from database
    const { data: userInt } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // 4. Determine which credentials to use
    const useUserConfig = !!(userInt?.mailgun_enabled && userInt?.mailgun_api_key);
    
    const apiKey = useUserConfig ? userInt.mailgun_api_key : process.env.MAILGUN_API_KEY;
    const domain = useUserConfig ? userInt.mailgun_domain : "simplyflourish.space";
    const fromEmail = useUserConfig ? userInt.mailgun_from_email : "noreply@simplyflourish.space";

    // Define the US-based API Endpoint
    const mailgunUrl = `https://api.mailgun.net/v3/${domain}/messages`;

    // 5. Validation Check
    if (!apiKey || !domain) {
      return NextResponse.json({ error: "Mailgun credentials missing" }, { status: 500 });
    }

    // 6. Send the Email via Mailgun API
    // Renamed to 'mailgunRes' to avoid the "defined multiple times" error
    const mailgunRes = await fetch(mailgunUrl, {
      method: "POST",
      headers: {
        // Base64 encoded Basic Auth: "api:key-xxxx"
        Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        from: fromEmail,
        to: to,
        subject: subject,
        text: text || "",
        html: html || "",
      }),
    });

    // 7. Handle the Mailgun API response
    if (!mailgunRes.ok) {
      const errorText = await mailgunRes.text();
      console.error("[Mailgun
