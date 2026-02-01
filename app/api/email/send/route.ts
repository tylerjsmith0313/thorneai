import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { to, subject, text, html } = body;

    const { data: userInt } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const useUserConfig = !!(userInt?.mailgun_enabled && userInt?.mailgun_api_key);
    const apiKey = useUserConfig ? userInt.mailgun_api_key : process.env.MAILGUN_API_KEY;
    const domain = useUserConfig ? userInt.mailgun_domain : "simplyflourish.space";
    const fromEmail = useUserConfig ? userInt.mailgun_from_email : "noreply@simplyflourish.space";
    const mailgunUrl = `https://api.mailgun.net/v3/${domain}/messages`;

    if (!apiKey || !domain) {
      return NextResponse.json({ error: "Mailgun credentials missing" }, { status: 500 });
    }

    const mailgunRes = await fetch(mailgunUrl, {
      method: "POST",
      headers: {
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

    if (!mailgunRes.ok) {
      const errorText = await mailgunRes.text();
      // FIX: Added missing closing quotes and parenthesis
      console.error("[Mailgun API Error]:", errorText); 
      return NextResponse.json({ error: errorText }, { status: mailgunRes.status });
    }

    const result = await mailgunRes.json();
    return NextResponse.json({ success: true, messageId: result.id });

  } catch (error: any) {
    console.error("[Mailgun Server Error]:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
