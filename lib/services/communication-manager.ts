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

// User preferences (would be stored in DB per user in production)
let userPreferences = {
  bookingLink: "https://thorne.ai/book/commander"
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
    console.log(`[Thorne Logic]: Booking node updated to ${newLink}`)
  },

  getBookingLink() {
    return userPreferences.bookingLink
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

    // For now, we'll store the message in the conversations table
    // In production, this would integrate with Mailgun/SendGrid
    const messageId = `msg-${Date.now()}`

    const newMessage: Message = {
      id: messageId,
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

    return { success: true, message: newMessage }
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
