import { createClient } from "@/lib/supabase/client"
import type { Contact, Deal, Conversation, Product, KnowledgeSource, Activity, UserSettings } from "@/types"

// Transform database row (snake_case) to frontend type (camelCase)
function transformContact(row: any): Contact {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    company: row.company,
    jobTitle: row.job_title,
    phone: row.phone,
    address: row.address,
    status: row.status,
    source: row.source,
    engagementScore: row.engagement_score,
    isVerified: row.is_verified,
    addedDate: row.added_date,
    lastContactDate: row.last_contact_date,
  }
}

function transformDeal(row: any): Deal {
  return {
    id: row.id,
    contactId: row.contact_id,
    clientName: row.client_name,
    amount: parseFloat(row.amount),
    status: row.status,
    isMonthlyRecurring: row.is_monthly_recurring,
    expectedCloseDate: row.expected_close_date,
    actualCloseDate: row.actual_close_date,
    notes: row.notes,
    createdAt: row.created_at,
  }
}

function transformConversation(row: any): Conversation {
  return {
    id: row.id,
    contactId: row.contact_id,
    contactName: row.contact_name || `${row.contacts?.first_name || ''} ${row.contacts?.last_name || ''}`.trim(),
    channel: row.channel,
    status: row.status,
    unreadCount: row.unread_count,
    lastMessage: row.last_message,
    lastActive: row.last_active,
  }
}

function transformProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    pitchContext: row.pitch_context,
    classification: row.classification,
    retailPrice: parseFloat(row.retail_price),
    cost: row.cost ? parseFloat(row.cost) : undefined,
    volume: row.volume,
    billingInterval: row.billing_interval,
    isDeployed: row.is_deployed,
  }
}

function transformActivity(row: any): Activity {
  return {
    id: row.id,
    contactId: row.contact_id,
    dealId: row.deal_id,
    type: row.type,
    title: row.title,
    detail: row.detail,
    date: row.created_at,
    oldValue: row.old_value,
    newValue: row.new_value,
  }
}

// CONTACTS
export async function getContacts(): Promise<Contact[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching contacts:", error)
    return []
  }

  return (data || []).map(transformContact)
}

export async function getContact(id: string): Promise<Contact | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("[v0] Error fetching contact:", error)
    return null
  }

  return data ? transformContact(data) : null
}

export async function createContact(contact: Omit<Contact, "id">): Promise<Contact | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error("[v0] No authenticated user")
    return null
  }

  const { data, error } = await supabase
    .from("contacts")
    .insert({
      user_id: user.id,
      first_name: contact.firstName,
      last_name: contact.lastName,
      email: contact.email,
      company: contact.company,
      job_title: contact.jobTitle,
      phone: contact.phone,
      address: contact.address,
      status: contact.status || "New",
      source: contact.source,
      engagement_score: contact.engagementScore || 0,
      is_verified: contact.isVerified || false,
      added_date: contact.addedDate || new Date().toISOString().split("T")[0],
      last_contact_date: contact.lastContactDate,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating contact:", error)
    return null
  }

  return data ? transformContact(data) : null
}

export async function updateContact(id: string, updates: Partial<Contact>): Promise<Contact | null> {
  const supabase = createClient()
  
  const updateData: any = {}
  if (updates.firstName !== undefined) updateData.first_name = updates.firstName
  if (updates.lastName !== undefined) updateData.last_name = updates.lastName
  if (updates.email !== undefined) updateData.email = updates.email
  if (updates.company !== undefined) updateData.company = updates.company
  if (updates.jobTitle !== undefined) updateData.job_title = updates.jobTitle
  if (updates.phone !== undefined) updateData.phone = updates.phone
  if (updates.address !== undefined) updateData.address = updates.address
  if (updates.status !== undefined) updateData.status = updates.status
  if (updates.source !== undefined) updateData.source = updates.source
  if (updates.engagementScore !== undefined) updateData.engagement_score = updates.engagementScore
  if (updates.isVerified !== undefined) updateData.is_verified = updates.isVerified
  if (updates.lastContactDate !== undefined) updateData.last_contact_date = updates.lastContactDate

  const { data, error } = await supabase
    .from("contacts")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating contact:", error)
    return null
  }

  return data ? transformContact(data) : null
}

export async function deleteContact(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[v0] Error deleting contact:", error)
    return false
  }

  return true
}

// DEALS
export async function getDeals(): Promise<Deal[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching deals:", error)
    return []
  }

  return (data || []).map(transformDeal)
}

export async function createDeal(deal: Omit<Deal, "id" | "createdAt">): Promise<Deal | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error("[v0] No authenticated user")
    return null
  }

  const { data, error } = await supabase
    .from("deals")
    .insert({
      user_id: user.id,
      contact_id: deal.contactId,
      client_name: deal.clientName,
      amount: deal.amount,
      status: deal.status || "open",
      is_monthly_recurring: deal.isMonthlyRecurring || false,
      expected_close_date: deal.expectedCloseDate,
      actual_close_date: deal.actualCloseDate,
      notes: deal.notes,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating deal:", error)
    return null
  }

  return data ? transformDeal(data) : null
}

// CONVERSATIONS
export async function getConversations(): Promise<Conversation[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("conversations")
    .select(`
      *,
      contacts (first_name, last_name)
    `)
    .order("last_active", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching conversations:", error)
    return []
  }

  return (data || []).map(transformConversation)
}

export async function createConversation(contactId: string, channel: string, message: string): Promise<Conversation | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: user.id,
      contact_id: contactId,
      channel: channel,
      status: "awaiting_reply",
      last_message: message,
      last_active: new Date().toISOString(),
    })
    .select(`
      *,
      contacts (first_name, last_name)
    `)
    .single()

  if (error) {
    console.error("[v0] Error creating conversation:", error)
    return null
  }

  return data ? transformConversation(data) : null
}

// PRODUCTS
export async function getProducts(): Promise<Product[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching products:", error)
    return []
  }

  return (data || []).map(transformProduct)
}

export async function createProduct(product: Omit<Product, "id">): Promise<Product | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from("products")
    .insert({
      user_id: user.id,
      name: product.name,
      pitch_context: product.pitchContext,
      classification: product.classification,
      retail_price: product.retailPrice,
      cost: product.cost,
      volume: product.volume,
      billing_interval: product.billingInterval,
      is_deployed: product.isDeployed,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating product:", error)
    return null
  }

  return data ? transformProduct(data) : null
}

// ACTIVITIES
export async function getActivities(limit = 50): Promise<Activity[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[v0] Error fetching activities:", error)
    return []
  }

  return (data || []).map(transformActivity)
}

export async function createActivity(activity: Omit<Activity, "id" | "date">): Promise<Activity | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from("activities")
    .insert({
      user_id: user.id,
      contact_id: activity.contactId,
      deal_id: activity.dealId,
      type: activity.type,
      title: activity.title,
      detail: activity.detail,
      old_value: activity.oldValue,
      new_value: activity.newValue,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating activity:", error)
    return null
  }

  return data ? transformActivity(data) : null
}

// DASHBOARD STATS
export async function getDashboardStats() {
  const supabase = createClient()
  
  const [contactsRes, dealsRes, conversationsRes] = await Promise.all([
    supabase.from("contacts").select("*"),
    supabase.from("deals").select("*"),
    supabase.from("conversations").select("*"),
  ])

  const contacts = (contactsRes.data || []).map(transformContact)
  const deals = (dealsRes.data || []).map(transformDeal)
  const conversations = (conversationsRes.data || []).map(transformConversation)

  // Calculate stats
  const closedWonDeals = deals.filter(d => d.status === "closed-won")
  const totalIncome = closedWonDeals.reduce((sum, d) => sum + d.amount, 0)
  const openDeals = deals.filter(d => d.status === "open")
  const pipelineValue = openDeals.reduce((sum, d) => sum + d.amount, 0)
  
  const witheringContacts = contacts.filter(c => c.status === "Withering")
  const deadContacts = contacts.filter(c => c.status === "Dead")
  const newContacts = contacts.filter(c => c.status === "New")
  const hotContacts = contacts.filter(c => c.status === "Hot")
  
  const activeConversations = conversations.filter(c => c.status !== "responded")
  const thorneManaged = conversations.filter(c => c.status === "thorne_handling")

  return {
    contacts,
    deals,
    conversations,
    stats: {
      totalIncome,
      pipelineValue,
      totalContacts: contacts.length,
      newContacts: newContacts.length,
      hotContacts: hotContacts.length,
      witheringContacts: witheringContacts.length,
      deadContacts: deadContacts.length,
      openDeals: openDeals.length,
      closedWonDeals: closedWonDeals.length,
      closedLostDeals: deals.filter(d => d.status === "closed-lost").length,
      activeConversations: activeConversations.length,
      thorneManaged: thorneManaged.length,
    }
  }
}
