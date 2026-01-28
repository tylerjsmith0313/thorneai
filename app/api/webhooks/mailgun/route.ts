import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

// Use service role for webhook operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Verify Mailgun webhook signature
function verifyMailgunSignature(
  timestamp: string,
  token: string,
  signature: string
): boolean {
  const signingKey = process.env.MAILGUN_WEBHOOK_SIGNING_KEY
  if (!signingKey) {
    console.warn("[v0] MAILGUN_WEBHOOK_SIGNING_KEY not set, skipping signature verification")
    return true // Skip verification if key not set (development mode)
  }

  const encodedToken = crypto
    .createHmac("sha256", signingKey)
    .update(timestamp.concat(token))
    .digest("hex")

  return encodedToken === signature
}

// Parse multipart form data from Mailgun
async function parseMailgunPayload(request: NextRequest) {
  const contentType = request.headers.get("content-type") || ""

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await request.text()
    const params = new URLSearchParams(text)
    return Object.fromEntries(params.entries())
  }

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData()
    const data: Record<string, string> = {}
    formData.forEach((value, key) => {
      if (typeof value === "string") {
        data[key] = value
      }
    })
    return data
  }

  // Try JSON
  try {
    return await request.json()
  } catch {
    return {}
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await parseMailgunPayload(request)

    // Verify webhook signature if credentials are available
    const timestamp = payload.timestamp || payload["signature[timestamp]"]
    const token = payload.token || payload["signature[token]"]
    const signature = payload.signature || payload["signature[signature]"]

    if (timestamp && token && signature) {
      const isValid = verifyMailgunSignature(timestamp, token, signature)
      if (!isValid) {
        console.error("[v0] Invalid Mailgun webhook signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    // Extract email data
    const emailData = {
      messageId: payload["Message-Id"] || payload["message-id"] || payload.messageId,
      from: payload.from || payload.sender,
      to: payload.recipient || payload.To || payload.to,
      subject: payload.subject || payload.Subject,
      bodyPlain: payload["body-plain"] || payload.bodyPlain || payload["stripped-text"],
      bodyHtml: payload["body-html"] || payload.bodyHtml || payload["stripped-html"],
      strippedText: payload["stripped-text"],
      strippedHtml: payload["stripped-html"],
      timestamp: payload.timestamp ? new Date(parseInt(payload.timestamp) * 1000).toISOString() : new Date().toISOString(),
      attachments: payload.attachments ? JSON.parse(payload.attachments) : [],
      headers: payload["message-headers"] ? JSON.parse(payload["message-headers"]) : {},
      inReplyTo: payload["In-Reply-To"] || payload["in-reply-to"],
      references: payload.References || payload.references,
    }

    console.log("[v0] Received incoming email:", {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
    })

    // Extract sender email address
    const senderMatch = emailData.from?.match(/<([^>]+)>/) || [null, emailData.from]
    const senderEmail = senderMatch[1] || emailData.from

    // Find the contact by email (using tenant-based schema)
    const { data: contact } = await supabase
      .from("contacts")
      .select("id, tenant_id")
      .eq("email", senderEmail?.toLowerCase())
      .single()

    // Store the incoming email in the database (using tenant-based schema)
    const { data: storedEmail, error: storeError } = await supabase
      .from("email_messages")
      .insert({
        message_id: emailData.messageId,
        contact_id: contact?.id || null,
        tenant_id: contact?.tenant_id || null,
        direction: "inbound",
        from_email: emailData.from,
        to_email: emailData.to,
        subject: emailData.subject,
        body_plain: emailData.bodyPlain,
        body_html: emailData.bodyHtml,
        stripped_text: emailData.strippedText,
        received_at: emailData.timestamp,
        in_reply_to: emailData.inReplyTo,
        references_header: emailData.references,
        attachments: emailData.attachments,
        mailgun_variables: {
          headers: emailData.headers,
        },
        status: "received",
      })
      .select()
      .single()

    if (storeError) {
      console.error("[v0] Error storing email:", storeError)
      // Don't fail the webhook, Mailgun will retry
    }

    // If we found a contact, update their last activity
    if (contact) {
      await supabase
        .from("contacts")
        .update({
          last_contact_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", contact.id)

      // Create a conversation event
      await supabase.from("conversation_events").insert({
        contact_id: contact.id,
        tenant_id: contact.tenant_id,
        event_type: "email_received",
        event_data: {
          email_id: storedEmail?.id,
          from: emailData.from,
          subject: emailData.subject,
          preview: emailData.strippedText?.substring(0, 200),
        },
      })

      // Create notification for the tenant users
      const { data: tenantUsers } = await supabase
        .from("tenant_users")
        .select("user_id")
        .eq("tenant_id", contact.tenant_id)

      if (tenantUsers && tenantUsers.length > 0) {
        const notifications = tenantUsers.map((tu) => ({
          tenant_id: contact.tenant_id,
          user_id: tu.user_id,
          title: "New Email Received",
          message: `${senderEmail} sent: ${emailData.subject || "(no subject)"}`,
          type: "info",
          contact_id: contact.id,
        }))

        await supabase.from("notifications").insert(notifications)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Email processed",
      emailId: storedEmail?.id,
      contactId: contact?.id,
    })
  } catch (error) {
    console.error("[v0] Error processing Mailgun webhook:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Handle GET requests (Mailgun sometimes sends verification requests)
export async function GET() {
  return NextResponse.json({ status: "ok", message: "Mailgun webhook endpoint active" })
}
