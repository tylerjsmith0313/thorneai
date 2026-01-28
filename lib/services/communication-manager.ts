"use server"

import { createClient } from "@/lib/supabase/server"

// Types
interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  company: string
}

interface Message {
  id: string
  sender: "thorne" | "contact"
  text: string
  timestamp: string
  type: "email" | "sms" | "linkedin"
}

interface MailgunConfig {
  apiKey: string
  domain: string
  fromEmail: string
  enabled: boolean
}

// User preferences (would be stored in DB per user in production)
let userPreferences = {
  bookingLink: "https://thorne.ai/book/commander"
}

/**
 * Fetches Mailgun credentials - checks user_integrations first, then falls back to env vars
 */
async function getMailgunConfig(): Promise<MailgunConfig | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // Fall back to environment variables if no user
    if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN && process.env.MAILGUN_FROM_EMAIL) {
      return {
        apiKey: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
        fromEmail: process.env.MAILGUN_FROM_EMAIL,
        enabled: true
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
      enabled: userIntegrations.mailgun_enabled
    }
  }

  // Fall back to environment variables
  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN && process.env.MAILGUN_FROM_EMAIL) {
    return {
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
      fromEmail: process.env.MAILGUN_FROM_EMAIL,
      enabled: true
    }
  }

  return null
}

/**
 * Sends email via Mailgun
 */
async function sendViaMailgun(
  config: MailgunConfig,
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const formData = new FormData()
    formData.append("from", config.fromEmail)
    formData.append("to", to)
    formData.append("subject", subject)
    formData.append("text", text)
    if (html) formData.append("html", html)

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
      console.error("[Thorne] Mailgun send failed:", error)
      return { success: false, error }
    }

    const data = await response.json()
    return { success: true, messageId: data.id }
  } catch (error) {
    console.error("[Thorne] Mailgun error:", error)
    return { success: false, error: String(error) }
  }
}

/**
 * Thorne Communication Logic Hub
 * Manages the bidirectional flow of data between email service and Contact Profiles.
 */
export const communicationManager = {
  /**
   * Updates the global booking link used in outreach scripts.
   */
  updateBookingLink(newLink: string) {
    userPreferences.bookingLink = newLink
  },

  getBookingLink() {
    return userPreferences.bookingLink
  },

  /**
   * Checks if Mailgun is configured and enabled
   */
  async isMailgunEnabled(): Promise<boolean> {
    const config = await getMailgunConfig()
    return config !== null && config.enabled
  },

  /**
   * Dispatches a message via email and updates internal Thorne records.
   */
  async sendMessage(
    contact: Contact,
    text: string,
    subject: string = "Follow up from Thorne Intelligence"
  ) {
    const supabase = await createClient()
    const mailgunConfig = await getMailgunConfig()

    const messageId = `msg-${Date.now()}`
    let emailSent = false
    let mailgunMessageId: string | undefined

    // Try to send via Mailgun if configured
    if (mailgunConfig && contact.email) {
      const result = await sendViaMailgun(
        mailgunConfig,
        contact.email,
        subject,
        text
      )
      emailSent = result.success
      mailgunMessageId = result.messageId
    }

    const newMessage: Message = {
      id: mailgunMessageId || messageId,
      sender: "thorne",
      text: text,
      timestamp: new Date().toISOString(),
      type: "email",
    }

    // Find or create conversation
    const { data: existingConv } = await supabase
      .from("conversations")
      .select("*")
      .eq("contact_id", contact.id)
      .single()

    if (existingConv) {
      // Update existing conversation
      const messages = existingConv.messages || []
      await supabase
        .from("conversations")
        .update({
          messages: [...messages, newMessage],
          last_message: text,
          last_active: new Date().toISOString(),
          status: "thorne_handling",
        })
        .eq("id", existingConv.id)
    } else {
      // Create new conversation
      await supabase.from("conversations").insert({
        contact_id: contact.id,
        contact_name: `${contact.firstName} ${contact.lastName}`,
        last_message: text,
        last_active: new Date().toISOString(),
        status: "thorne_handling",
        channel: "Email",
        unread_count: 0,
        messages: [newMessage],
      })
    }

    // Also log to contact_communications table
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from("contact_communications").insert({
        contact_id: contact.id,
        user_id: user.id,
        channel: "email",
        direction: "outbound",
        subject: subject,
        content: text,
        status: emailSent ? "sent" : "pending",
        metadata: mailgunMessageId ? { mailgun_id: mailgunMessageId } : {}
      })
    }

    return { 
      success: true, 
      message: newMessage, 
      emailSent,
      mailgunMessageId 
    }
  },

  /**
   * Specifically handles sending the user's booking link to a contact.
   */
  async sendBookingLink(contact: Contact) {
    const link = this.getBookingLink()
    const body = `Hi ${contact.firstName},\n\nI'd like to find some time for us to connect further. You can view my real-time availability and grab a slot that works for you here:\n\n${link}\n\nLooking forward to it,\nThorne Intelligence Core`
    return await this.sendMessage(
      contact,
      body,
      `Meeting Request: Thorne x ${contact.company}`
    )
  },

  /**
   * Sends a custom email with HTML support
   */
  async sendCustomEmail(
    contact: Contact,
    subject: string,
    text: string,
    html?: string
  ) {
    const mailgunConfig = await getMailgunConfig()
    
    if (!mailgunConfig || !contact.email) {
      return { success: false, error: "Mailgun not configured or no email" }
    }

    return await sendViaMailgun(mailgunConfig, contact.email, subject, text, html)
  },

  /**
   * Ingests incoming webhooks from email service.
   */
  async ingestIncomingCommunication(payload: {
    from: string
    body: string
    timestamp: string
  }) {
    const supabase = await createClient()

    const senderEmail =
      payload.from.match(/<(.+)>|(\S+@\S+)/)?.[1] || payload.from

    // Find contact by email
    const { data: contact } = await supabase
      .from("contacts")
      .select("*")
      .eq("email", senderEmail.toLowerCase())
      .single()

    if (!contact) return null

    const incomingMsg: Message = {
      id: `in-${Date.now()}`,
      sender: "contact",
      text: payload.body,
      timestamp: new Date(payload.timestamp).toISOString(),
      type: "email",
    }

    // Update conversation
    const { data: conv } = await supabase
      .from("conversations")
      .select("*")
      .eq("contact_id", contact.id)
      .single()

    if (conv) {
      const messages = conv.messages || []
      await supabase
        .from("conversations")
        .update({
          messages: [...messages, incomingMsg],
          last_message: payload.body,
          last_active: new Date().toISOString(),
          status: "awaiting_reply",
          unread_count: (conv.unread_count || 0) + 1,
        })
        .eq("id", conv.id)
    }

    return { contact, message: incomingMsg }
  },
}
