import { createClient } from '@/lib/supabase/client'
import type {
  Contact, ContactInsert, ContactUpdate,
  Deal, DealInsert, DealUpdate,
  Conversation, ConversationInsert, ConversationUpdate,
  Message, MessageInsert,
  Product, ProductInsert, ProductUpdate,
  KnowledgeSource, KnowledgeSourceInsert, KnowledgeSourceUpdate,
  Activity, ActivityInsert,
  User, UserUpdate,
  UserSettings, UserSettingsUpdate,
  ContactStatus, DealStatus, ConversationStatus
} from './database.types'

// ============================================================================
// CONTACTS
// ============================================================================

export async function getContacts(filters?: {
  status?: ContactStatus
  search?: string
  limit?: number
  offset?: number
}) {
  const supabase = createClient()
  let query = supabase.from('contacts').select('*')

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.search) {
    query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Contact[]
}

export async function getContactById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Contact
}

export async function createContact(contact: ContactInsert) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('contacts')
    .insert(contact)
    .select()
    .single()
  
  if (error) throw error
  return data as Contact
}

export async function updateContact(id: string, updates: ContactUpdate) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('contacts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Contact
}

export async function deleteContact(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function getContactStats() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('contacts')
    .select('status')
  
  if (error) throw error
  
  const stats = {
    total: data.length,
    new: data.filter(c => c.status === 'New').length,
    hot: data.filter(c => c.status === 'Hot').length,
    withering: data.filter(c => c.status === 'Withering').length,
    dead: data.filter(c => c.status === 'Dead').length,
    needsUpdate: data.filter(c => c.status === 'Needs Update').length,
    retouch: data.filter(c => c.status === 'Retouch').length,
    recapture: data.filter(c => c.status === 'Recapture').length,
  }
  
  return stats
}

// ============================================================================
// DEALS
// ============================================================================

export async function getDeals(filters?: {
  status?: DealStatus
  limit?: number
  offset?: number
}) {
  const supabase = createClient()
  let query = supabase.from('deals').select('*, contacts(first_name, last_name, company)')

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) throw error
  return data as (Deal & { contacts: { first_name: string; last_name: string; company: string } | null })[]
}

export async function getDealById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('deals')
    .select('*, contacts(*)')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Deal & { contacts: Contact | null }
}

export async function createDeal(deal: DealInsert) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('deals')
    .insert(deal)
    .select()
    .single()
  
  if (error) throw error
  return data as Deal
}

export async function updateDeal(id: string, updates: DealUpdate) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('deals')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Deal
}

export async function deleteDeal(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('deals')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function getDealStats() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('deals')
    .select('amount, status, is_monthly_recurring')
  
  if (error) throw error
  
  const wonDeals = data.filter(d => d.status === 'closed-won')
  const openDeals = data.filter(d => d.status === 'open')
  const lostDeals = data.filter(d => d.status === 'closed-lost')
  
  return {
    totalEarned: wonDeals.reduce((sum, d) => sum + Number(d.amount), 0),
    pipeline: openDeals.reduce((sum, d) => sum + Number(d.amount), 0),
    lostValue: lostDeals.reduce((sum, d) => sum + Number(d.amount), 0),
    openCount: openDeals.length,
    wonCount: wonDeals.length,
    lostCount: lostDeals.length,
    avgDealSize: wonDeals.length > 0 
      ? wonDeals.reduce((sum, d) => sum + Number(d.amount), 0) / wonDeals.length 
      : 0,
  }
}

// ============================================================================
// CONVERSATIONS
// ============================================================================

export async function getConversations(filters?: {
  status?: ConversationStatus
  limit?: number
}) {
  const supabase = createClient()
  let query = supabase
    .from('conversations')
    .select('*, contacts(first_name, last_name, email, company)')

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query.order('last_active', { ascending: false })
  
  if (error) throw error
  return data as (Conversation & { contacts: Pick<Contact, 'first_name' | 'last_name' | 'email' | 'company'> })[]
}

export async function getConversationById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('conversations')
    .select('*, contacts(*), messages(*)')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Conversation & { contacts: Contact; messages: Message[] }
}

export async function createConversation(conversation: ConversationInsert) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('conversations')
    .insert(conversation)
    .select()
    .single()
  
  if (error) throw error
  return data as Conversation
}

export async function updateConversation(id: string, updates: ConversationUpdate) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('conversations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Conversation
}

export async function getConversationStats() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('conversations')
    .select('status, unread_count')
  
  if (error) throw error
  
  return {
    total: data.length,
    awaitingReply: data.filter(c => c.status === 'awaiting_reply').length,
    responded: data.filter(c => c.status === 'responded').length,
    thorneHandling: data.filter(c => c.status === 'thorne_handling').length,
    totalUnread: data.reduce((sum, c) => sum + c.unread_count, 0),
  }
}

// ============================================================================
// MESSAGES
// ============================================================================

export async function getMessages(conversationId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data as Message[]
}

export async function createMessage(message: MessageInsert) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single()
  
  if (error) throw error
  
  // Update conversation last_message and last_active
  await supabase
    .from('conversations')
    .update({ 
      last_message: message.content.substring(0, 200),
      last_active: new Date().toISOString()
    })
    .eq('id', message.conversation_id)
  
  return data as Message
}

export async function markMessagesAsRead(conversationId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .eq('is_read', false)
  
  if (error) throw error
  
  // Reset unread count
  await supabase
    .from('conversations')
    .update({ unread_count: 0 })
    .eq('id', conversationId)
}

// ============================================================================
// PRODUCTS
// ============================================================================

export async function getProducts() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Product[]
}

export async function getProductById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Product
}

export async function createProduct(product: ProductInsert) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single()
  
  if (error) throw error
  return data as Product
}

export async function updateProduct(id: string, updates: ProductUpdate) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Product
}

export async function deleteProduct(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ============================================================================
// KNOWLEDGE SOURCES
// ============================================================================

export async function getKnowledgeSources() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('knowledge_sources')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as KnowledgeSource[]
}

export async function createKnowledgeSource(source: KnowledgeSourceInsert) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('knowledge_sources')
    .insert(source)
    .select()
    .single()
  
  if (error) throw error
  return data as KnowledgeSource
}

export async function updateKnowledgeSource(id: string, updates: KnowledgeSourceUpdate) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('knowledge_sources')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as KnowledgeSource
}

export async function deleteKnowledgeSource(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('knowledge_sources')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ============================================================================
// ACTIVITIES
// ============================================================================

export async function getActivities(filters?: {
  contactId?: string
  dealId?: string
  limit?: number
}) {
  const supabase = createClient()
  let query = supabase.from('activities').select('*')

  if (filters?.contactId) {
    query = query.eq('contact_id', filters.contactId)
  }

  if (filters?.dealId) {
    query = query.eq('deal_id', filters.dealId)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Activity[]
}

export async function createActivity(activity: ActivityInsert) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('activities')
    .insert(activity)
    .select()
    .single()
  
  if (error) throw error
  return data as Activity
}

// ============================================================================
// USER & SETTINGS
// ============================================================================

export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) return null
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()
  
  if (error) throw error
  return data as User
}

export async function updateUser(updates: UserUpdate) {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', authUser.id)
    .select()
    .single()
  
  if (error) throw error
  return data as User
}

export async function getUserSettings() {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) return null
  
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', authUser.id)
    .single()
  
  if (error) throw error
  return data as UserSettings
}

export async function updateUserSettings(updates: UserSettingsUpdate) {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('user_settings')
    .update(updates)
    .eq('user_id', authUser.id)
    .select()
    .single()
  
  if (error) throw error
  return data as UserSettings
}

// ============================================================================
// DASHBOARD AGGREGATIONS
// ============================================================================

export async function getDashboardData() {
  const [contactStats, dealStats, conversationStats] = await Promise.all([
    getContactStats(),
    getDealStats(),
    getConversationStats()
  ])
  
  return {
    contacts: contactStats,
    deals: dealStats,
    conversations: conversationStats
  }
}
