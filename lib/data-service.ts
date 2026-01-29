import { createClient } from "@/lib/supabase/client"
import type { Contact, Deal, Conversation, Product, KnowledgeSource, Activity, UserSettings } from "@/types"

// Data Service - Central data access layer for AgyntOS
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
    industry: row.industry,
    // Address
    address: row.address,
    streetAddress: row.street_address,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    country: row.country,
    // Social media
    linkedinUrl: row.linkedin_url,
    twitterHandle: row.twitter_handle,
    instagramHandle: row.instagram_handle,
    facebookUrl: row.facebook_url,
    youtubeUrl: row.youtube_url,
    tiktokHandle: row.tiktok_handle,
    websiteUrl: row.website_url,
    // Profile/summary
    interests: row.interests || [],
    hobbies: row.hobbies || [],
    notes: row.notes,
    demeanor: row.demeanor,
    communicationPace: row.communication_pace,
    preferredChannel: row.preferred_channel,
    outreachBudget: row.outreach_budget,
    outreachChannels: row.outreach_channels || [],
    // Status
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
  // Basic info
  if (updates.firstName !== undefined) updateData.first_name = updates.firstName
  if (updates.lastName !== undefined) updateData.last_name = updates.lastName
  if (updates.email !== undefined) updateData.email = updates.email
  if (updates.company !== undefined) updateData.company = updates.company
  if (updates.jobTitle !== undefined) updateData.job_title = updates.jobTitle
  if (updates.phone !== undefined) updateData.phone = updates.phone
  if (updates.industry !== undefined) updateData.industry = updates.industry
  // Address
  if (updates.address !== undefined) updateData.address = updates.address
  if (updates.streetAddress !== undefined) updateData.street_address = updates.streetAddress
  if (updates.city !== undefined) updateData.city = updates.city
  if (updates.state !== undefined) updateData.state = updates.state
  if (updates.zipCode !== undefined) updateData.zip_code = updates.zipCode
  if (updates.country !== undefined) updateData.country = updates.country
  // Social media
  if (updates.linkedinUrl !== undefined) updateData.linkedin_url = updates.linkedinUrl
  if (updates.twitterHandle !== undefined) updateData.twitter_handle = updates.twitterHandle
  if (updates.instagramHandle !== undefined) updateData.instagram_handle = updates.instagramHandle
  if (updates.facebookUrl !== undefined) updateData.facebook_url = updates.facebookUrl
  if (updates.youtubeUrl !== undefined) updateData.youtube_url = updates.youtubeUrl
  if (updates.tiktokHandle !== undefined) updateData.tiktok_handle = updates.tiktokHandle
  if (updates.websiteUrl !== undefined) updateData.website_url = updates.websiteUrl
  // Profile/summary
  if (updates.interests !== undefined) updateData.interests = updates.interests
  if (updates.hobbies !== undefined) updateData.hobbies = updates.hobbies
  if (updates.notes !== undefined) updateData.notes = updates.notes
  if (updates.demeanor !== undefined) updateData.demeanor = updates.demeanor
  if (updates.communicationPace !== undefined) updateData.communication_pace = updates.communicationPace
  if (updates.preferredChannel !== undefined) updateData.preferred_channel = updates.preferredChannel
  if (updates.outreachBudget !== undefined) updateData.outreach_budget = updates.outreachBudget
  if (updates.outreachChannels !== undefined) updateData.outreach_channels = updates.outreachChannels
  // Status
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

// ============================================================================
// CONTACT ACTIVITIES
// Used by history-section.tsx for tracking contact interactions
// Exports: ContactActivity (type), getContactActivities, createContactActivity
// ============================================================================

export type ContactActivityType = 'email' | 'call' | 'meeting' | 'note' | 'task' | 'gift' | 'other'

export interface ContactActivity {
  id: string
  contactId: string
  type: ContactActivityType
  title: string
  description?: string
  date: string
  metadata?: Record<string, unknown>
}

export async function getContactActivities(contactId: string): Promise<ContactActivity[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("Error fetching contact activities:", error)
    return []
  }

  return (data || []).map((item) => ({
    id: item.id,
    contactId: item.contact_id,
    type: (item.type as ContactActivityType) || "other",
    title: item.title || "",
    description: item.detail || "",
    date: item.created_at,
    metadata: {},
  }))
}

export async function createContactActivity(
  activity: Omit<ContactActivity, "id" | "date">
): Promise<ContactActivity | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from("activities")
    .insert({
      user_id: user.id,
      contact_id: activity.contactId,
      type: activity.type,
      title: activity.title,
      detail: activity.description,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating contact activity:", error)
    return null
  }

  return data
    ? {
        id: data.id,
        contactId: data.contact_id,
        type: (data.type as ContactActivityType) || "other",
        title: data.title || "",
        description: data.detail || "",
        date: data.created_at,
        metadata: {},
      }
    : null
}

// CALENDAR EVENTS
export interface CalendarEvent {
  id: string
  tenantId?: string
  userId: string
  contactId?: string
  title: string
  description?: string
  eventType: 'meeting' | 'call' | 'zoom' | 'task' | 'reminder' | 'follow_up'
  startTime: string
  endTime?: string
  durationMinutes: number
  location?: string
  meetingUrl?: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  attendees?: any[]
  heatScore?: number
  notes?: string
  reminderSent?: boolean
  createdAt?: string
  updatedAt?: string
}

function transformCalendarEvent(row: any): CalendarEvent {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    userId: row.user_id,
    contactId: row.contact_id,
    title: row.title,
    description: row.description,
    eventType: row.event_type,
    startTime: row.start_time,
    endTime: row.end_time,
    durationMinutes: row.duration_minutes || 30,
    location: row.location,
    meetingUrl: row.meeting_url,
    status: row.status,
    attendees: row.attendees || [],
    heatScore: row.heat_score,
    notes: row.notes,
    reminderSent: row.reminder_sent,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getCalendarEvents(startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
  const supabase = createClient()
  let query = supabase
    .from("calendar_events")
    .select("*")
    .order("start_time", { ascending: true })

  if (startDate) {
    query = query.gte("start_time", startDate.toISOString())
  }
  if (endDate) {
    query = query.lte("start_time", endDate.toISOString())
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching calendar events:", error)
    return []
  }

  return (data || []).map(transformCalendarEvent)
}

export async function createCalendarEvent(event: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">): Promise<CalendarEvent | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error("[v0] No authenticated user")
    return null
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      user_id: user.id,
      contact_id: event.contactId,
      title: event.title,
      description: event.description,
      event_type: event.eventType,
      start_time: event.startTime,
      end_time: event.endTime,
      duration_minutes: event.durationMinutes || 30,
      location: event.location,
      meeting_url: event.meetingUrl,
      status: event.status || 'scheduled',
      attendees: event.attendees || [],
      heat_score: event.heatScore || 50,
      notes: event.notes,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating calendar event:", error)
    return null
  }

  return data ? transformCalendarEvent(data) : null
}

export async function updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
  const supabase = createClient()
  
  const updateData: any = {}
  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.eventType !== undefined) updateData.event_type = updates.eventType
  if (updates.startTime !== undefined) updateData.start_time = updates.startTime
  if (updates.endTime !== undefined) updateData.end_time = updates.endTime
  if (updates.durationMinutes !== undefined) updateData.duration_minutes = updates.durationMinutes
  if (updates.location !== undefined) updateData.location = updates.location
  if (updates.meetingUrl !== undefined) updateData.meeting_url = updates.meetingUrl
  if (updates.status !== undefined) updateData.status = updates.status
  if (updates.attendees !== undefined) updateData.attendees = updates.attendees
  if (updates.heatScore !== undefined) updateData.heat_score = updates.heatScore
  if (updates.notes !== undefined) updateData.notes = updates.notes
  if (updates.contactId !== undefined) updateData.contact_id = updates.contactId
  updateData.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from("calendar_events")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating calendar event:", error)
    return null
  }

  return data ? transformCalendarEvent(data) : null
}

export async function deleteCalendarEvent(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from("calendar_events")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[v0] Error deleting calendar event:", error)
    return false
  }

  return true
}

// CONTACT RESEARCH
export interface ContactResearch {
  id: string
  tenantId?: string
  contactId: string
  source: string
  sourceType: 'linkedin' | 'press_release' | 'email_verification' | 'company_news' | 'social_media' | 'manual' | 'api'
  status: 'verified' | 'pending' | 'rejected' | 'needs_review'
  detail?: string
  sourceUrl?: string
  verifiedAt?: string
  verifiedBy?: string
  createdAt?: string
  updatedAt?: string
}

function transformContactResearch(row: any): ContactResearch {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    contactId: row.contact_id,
    source: row.source,
    sourceType: row.source_type,
    status: row.status,
    detail: row.detail,
    sourceUrl: row.source_url,
    verifiedAt: row.verified_at,
    verifiedBy: row.verified_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getContactResearch(contactId: string): Promise<ContactResearch[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("contact_research")
    .select("*")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching contact research:", error)
    return []
  }

  return (data || []).map(transformContactResearch)
}

export async function createContactResearch(research: Omit<ContactResearch, "id" | "createdAt" | "updatedAt">): Promise<ContactResearch | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from("contact_research")
    .insert({
      contact_id: research.contactId,
      source: research.source,
      source_type: research.sourceType,
      status: research.status || 'verified',
      detail: research.detail,
      source_url: research.sourceUrl,
      verified_at: research.status === 'verified' ? new Date().toISOString() : null,
      verified_by: research.status === 'verified' ? user.id : null,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating contact research:", error)
    return null
  }

  return data ? transformContactResearch(data) : null
}

export async function updateContactResearch(id: string, updates: Partial<ContactResearch>): Promise<ContactResearch | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const updateData: any = { updated_at: new Date().toISOString() }
  if (updates.source !== undefined) updateData.source = updates.source
  if (updates.sourceType !== undefined) updateData.source_type = updates.sourceType
  if (updates.status !== undefined) {
    updateData.status = updates.status
    if (updates.status === 'verified' && user) {
      updateData.verified_at = new Date().toISOString()
      updateData.verified_by = user.id
    }
  }
  if (updates.detail !== undefined) updateData.detail = updates.detail
  if (updates.sourceUrl !== undefined) updateData.source_url = updates.sourceUrl

  const { data, error } = await supabase
    .from("contact_research")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating contact research:", error)
    return null
  }

  return data ? transformContactResearch(data) : null
}

export async function deleteContactResearch(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from("contact_research")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[v0] Error deleting contact research:", error)
    return false
  }

  return true
}

// OPPORTUNITIES
export interface Opportunity {
  id: string
  tenantId?: string
  userId: string
  contactId?: string
  title: string
  description?: string
  value: number
  currency: string
  stage: 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  probability: number
  expectedCloseDate?: string
  actualCloseDate?: string
  productId?: string
  notes?: string
  heatStatus: 'hot' | 'warm' | 'cold'
  createdAt?: string
  updatedAt?: string
}

function transformOpportunity(row: any): Opportunity {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    userId: row.user_id,
    contactId: row.contact_id,
    title: row.title,
    description: row.description,
    value: parseFloat(row.value) || 0,
    currency: row.currency || 'USD',
    stage: row.stage,
    probability: row.probability || 50,
    expectedCloseDate: row.expected_close_date,
    actualCloseDate: row.actual_close_date,
    productId: row.product_id,
    notes: row.notes,
    heatStatus: row.heat_status || 'warm',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getOpportunities(contactId?: string): Promise<Opportunity[]> {
  const supabase = createClient()
  let query = supabase
    .from("opportunities")
    .select("*")
    .order("created_at", { ascending: false })

  if (contactId) {
    query = query.eq("contact_id", contactId)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching opportunities:", error)
    return []
  }

  return (data || []).map(transformOpportunity)
}

export async function createOpportunity(opportunity: Omit<Opportunity, "id" | "createdAt" | "updatedAt">): Promise<Opportunity | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error("[v0] No authenticated user")
    return null
  }

  const { data, error } = await supabase
    .from("opportunities")
    .insert({
      user_id: user.id,
      contact_id: opportunity.contactId,
      title: opportunity.title,
      description: opportunity.description,
      value: opportunity.value || 0,
      currency: opportunity.currency || 'USD',
      stage: opportunity.stage || 'discovery',
      probability: opportunity.probability || 50,
      expected_close_date: opportunity.expectedCloseDate,
      product_id: opportunity.productId,
      notes: opportunity.notes,
      heat_status: opportunity.heatStatus || 'warm',
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating opportunity:", error)
    return null
  }

  return data ? transformOpportunity(data) : null
}

export async function updateOpportunity(id: string, updates: Partial<Opportunity>): Promise<Opportunity | null> {
  const supabase = createClient()
  
  const updateData: any = { updated_at: new Date().toISOString() }
  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.value !== undefined) updateData.value = updates.value
  if (updates.currency !== undefined) updateData.currency = updates.currency
  if (updates.stage !== undefined) {
    updateData.stage = updates.stage
    if (updates.stage === 'closed_won' || updates.stage === 'closed_lost') {
      updateData.actual_close_date = new Date().toISOString().split('T')[0]
    }
  }
  if (updates.probability !== undefined) updateData.probability = updates.probability
  if (updates.expectedCloseDate !== undefined) updateData.expected_close_date = updates.expectedCloseDate
  if (updates.productId !== undefined) updateData.product_id = updates.productId
  if (updates.notes !== undefined) updateData.notes = updates.notes
  if (updates.heatStatus !== undefined) updateData.heat_status = updates.heatStatus
  if (updates.contactId !== undefined) updateData.contact_id = updates.contactId

  const { data, error } = await supabase
    .from("opportunities")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating opportunity:", error)
    return null
  }

  return data ? transformOpportunity(data) : null
}

export async function deleteOpportunity(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from("opportunities")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[v0] Error deleting opportunity:", error)
    return false
  }

  return true
}

// USER SETTINGS
export async function getUserSettings(): Promise<UserSettings | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error("[v0] Error fetching user settings:", error)
    return null
  }

  if (!data) {
    // Create default settings
    const { data: newData, error: insertError } = await supabase
      .from("user_settings")
      .insert({ user_id: user.id })
      .select()
      .single()
    
    if (insertError) {
      console.error("[v0] Error creating user settings:", insertError)
      return null
    }
    
    return newData ? transformUserSettings(newData) : null
  }

  return transformUserSettings(data)
}

function transformUserSettings(row: any): UserSettings {
  return {
    id: row.id,
    userId: row.user_id,
    aiName: row.ai_name || 'AgyntSynq',
    aiDescription: row.ai_description,
    aiInstructions: row.ai_instructions,
    businessDescription: row.business_description,
    aiGoals: row.ai_goals,
    businessGoals: row.business_goals,
    personalGoals: row.personal_goals,
    responseTime: row.response_time || '5-10 Minutes',
    autoSend: row.auto_send || false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function updateUserSettings(updates: Partial<UserSettings>): Promise<UserSettings | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const updateData: any = { updated_at: new Date().toISOString() }
  if (updates.aiName !== undefined) updateData.ai_name = updates.aiName
  if (updates.aiDescription !== undefined) updateData.ai_description = updates.aiDescription
  if (updates.aiInstructions !== undefined) updateData.ai_instructions = updates.aiInstructions
  if (updates.businessDescription !== undefined) updateData.business_description = updates.businessDescription
  if (updates.aiGoals !== undefined) updateData.ai_goals = updates.aiGoals
  if (updates.businessGoals !== undefined) updateData.business_goals = updates.businessGoals
  if (updates.personalGoals !== undefined) updateData.personal_goals = updates.personalGoals
  if (updates.responseTime !== undefined) updateData.response_time = updates.responseTime
  if (updates.autoSend !== undefined) updateData.auto_send = updates.autoSend

  const { data, error } = await supabase
    .from("user_settings")
    .update(updateData)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating user settings:", error)
    return null
  }

  return data ? transformUserSettings(data) : null
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
    }
  }
}

// Re-export for explicit module boundary (force rebuild)
export type { ContactActivity, ContactActivityType }
