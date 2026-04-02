"use server"

import { createClient } from "@/lib/supabase/server"

interface EmailConfig {
  apiKey: string
  domain: string
  fromEmail: string
}

interface SendEmailParams {
  to: string
  subject: string
  text: string
  html?: string
  contactId?: string
  trackOpens?: boolean
  trackClicks?: boolean
  tags?: string[]
}

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Fetches Mailgun credentials - checks user_integrations first, then falls back to env vars
 */
async function getMailgunConfig(): Promise<EmailConfig | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // Fall back to environment variables if no user
    if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN && process.env.MAILGUN_FROM_EMAIL) {
      return {
        apiKey: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
        fromEmail: process.env.MAILGUN_FROM_EMAIL,
      }
    }
    return null
  }

  // Check user-specific integrations first
  const { data: userIntegrations } = await supabase
    .from("user_integrations")
    .select("mailgun_api_key, mailgun_domain, mailgun_from_email, mailgun_enabled")
    .eq("user_id", user.id)
    .single()

  if (userIntegrations?.mailgun_enabled && userIntegrations?.mailgun_api_key) {
    return {
      apiKey: userIntegrations.mailgun_api_key,
      domain: userIntegrations.mailgun_domain,
      fromEmail: userIntegrations.mailgun_from_email,
    }
  }

  // Fall back to environment variables
  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN && process.env.MAILGUN_FROM_EMAIL) {
    return {
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
      fromEmail: process.env.MAILGUN_FROM_EMAIL,
    }
  }

  return null
}

/**
 * Sends an email via Mailgun
 */
export async function sendEmail(params: SendEmailParams): Promise<EmailResult> {
  const config = await getMailgunConfig()
  
  if (!config) {
    console.error("[v0] Mailgun not configured")
    return { success: false, error: "Email service not configured. Please set up Mailgun in Integrations." }
  }

  try {
    const formData = new FormData()
    formData.append("from", config.fromEmail)
    formData.append("to", params.to)
    formData.append("subject", params.subject)
    formData.append("text", params.text)
    if (params.html) formData.append("html", params.html)
    if (params.trackOpens) formData.append("o:tracking-opens", "yes")
    if (params.trackClicks) formData.append("o:tracking-clicks", "yes")
    if (params.tags?.length) {
      params.tags.forEach(tag => formData.append("o:tag", tag))
    }

    const response = await fetch(
      `https://api.mailgun.net/v3/${config.domain}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${config.apiKey}`).toString("base64")}`,
        },
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] Mailgun send failed:", error)
      return { success: false, error: `Failed to send email: ${error}` }
    }

    const data = await response.json()
    
    // Log the communication if contactId provided
    if (params.contactId) {
      await logEmailCommunication(
        params.contactId, 
        params.subject, 
        params.text, 
        params.to,
        config.fromEmail,
        data.id
      )
    }
    
    return { success: true, messageId: data.id }
  } catch (error) {
    console.error("[v0] Email service error:", error)
    return { success: false, error: String(error) }
  }
}

/**
 * Log email communication to database - stores in both contact_communications AND email_messages
 */
async function logEmailCommunication(
  contactId: string, 
  subject: string, 
  content: string, 
  toEmail: string,
  fromEmail: string,
  mailgunId?: string
): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  // Get tenant_id for this contact
  const { data: contact } = await supabase
    .from("contacts")
    .select("tenant_id")
    .eq("id", contactId)
    .single()

  // Log to contact_communications (legacy table)
  await supabase.from("contact_communications").insert({
    contact_id: contactId,
    user_id: user.id,
    channel: "email",
    direction: "outbound",
    subject: subject,
    content: content,
    status: "sent",
    metadata: mailgunId ? { mailgun_id: mailgunId } : {}
  })

  // Also log to email_messages table (with full from/to email addresses)
  await supabase.from("email_messages").insert({
    message_id: mailgunId,
    contact_id: contactId,
    tenant_id: contact?.tenant_id || null,
    direction: "outbound",
    from_email: fromEmail,
    to_email: toEmail,
    subject: subject,
    body_plain: content,
    status: "sent",
    received_at: new Date().toISOString(),
  })
  
  // Update contact's last_contact_date
  await supabase
    .from("contacts")
    .update({ last_contact_date: new Date().toISOString().split("T")[0] })
    .eq("id", contactId)
}

/**
 * Check if email service is configured
 */
export async function isEmailConfigured(): Promise<boolean> {
  const config = await getMailgunConfig()
  return config !== null
}

/**
 * Send a templated email (booking link, follow-up, etc.)
 */
export async function sendTemplatedEmail(
  template: "booking_link" | "follow_up" | "case_study" | "introduction",
  to: string,
  contactId: string,
  variables: Record<string, string>
): Promise<EmailResult> {
  const templates: Record<string, { subject: string; text: string }> = {
    booking_link: {
      subject: `Meeting Request: ${variables.companyName || "Connect"}`,
      text: `Hi ${variables.firstName},\n\nI'd like to find some time for us to connect further. You can view my real-time availability and grab a slot that works for you here:\n\n${variables.bookingLink}\n\nLooking forward to it,\n${variables.senderName || "Thorne Intelligence"}`
    },
    follow_up: {
      subject: `Following up - ${variables.topic || "Our conversation"}`,
      text: `Hi ${variables.firstName},\n\nI wanted to follow up on our previous conversation about ${variables.topic}.\n\n${variables.customMessage || "Let me know if you have any questions or if there's anything else I can help with."}\n\nBest,\n${variables.senderName || "Thorne Intelligence"}`
    },
    case_study: {
      subject: `${variables.industry || "Industry"} Success Story - Thought you'd find this valuable`,
      text: `Hi ${variables.firstName},\n\nI came across this case study that I thought would be relevant to ${variables.companyName || "your business"}:\n\n${variables.caseStudyLink || "[Case Study Link]"}\n\nThe results they achieved might be applicable to your situation. Would love to discuss how we could help you achieve similar outcomes.\n\nBest,\n${variables.senderName || "Thorne Intelligence"}`
    },
    introduction: {
      subject: `Introduction: ${variables.senderName || "Thorne"} - ${variables.valueProposition || "Partnership Opportunity"}`,
      text: `Hi ${variables.firstName},\n\nI hope this message finds you well. My name is ${variables.senderName || "Thorne"}, and I'm reaching out because ${variables.reason || "I believe there's an opportunity for us to work together"}.\n\n${variables.customMessage || "I'd love to learn more about your current initiatives and explore how we might be able to help."}\n\nWould you be open to a brief conversation this week?\n\nBest,\n${variables.senderName || "Thorne Intelligence"}`
    }
  }

  const template_data = templates[template]
  if (!template_data) {
    return { success: false, error: "Invalid template" }
  }

  return sendEmail({
    to,
    subject: template_data.subject,
    text: template_data.text,
    contactId,
    trackOpens: true,
    trackClicks: true,
    tags: [template, "automated"]
  })
}

/**
 * Verify email address format and domain
 */
export async function verifyEmailAddress(email: string): Promise<{
  valid: boolean
  deliverable: boolean
  reason?: string
}> {
  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, deliverable: false, reason: "Invalid email format" }
  }

  const domain = email.split("@")[1]
  
  // Check for common disposable email domains
  const disposableDomains = [
    "tempmail.com", "throwaway.com", "mailinator.com", "guerrillamail.com",
    "10minutemail.com", "fakeinbox.com", "trashmail.com"
  ]
  
  if (disposableDomains.includes(domain.toLowerCase())) {
    return { valid: true, deliverable: false, reason: "Disposable email address" }
  }

  // Check for catch-all business email indicators (basic heuristic)
  const genericPrefixes = ["info", "contact", "hello", "support", "sales", "admin"]
  const prefix = email.split("@")[0].toLowerCase()
  
  const isGeneric = genericPrefixes.includes(prefix)

  // For now, assume deliverable if format is valid
  // In production, you'd integrate with a service like ZeroBounce, Hunter, or Mailgun's validation API
  return { 
    valid: true, 
    deliverable: true,
    reason: isGeneric ? "Generic business email - may have lower engagement" : undefined
  }
}

/**
 * Bulk verify multiple email addresses
 */
export async function bulkVerifyEmails(emails: string[]): Promise<Map<string, { valid: boolean; deliverable: boolean; reason?: string }>> {
  const results = new Map()
  
  for (const email of emails) {
    const result = await verifyEmailAddress(email)
    results.set(email, result)
  }
  
  return results
}

/**
 * Reply to an existing email thread
 */
export async function replyToEmail(params: {
  originalMessageId: string
  to: string
  subject: string
  text: string
  html?: string
  contactId?: string
}): Promise<EmailResult> {
  const config = await getMailgunConfig()
  
  if (!config) {
    return { success: false, error: "Email service not configured" }
  }

  try {
    const formData = new FormData()
    formData.append("from", config.fromEmail)
    formData.append("to", params.to)
    formData.append("subject", params.subject.startsWith("Re:") ? params.subject : `Re: ${params.subject}`)
    formData.append("text", params.text)
    if (params.html) formData.append("html", params.html)
    
    // Add threading headers
    formData.append("h:In-Reply-To", params.originalMessageId)
    formData.append("h:References", params.originalMessageId)
    
    // Enable tracking
    formData.append("o:tracking-opens", "yes")
    formData.append("o:tracking-clicks", "yes")

    const response = await fetch(
      `https://api.mailgun.net/v3/${config.domain}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${config.apiKey}`).toString("base64")}`,
        },
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] Mailgun reply failed:", error)
      return { success: false, error: `Failed to send reply: ${error}` }
    }

    const data = await response.json()
    
  if (params.contactId) {
    await logEmailCommunication(
      params.contactId, 
      params.subject, 
      params.text, 
      params.to,
      config.fromEmail,
      data.id
    )
  }
    
    return { success: true, messageId: data.id }
  } catch (error) {
    console.error("[v0] Reply email error:", error)
    return { success: false, error: String(error) }
  }
}

/**
 * Get email thread/conversation for a contact
 */
export async function getEmailThread(contactId: string): Promise<{
  emails: Array<{
    id: string
    direction: "inbound" | "outbound"
    from: string
    to: string
    subject: string
    bodyPlain?: string
    bodyHtml?: string
    status: string
    receivedAt: string
  }>
  count: number
}> {
  const supabase = await createClient()
  
  const { data: emails, error } = await supabase
    .from("email_messages")
    .select("*")
    .eq("contact_id", contactId)
    .order("received_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching email thread:", error)
    return { emails: [], count: 0 }
  }

  return {
    emails: (emails || []).map(e => ({
      id: e.id,
      direction: e.direction,
      from: e.from_email,
      to: e.to_email,
      subject: e.subject,
      bodyPlain: e.body_plain,
      bodyHtml: e.body_html,
      status: e.status,
      receivedAt: e.received_at || e.created_at,
    })),
    count: emails?.length || 0
  }
}

/**
 * Get email stats for a contact
 */
export async function getContactEmailStats(contactId: string): Promise<{
  totalSent: number
  totalReceived: number
  openRate: number
  clickRate: number
  lastEmailDate?: string
}> {
  const supabase = await createClient()
  
  const { data: emails } = await supabase
    .from("email_messages")
    .select("direction, status, received_at")
    .eq("contact_id", contactId)

  if (!emails || emails.length === 0) {
    return { totalSent: 0, totalReceived: 0, openRate: 0, clickRate: 0 }
  }

  const sent = emails.filter(e => e.direction === "outbound")
  const received = emails.filter(e => e.direction === "inbound")
  const opened = sent.filter(e => e.status === "opened" || e.status === "clicked")
  const clicked = sent.filter(e => e.status === "clicked")

  const sortedEmails = [...emails].sort((a, b) => 
    new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
  )

  return {
    totalSent: sent.length,
    totalReceived: received.length,
    openRate: sent.length > 0 ? (opened.length / sent.length) * 100 : 0,
    clickRate: sent.length > 0 ? (clicked.length / sent.length) * 100 : 0,
    lastEmailDate: sortedEmails[0]?.received_at,
  }
}

/**
 * Schedule an email to be sent later
 */
export async function scheduleEmail(params: {
  to: string
  subject: string
  text: string
  html?: string
  contactId: string
  scheduledFor: Date
}): Promise<{ success: boolean; taskId?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // Get user's tenant
  const { data: tenantUser } = await supabase
    .from("tenant_users")
    .select("tenant_id")
    .eq("user_id", user.id)
    .single()

  const { data: task, error } = await supabase
    .from("scheduled_tasks")
    .insert({
      tenant_id: tenantUser?.tenant_id,
      contact_id: params.contactId,
      task_type: "send_email",
      payload: {
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
      },
      scheduled_for: params.scheduledFor.toISOString(),
      created_by: user.id,
    })
    .select("id")
    .single()

  if (error) {
    console.error("[v0] Error scheduling email:", error)
    return { success: false, error: "Failed to schedule email" }
  }

  return { success: true, taskId: task?.id }
}

/**
 * Cancel a scheduled email
 */
export async function cancelScheduledEmail(taskId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("scheduled_tasks")
    .update({ status: "cancelled" })
    .eq("id", taskId)
    .eq("task_type", "send_email")
    .eq("status", "pending")

  if (error) {
    console.error("[v0] Error cancelling scheduled email:", error)
    return { success: false, error: "Failed to cancel scheduled email" }
  }

  return { success: true }
}
