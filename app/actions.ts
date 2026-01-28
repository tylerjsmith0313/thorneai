"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Contact, Deal, ContactStatus } from "@/types"

// CONTACT ACTIONS
export async function createContactAction(formData: {
  firstName: string
  lastName: string
  email: string
  company: string
  jobTitle?: string
  phone?: string
  source?: string
  status?: ContactStatus
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("contacts")
    .insert({
      user_id: user.id,
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      company: formData.company,
      job_title: formData.jobTitle,
      phone: formData.phone,
      source: formData.source,
      status: formData.status || "New",
      added_date: new Date().toISOString().split("T")[0],
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating contact:", error)
    return { error: error.message }
  }

  // Log activity
  await supabase.from("activities").insert({
    user_id: user.id,
    contact_id: data.id,
    type: "Human",
    title: "Contact Created",
    detail: `Added ${formData.firstName} ${formData.lastName} from ${formData.company}`,
  })

  revalidatePath("/")
  return { data }
}

export async function updateContactAction(
  id: string,
  updates: Partial<{
    firstName: string
    lastName: string
    email: string
    company: string
    jobTitle: string
    phone: string
    status: ContactStatus
    lastContactDate: string
  }>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Not authenticated" }
  }

  const updateData: Record<string, any> = {}
  if (updates.firstName !== undefined) updateData.first_name = updates.firstName
  if (updates.lastName !== undefined) updateData.last_name = updates.lastName
  if (updates.email !== undefined) updateData.email = updates.email
  if (updates.company !== undefined) updateData.company = updates.company
  if (updates.jobTitle !== undefined) updateData.job_title = updates.jobTitle
  if (updates.phone !== undefined) updateData.phone = updates.phone
  if (updates.status !== undefined) updateData.status = updates.status
  if (updates.lastContactDate !== undefined) updateData.last_contact_date = updates.lastContactDate

  const { data, error } = await supabase
    .from("contacts")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating contact:", error)
    return { error: error.message }
  }

  revalidatePath("/")
  return { data }
}

export async function deleteContactAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[v0] Error deleting contact:", error)
    return { error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}

// DEAL ACTIONS
export async function createDealAction(formData: {
  clientName: string
  amount: number
  contactId?: string
  expectedCloseDate: string
  isMonthlyRecurring?: boolean
  notes?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("deals")
    .insert({
      user_id: user.id,
      client_name: formData.clientName,
      amount: formData.amount,
      contact_id: formData.contactId,
      expected_close_date: formData.expectedCloseDate,
      is_monthly_recurring: formData.isMonthlyRecurring || false,
      notes: formData.notes,
      status: "open",
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating deal:", error)
    return { error: error.message }
  }

  // Log activity
  await supabase.from("activities").insert({
    user_id: user.id,
    deal_id: data.id,
    contact_id: formData.contactId,
    type: "Human",
    title: "Deal Created",
    detail: `New deal with ${formData.clientName} for $${formData.amount.toLocaleString()}`,
  })

  revalidatePath("/")
  return { data }
}

export async function updateDealStatusAction(
  id: string,
  status: "open" | "closed-won" | "closed-lost"
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Not authenticated" }
  }

  const updateData: Record<string, any> = { status }
  if (status === "closed-won" || status === "closed-lost") {
    updateData.actual_close_date = new Date().toISOString().split("T")[0]
  }

  const { data, error } = await supabase
    .from("deals")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating deal:", error)
    return { error: error.message }
  }

  // Log activity
  await supabase.from("activities").insert({
    user_id: user.id,
    deal_id: id,
    type: "Human",
    title: "Deal Status Updated",
    detail: `Deal marked as ${status}`,
  })

  revalidatePath("/")
  return { data }
}

// CONVERSATION ACTIONS
export async function createConversationAction(formData: {
  contactId: string
  channel: "Email" | "SMS" | "LinkedIn" | "WhatsApp" | "Phone"
  message: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: user.id,
      contact_id: formData.contactId,
      channel: formData.channel,
      status: "awaiting_reply",
      last_message: formData.message,
      last_active: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating conversation:", error)
    return { error: error.message }
  }

  // Create the first message
  await supabase.from("messages").insert({
    conversation_id: data.id,
    sender_type: "user",
    content: formData.message,
    message_type: formData.channel === "Email" ? "email" : formData.channel === "SMS" ? "sms" : "text",
  })

  // Update contact's last contact date
  await supabase
    .from("contacts")
    .update({ last_contact_date: new Date().toISOString() })
    .eq("id", formData.contactId)

  revalidatePath("/")
  return { data }
}

export async function sendMessageAction(
  conversationId: string,
  content: string,
  senderType: "user" | "thorne" = "user"
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_type: senderType,
      content: content,
      message_type: "text",
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error sending message:", error)
    return { error: error.message }
  }

  // Update conversation
  await supabase
    .from("conversations")
    .update({
      last_message: content,
      last_active: new Date().toISOString(),
      status: senderType === "user" ? "awaiting_reply" : "thorne_handling",
    })
    .eq("id", conversationId)

  revalidatePath("/")
  return { data }
}

// PRODUCT ACTIONS
export async function createProductAction(formData: {
  name: string
  pitchContext?: string
  classification: "SaaS" | "Service" | "Physical" | "Subscription" | "Consulting"
  retailPrice: number
  cost?: number
  billingInterval: "one-time" | "monthly" | "annual"
  isDeployed?: boolean
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      user_id: user.id,
      name: formData.name,
      pitch_context: formData.pitchContext,
      classification: formData.classification,
      retail_price: formData.retailPrice,
      cost: formData.cost,
      billing_interval: formData.billingInterval,
      is_deployed: formData.isDeployed || false,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating product:", error)
    return { error: error.message }
  }

  revalidatePath("/")
  return { data }
}

// BULK IMPORT ACTION
export async function bulkImportContactsAction(
  contacts: Array<{
    firstName: string
    lastName: string
    email: string
    company: string
    jobTitle?: string
    phone?: string
    source?: string
  }>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Not authenticated" }
  }

  const contactsToInsert = contacts.map((c) => ({
    user_id: user.id,
    first_name: c.firstName,
    last_name: c.lastName,
    email: c.email,
    company: c.company,
    job_title: c.jobTitle,
    phone: c.phone,
    source: c.source || "Bulk Import",
    status: "New" as const,
    added_date: new Date().toISOString().split("T")[0],
  }))

  const { data, error } = await supabase
    .from("contacts")
    .insert(contactsToInsert)
    .select()

  if (error) {
    console.error("[v0] Error bulk importing contacts:", error)
    return { error: error.message }
  }

  // Log activity
  await supabase.from("activities").insert({
    user_id: user.id,
    type: "System",
    title: "Bulk Import",
    detail: `Imported ${contacts.length} contacts`,
  })

  revalidatePath("/")
  return { data, count: data?.length || 0 }
}
