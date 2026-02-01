// 4. Send the Email
// Use a unique name like 'mailgunRes' to avoid the conflict on line 51
const mailgunRes = await fetch(mailgunUrl, {
  method: "POST",
  headers: {
    Authorization: `Basic ${Buffer.from("api:" + apiKey).toString("base64")}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: new URLSearchParams({
    from: fromEmail,
    to: to, // Ensure this matches the variable from your body
    subject: subject,
    text: text || "",
    html: html || "",
  }),
});

// Update the subsequent checks to use the new 'mailgunRes' name
if (!mailgunRes.ok) {
  const errorText = await mailgunRes.text();
  return NextResponse.json({ error: errorText }, { status: mailgunRes.status });
}

const result = await mailgunRes.json();
return NextResponse.json({ success: true, messageId: result.id });
