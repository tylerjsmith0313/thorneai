"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * THORNE DATA COLLECTOR
 * 
 * Handles real-time data collection, event tracking, and data ingestion
 * for the Thorne Neural Network.
 */

export interface DataEvent {
  eventType: string
  entityType: 'contact' | 'opportunity' | 'conversation' | 'activity' | 'user'
  entityId: string
  action: string
  metadata?: Record<string, unknown>
  timestamp?: string
}

export interface DataIngestionResult {
  success: boolean
  recordsProcessed: number
  errors?: string[]
}

// ============================================================================
// EVENT TRACKING
// ============================================================================

export async function trackEvent(event: DataEvent): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const { error } = await supabase.from("activities").insert({
    user_id: user.id,
    type: event.eventType,
    title: `${event.action} ${event.entityType}`,
    detail: JSON.stringify(event.metadata),
    contact_id: event.entityType === 'contact' ? event.entityId : null,
    deal_id: event.entityType === 'opportunity' ? event.entityId : null,
  })

  return !error
}

export async function trackContactInteraction(contactId: string, interactionType: string, details?: Record<string, unknown>): Promise<boolean> {
  return trackEvent({
    eventType: 'interaction',
    entityType: 'contact',
    entityId: contactId,
    action: interactionType,
    metadata: details,
  })
}

export async function trackOpportunityChange(opportunityId: string, changeType: string, oldValue?: unknown, newValue?: unknown): Promise<boolean> {
  return trackEvent({
    eventType: 'change',
    entityType: 'opportunity',
    entityId: opportunityId,
    action: changeType,
    metadata: { oldValue, newValue },
  })
}

// ============================================================================
// DATA INGESTION
// ============================================================================

export async function ingestContacts(contacts: Array<{
  firstName: string
  lastName: string
  email: string
  company?: string
  jobTitle?: string
  phone?: string
  source?: string
  industry?: string
}>): Promise<DataIngestionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, recordsProcessed: 0, errors: ['Not authenticated'] }
  }

  const errors: string[] = []
  let processed = 0

  for (const contact of contacts) {
    const { error } = await supabase.from("contacts").insert({
      user_id: user.id,
      first_name: contact.firstName,
      last_name: contact.lastName,
      email: contact.email,
      company: contact.company,
      job_title: contact.jobTitle,
      phone: contact.phone,
      source: contact.source || 'import',
      industry: contact.industry,
      status: 'new',
      added_date: new Date().toISOString(),
    })

    if (error) {
      errors.push(`Failed to import ${contact.email}: ${error.message}`)
    } else {
      processed++
    }
  }

  return {
    success: errors.length === 0,
    recordsProcessed: processed,
    errors: errors.length > 0 ? errors : undefined,
  }
}

export async function ingestOpportunities(opportunities: Array<{
  contactId?: string
  title: string
  value: number
  stage?: string
  probability?: number
  expectedCloseDate?: string
}>): Promise<DataIngestionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, recordsProcessed: 0, errors: ['Not authenticated'] }
  }

  const errors: string[] = []
  let processed = 0

  for (const opp of opportunities) {
    const { error } = await supabase.from("opportunities").insert({
      user_id: user.id,
      contact_id: opp.contactId,
      title: opp.title,
      value: opp.value,
      stage: opp.stage || 'discovery',
      probability: opp.probability || 50,
      expected_close_date: opp.expectedCloseDate,
    })

    if (error) {
      errors.push(`Failed to import opportunity ${opp.title}: ${error.message}`)
    } else {
      processed++
    }
  }

  return {
    success: errors.length === 0,
    recordsProcessed: processed,
    errors: errors.length > 0 ? errors : undefined,
  }
}

// ============================================================================
// DATA ENRICHMENT
// ============================================================================

export async function enrichContactData(contactId: string): Promise<{
  enriched: boolean
  fieldsUpdated: string[]
}> {
  const supabase = await createClient()
  
  const { data: contact } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", contactId)
    .single()

  if (!contact) {
    return { enriched: false, fieldsUpdated: [] }
  }

  const updates: Record<string, unknown> = {}
  const fieldsUpdated: string[] = []

  // Auto-detect industry from company name if not set
  if (!contact.industry && contact.company) {
    const industryKeywords: Record<string, string[]> = {
      'Technology': ['tech', 'software', 'app', 'digital', 'ai', 'cloud', 'data', 'cyber'],
      'Healthcare': ['health', 'medical', 'pharma', 'biotech', 'hospital', 'clinic'],
      'Finance': ['bank', 'financial', 'invest', 'capital', 'fund', 'insurance'],
      'Retail': ['retail', 'shop', 'store', 'commerce', 'ecommerce'],
      'Manufacturing': ['manufacturing', 'industrial', 'factory', 'production'],
      'Consulting': ['consulting', 'advisory', 'strategy', 'solutions'],
      'Real Estate': ['real estate', 'property', 'realty', 'housing'],
      'Education': ['education', 'university', 'school', 'learning', 'academy'],
    }

    const companyLower = contact.company.toLowerCase()
    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some(kw => companyLower.includes(kw))) {
        updates.industry = industry
        fieldsUpdated.push('industry')
        break
      }
    }
  }

  // Set default communication preferences if not set
  if (!contact.preferred_channel) {
    updates.preferred_channel = 'email'
    fieldsUpdated.push('preferred_channel')
  }

  // Update engagement score based on activity
  const { count: activityCount } = await supabase
    .from("activities")
    .select("id", { count: 'exact', head: true })
    .eq("contact_id", contactId)

  if (activityCount && activityCount > 0) {
    const newScore = Math.min(100, 40 + (activityCount * 5))
    if (newScore !== contact.engagement_score) {
      updates.engagement_score = newScore
      fieldsUpdated.push('engagement_score')
    }
  }

  if (fieldsUpdated.length > 0) {
    await supabase
      .from("contacts")
      .update(updates)
      .eq("id", contactId)
  }

  return {
    enriched: fieldsUpdated.length > 0,
    fieldsUpdated,
  }
}

// ============================================================================
// DATA SYNCHRONIZATION
// ============================================================================

export async function syncEngagementScores(): Promise<number> {
  const supabase = await createClient()
  
  const { data: contacts } = await supabase
    .from("contacts")
    .select("id")

  if (!contacts) return 0

  let updated = 0
  for (const contact of contacts) {
    const result = await enrichContactData(contact.id)
    if (result.enriched) updated++
  }

  return updated
}

export async function calculateHeatScores(): Promise<void> {
  const supabase = await createClient()
  
  // Get contacts with recent activity
  const { data: contacts } = await supabase
    .from("contacts")
    .select(`
      id,
      engagement_score,
      last_contact_date,
      status
    `)

  if (!contacts) return

  for (const contact of contacts) {
    let heatScore = contact.engagement_score || 50

    // Boost for recent contact
    if (contact.last_contact_date) {
      const daysSinceContact = Math.floor(
        (Date.now() - new Date(contact.last_contact_date).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSinceContact < 7) heatScore += 20
      else if (daysSinceContact < 14) heatScore += 10
      else if (daysSinceContact > 30) heatScore -= 10
      else if (daysSinceContact > 60) heatScore -= 20
    }

    // Status adjustments
    if (contact.status === 'engaged') heatScore += 15
    else if (contact.status === 'cold') heatScore -= 15
    else if (contact.status === 'churned') heatScore -= 30

    heatScore = Math.max(0, Math.min(100, heatScore))

    await supabase
      .from("contacts")
      .update({ engagement_score: heatScore })
      .eq("id", contact.id)
  }
}

// ============================================================================
// DATA EXPORT
// ============================================================================

export async function exportContactsCSV(): Promise<string> {
  const supabase = await createClient()
  
  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .order("added_date", { ascending: false })

  if (!contacts || contacts.length === 0) {
    return "No contacts to export"
  }

  const headers = [
    'First Name', 'Last Name', 'Email', 'Company', 'Job Title', 
    'Phone', 'Industry', 'Status', 'Engagement Score', 'Source', 'Added Date'
  ]

  const rows = contacts.map(c => [
    c.first_name || '',
    c.last_name || '',
    c.email || '',
    c.company || '',
    c.job_title || '',
    c.phone || '',
    c.industry || '',
    c.status || '',
    c.engagement_score?.toString() || '50',
    c.source || '',
    c.added_date || '',
  ])

  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

export async function exportReportData(reportType: 'contacts' | 'opportunities' | 'conversations' | 'all'): Promise<Record<string, unknown>> {
  const supabase = await createClient()
  const data: Record<string, unknown> = {}

  if (reportType === 'contacts' || reportType === 'all') {
    const { data: contacts } = await supabase.from("contacts").select("*")
    data.contacts = contacts || []
  }

  if (reportType === 'opportunities' || reportType === 'all') {
    const { data: opportunities } = await supabase.from("opportunities").select("*")
    data.opportunities = opportunities || []
  }

  if (reportType === 'conversations' || reportType === 'all') {
    const { data: conversations } = await supabase.from("conversations").select("*")
    data.conversations = conversations || []
  }

  data.exportedAt = new Date().toISOString()
  data.reportType = reportType

  return data
}
