import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

// Use service role for webhook operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Levenshtein distance for fuzzy string matching
function levenshteinDistance(str1: string, str2: string): number {
  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()
  const m = s1.length
  const n = s2.length
  
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))
  
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }
  return dp[m][n]
}

// Calculate similarity score (0 to 1, where 1 is exact match)
function nameSimilarity(name1: string, name2: string): number {
  if (!name1 || !name2) return 0
  const maxLen = Math.max(name1.length, name2.length)
  if (maxLen === 0) return 1
  const distance = levenshteinDistance(name1, name2)
  return 1 - distance / maxLen
}

// Find contact by fuzzy name matching
async function findContactByFuzzyName(senderName: string, senderEmail: string): Promise<{ id: string; tenant_id: string } | null> {
  // Parse sender name into parts
  const nameParts = senderName.split(/\s+/).filter(Boolean)
  const firstName = nameParts[0] || ""
  const lastName = nameParts.slice(1).join(" ") || ""
  
  // Extract domain from email for additional matching
  const emailDomain = senderEmail?.split("@")[1]?.toLowerCase()
  
  // Search for contacts with similar names
  const { data: candidates } = await supabase
    .from("contacts")
    .select("id, tenant_id, first_name, last_name, company, email")
    .or(`first_name.ilike.%${firstName.substring(0, 3)}%,last_name.ilike.%${lastName.substring(0, 3)}%`)
    .limit(50)
  
  if (!candidates || candidates.length === 0) return null
  
  // Score each candidate
  const scored = candidates.map(contact => {
    const contactFullName = `${contact.first_name || ""} ${contact.last_name || ""}`.trim()
    const fullNameScore = nameSimilarity(senderName, contactFullName)
    
    // Individual name part scores
    const firstNameScore = nameSimilarity(firstName, contact.first_name || "")
    const lastNameScore = nameSimilarity(lastName, contact.last_name || "")
    
    // Domain matching bonus (same company domain)
    const contactDomain = contact.email?.split("@")[1]?.toLowerCase()
    const domainBonus = contactDomain && emailDomain && contactDomain === emailDomain ? 0.2 : 0
    
    // Combined score with weights
    const score = Math.max(
      fullNameScore,
      (firstNameScore * 0.4 + lastNameScore * 0.6) // Weight last name higher
    ) + domainBonus
    
    return { contact, score }
  })
  
  // Sort by score descending and get best match
  scored.sort((a, b) => b.score - a.score)
  const bestMatch = scored[0]
  
  // Only return if score is above threshold (0.7 = 70% similar)
  if (bestMatch && bestMatch.score >= 0.7) {
    console.log(`[v0] Fuzzy name match: "${senderName}" matched to "${bestMatch.contact.first_name} ${bestMatch.contact.last_name}" (score: ${bestMatch.score.toFixed(2)})`)
    return { id: bestMatch.contact.id, tenant_id: bestMatch.contact.tenant_id }
  }
  
  console.log(`[v0] No fuzzy match found for "${senderName}" (best score: ${bestMatch?.score.toFixed(2) || 0})`)
  return null
}

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

// Handle tracking events (opens, clicks, bounces, etc.)
async function handleTrackingEvent(eventType: string, payload: Record<string, string>) {
  const messageId = payload["message-id"] || payload["Message-Id"] || payload.messageId
  const recipient = payload.recipient || payload.to

  if (!messageId) {
    console.warn("[v0] No message ID in tracking event")
    return null
  }

  // Map Mailgun event types to our status
  const statusMap: Record<string, string> = {
    "delivered": "delivered",
    "opened": "opened",
    "clicked": "clicked",
    "bounced": "bounced",
    "dropped": "failed",
    "complained": "complained",
    "unsubscribed": "unsubscribed",
  }

  const newStatus = statusMap[eventType]
  if (!newStatus) return null

  // Update email status
  const { data: email, error } = await supabase
    .from("email_messages")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
      mailgun_variables: supabase.rpc ? undefined : {
        last_event: eventType,
        last_event_at: new Date().toISOString(),
        ...(payload.url && { clicked_url: payload.url }),
      }
    })
    .eq("message_id", messageId)
    .select("id, contact_id, tenant_id")
    .single()

  if (error) {
    // Try matching by recipient email for outbound emails
    const { data: emailByRecipient } = await supabase
      .from("email_messages")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("to_email", recipient)
      .eq("direction", "outbound")
      .order("created_at", { ascending: false })
      .limit(1)
      .select("id, contact_id, tenant_id")
      .single()

    if (emailByRecipient) {
      return emailByRecipient
    }
    console.error("[v0] Error updating email status:", error)
    return null
  }

  // Create conversation event for significant events
  if (email?.contact_id && ["opened", "clicked", "bounced"].includes(eventType)) {
    await supabase.from("conversation_events").insert({
      contact_id: email.contact_id,
      tenant_id: email.tenant_id,
      event_type: `email_${eventType}`,
      event_data: {
        email_id: email.id,
        ...(payload.url && { url: payload.url }),
      },
    })

    // Update contact engagement for opens/clicks
    if (["opened", "clicked"].includes(eventType)) {
      await supabase
        .from("contacts")
        .update({
          last_contact_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", email.contact_id)
    }
  }

  return email
}

// Handle incoming email (stored message)
async function handleIncomingEmail(payload: Record<string, string>) {
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

  // Extract sender email and name
  const senderMatch = emailData.from?.match(/^(?:"?([^"<]+)"?\s*)?<?([^>]+)>?$/)
  const senderName = senderMatch?.[1]?.trim() || ""
  const senderEmail = senderMatch?.[2]?.trim() || emailData.from

  // Find the contact by email first (using tenant-based schema)
  let { data: contact } = await supabase
    .from("contacts")
    .select("id, tenant_id")
    .eq("email", senderEmail?.toLowerCase())
    .single()

  // If no exact email match and we have a sender name, try fuzzy name matching
  if (!contact && senderName) {
    contact = await findContactByFuzzyName(senderName, senderEmail)
  }

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

  return { storedEmail, contact }
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

    // Determine event type
    const eventType = payload.event || payload["event-data"]?.event || "stored"

    console.log("[v0] Mailgun webhook event:", eventType)

    // Handle different event types
    if (eventType === "stored" || payload["body-plain"] || payload.from) {
      // Incoming email
      const { storedEmail, contact } = await handleIncomingEmail(payload)
      return NextResponse.json({
        success: true,
        message: "Email processed",
        emailId: storedEmail?.id,
        contactId: contact?.id,
      })
    } else if (["delivered", "opened", "clicked", "bounced", "dropped", "complained", "unsubscribed"].includes(eventType)) {
      // Tracking event
      const email = await handleTrackingEvent(eventType, payload)
      return NextResponse.json({
        success: true,
        message: `Event ${eventType} processed`,
        emailId: email?.id,
      })
    } else {
      // Unknown event type, log and acknowledge
      console.log("[v0] Unknown Mailgun event type:", eventType, payload)
      return NextResponse.json({
        success: true,
        message: "Event acknowledged",
      })
    }
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
