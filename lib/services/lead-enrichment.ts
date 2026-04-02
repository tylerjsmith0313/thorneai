"use server"

import { createClient } from "@/lib/supabase/server"

export interface EnrichedLead {
  firstName: string
  lastName: string
  email: string
  phone?: string
  company: string
  jobTitle?: string
  linkedinUrl?: string
  twitterHandle?: string
  facebookUrl?: string
  instagramHandle?: string
  websiteUrl?: string
  industry?: string
  location?: string
  sources: string[]
  confidence: number
  verified: boolean
}

export interface LeadSearchParams {
  query: string
  sources: string[]
  location?: string
  industry?: string
  limit?: number
}

export interface LeadSearchResult {
  leads: EnrichedLead[]
  totalFound: number
  sourcesSearched: string[]
}

/**
 * Search for leads across multiple data sources
 * In production, this would integrate with:
 * - LinkedIn Sales Navigator API
 * - Google Places API
 * - Clearbit
 * - Hunter.io
 * - Apollo.io
 * - ZoomInfo
 */
export async function searchLeads(params: LeadSearchParams): Promise<LeadSearchResult> {
  const { query, sources, location, industry, limit = 25 } = params
  
  console.log("[v0] Searching leads:", { query, sources, location, industry })
  
  const leads: EnrichedLead[] = []
  const sourcesSearched: string[] = []

  // Search each requested source
  for (const source of sources) {
    switch (source.toUpperCase()) {
      case "LINKEDIN":
        sourcesSearched.push("LINKEDIN")
        // In production: LinkedIn Sales Navigator API
        // For now, simulate finding relevant contacts
        break
      case "GOOGLE":
        sourcesSearched.push("GOOGLE")
        // In production: Google Custom Search API + scraping
        break
      case "FACEBOOK":
        sourcesSearched.push("FACEBOOK")
        // In production: Facebook Business API
        break
      case "INSTAGRAM":
        sourcesSearched.push("INSTAGRAM")
        // In production: Instagram Business API
        break
      case "URL":
        sourcesSearched.push("URL")
        // In production: Web scraping + email finder
        break
    }
  }

  // Simulate found leads based on query
  // In production, this would be real data from APIs
  const simulatedLeads = generateSimulatedLeads(query, sources, limit)
  leads.push(...simulatedLeads)

  return {
    leads,
    totalFound: leads.length,
    sourcesSearched
  }
}

/**
 * Enrich a single contact with additional data
 */
export async function enrichContact(
  email: string,
  existingData?: Partial<EnrichedLead>
): Promise<EnrichedLead | null> {
  console.log("[v0] Enriching contact:", email)
  
  // In production, this would call:
  // 1. Clearbit Enrichment API
  // 2. Hunter.io Domain Search
  // 3. LinkedIn Profile Search
  // 4. Company database lookups

  const domain = email.split("@")[1]
  
  // Basic enrichment based on email domain
  const enrichedData: EnrichedLead = {
    firstName: existingData?.firstName || "",
    lastName: existingData?.lastName || "",
    email: email,
    company: existingData?.company || domain?.split(".")[0] || "",
    sources: ["email_domain"],
    confidence: 60,
    verified: false,
    ...existingData
  }

  // Try to find LinkedIn profile
  if (enrichedData.firstName && enrichedData.lastName) {
    enrichedData.linkedinUrl = `https://linkedin.com/in/${enrichedData.firstName.toLowerCase()}-${enrichedData.lastName.toLowerCase()}`
    enrichedData.sources.push("linkedin_inference")
    enrichedData.confidence += 10
  }

  // Verify company info if domain looks like a company
  if (domain && !isPersonalEmailDomain(domain)) {
    enrichedData.websiteUrl = `https://${domain}`
    enrichedData.sources.push("company_website")
    enrichedData.confidence += 15
  }

  return enrichedData
}

/**
 * Verify and validate lead data
 */
export async function verifyLead(lead: EnrichedLead): Promise<{
  lead: EnrichedLead
  validationResults: {
    emailValid: boolean
    emailDeliverable: boolean
    phoneValid: boolean
    linkedinValid: boolean
    overallScore: number
  }
}> {
  let overallScore = 0
  
  // Email validation
  const emailValid = isValidEmail(lead.email)
  const emailDeliverable = emailValid && !isPersonalEmailDomain(lead.email.split("@")[1])
  if (emailValid) overallScore += 30
  if (emailDeliverable) overallScore += 20
  
  // Phone validation
  const phoneValid = lead.phone ? isValidPhone(lead.phone) : false
  if (phoneValid) overallScore += 20
  
  // LinkedIn validation
  const linkedinValid = lead.linkedinUrl ? lead.linkedinUrl.includes("linkedin.com") : false
  if (linkedinValid) overallScore += 15
  
  // Additional sources bonus
  overallScore += Math.min(lead.sources.length * 5, 15)

  return {
    lead: {
      ...lead,
      verified: overallScore >= 70,
      confidence: overallScore
    },
    validationResults: {
      emailValid,
      emailDeliverable,
      phoneValid,
      linkedinValid,
      overallScore
    }
  }
}

/**
 * Save verified lead to contacts database
 */
export async function saveLeadAsContact(lead: EnrichedLead): Promise<{
  success: boolean
  contactId?: string
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // Check if contact already exists
  const { data: existing } = await supabase
    .from("contacts")
    .select("id")
    .eq("email", lead.email.toLowerCase())
    .eq("user_id", user.id)
    .single()

  if (existing) {
    return { success: false, error: "Contact already exists", contactId: existing.id }
  }

  // Insert new contact
  const { data, error } = await supabase
    .from("contacts")
    .insert({
      user_id: user.id,
      first_name: lead.firstName,
      last_name: lead.lastName,
      email: lead.email.toLowerCase(),
      phone: lead.phone,
      company: lead.company,
      job_title: lead.jobTitle,
      linkedin_url: lead.linkedinUrl,
      twitter_handle: lead.twitterHandle,
      facebook_url: lead.facebookUrl,
      instagram_handle: lead.instagramHandle,
      website_url: lead.websiteUrl,
      industry: lead.industry,
      status: "New",
      source: `Lead Finder: ${lead.sources.join(", ")}`,
      engagement_score: lead.confidence,
      is_verified: lead.verified,
      added_date: new Date().toISOString().split("T")[0],
    })
    .select("id")
    .single()

  if (error) {
    console.error("[v0] Error saving lead:", error)
    return { success: false, error: error.message }
  }

  // Log research source
  if (data?.id) {
    for (const source of lead.sources) {
      await supabase.from("contact_research").insert({
        contact_id: data.id,
        source: source,
        source_type: mapSourceToType(source),
        status: lead.verified ? "verified" : "pending",
        verified_at: lead.verified ? new Date().toISOString() : null,
        verified_by: lead.verified ? user.id : null
      })
    }
  }

  return { success: true, contactId: data?.id }
}

// Helper functions
function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "")
  return cleaned.length >= 10 && cleaned.length <= 15
}

function isPersonalEmailDomain(domain: string): boolean {
  const personalDomains = [
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com",
    "aol.com", "protonmail.com", "mail.com", "zoho.com", "yandex.com"
  ]
  return personalDomains.includes(domain?.toLowerCase())
}

function mapSourceToType(source: string): string {
  const mapping: Record<string, string> = {
    "LINKEDIN": "linkedin",
    "GOOGLE": "api",
    "FACEBOOK": "social_media",
    "INSTAGRAM": "social_media",
    "URL": "company_news",
    "email_domain": "email_verification",
    "company_website": "company_news",
    "linkedin_inference": "linkedin"
  }
  return mapping[source] || "manual"
}

function generateSimulatedLeads(query: string, sources: string[], limit: number): EnrichedLead[] {
  // Generate realistic-looking leads based on the query
  // In production, this would be replaced with real API calls
  
  const mockCompanies = [
    { name: "TechVenture Inc", industry: "Technology" },
    { name: "Growth Partners LLC", industry: "Consulting" },
    { name: "Innovate Solutions", industry: "Software" },
    { name: "Digital First Agency", industry: "Marketing" },
    { name: "Scale Operations Co", industry: "Operations" },
  ]

  const mockNames = [
    { first: "Alex", last: "Rivera" },
    { first: "Sarah", last: "Chen" },
    { first: "Michael", last: "Torres" },
    { first: "Emily", last: "Johnson" },
    { first: "David", last: "Kim" },
  ]

  const mockTitles = [
    "CEO", "CTO", "VP of Sales", "Head of Marketing", "Director of Operations",
    "Founder", "Managing Partner", "Chief Growth Officer"
  ]

  const leads: EnrichedLead[] = []
  
  for (let i = 0; i < Math.min(limit, 5); i++) {
    const company = mockCompanies[i % mockCompanies.length]
    const name = mockNames[i % mockNames.length]
    const title = mockTitles[i % mockTitles.length]
    const domain = company.name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z]/g, "") + ".com"
    
    leads.push({
      firstName: name.first,
      lastName: name.last,
      email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@${domain}`,
      company: company.name,
      jobTitle: title,
      industry: company.industry,
      linkedinUrl: `https://linkedin.com/in/${name.first.toLowerCase()}-${name.last.toLowerCase()}`,
      sources: sources.filter(s => Math.random() > 0.3),
      confidence: 70 + Math.floor(Math.random() * 25),
      verified: Math.random() > 0.3
    })
  }

  return leads
}
