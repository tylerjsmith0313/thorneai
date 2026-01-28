// Application types for UI components (camelCase for frontend)
// These are separate from database types which use snake_case

export type ContactStatus = 'New' | 'Hot' | 'Withering' | 'Dead' | 'Needs Update' | 'Retouch' | 'Recapture'
export type DealStatus = 'open' | 'closed-won' | 'closed-lost'
export type ConversationStatus = 'awaiting_reply' | 'responded' | 'thorne_handling'
export type ChannelType = 'SMS' | 'Email' | 'LinkedIn' | 'WhatsApp' | 'Phone'
export type ActivityType = 'Human' | 'Thorne' | 'Gift' | 'System' | 'Update'

export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  company: string
  jobTitle?: string
  phone?: string
  // Address fields (optional - required for physical outreach channels)
  streetAddress?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  // Company address (optional)
  companyAddress?: string
  status: ContactStatus
  source?: string
  engagementScore?: number
  isVerified?: boolean
  addedDate: string
  lastContactDate?: string
}

export interface Deal {
  id: string
  contactId?: string
  clientName: string
  amount: number
  status: DealStatus
  isMonthlyRecurring: boolean
  expectedCloseDate: string
  actualCloseDate?: string
  notes?: string
  createdAt: string
}

export interface Conversation {
  id: string
  contactId: string
  contactName: string
  channel: ChannelType
  status: ConversationStatus
  unreadCount: number
  lastMessage: string
  lastActive: string
  messages?: Message[]
}

export interface Message {
  id: string
  conversationId?: string
  sender: 'user' | 'contact' | 'thorne'
  text: string
  timestamp: string
  type?: 'text' | 'email' | 'sms' | 'call_transcript'
  isRead?: boolean
}

export interface Product {
  id: string
  name: string
  pitchContext?: string
  classification: 'SaaS' | 'Service' | 'Physical' | 'Subscription' | 'Consulting'
  retailPrice: number
  cost?: number
  volume: number
  billingInterval: 'one-time' | 'monthly' | 'annual'
  isDeployed: boolean
}

export interface KnowledgeSource {
  id: string
  name: string
  type: 'pdf' | 'document' | 'url' | 'text'
  sourceUrl?: string
  content?: string
  isActive: boolean
}

export interface Activity {
  id: string
  contactId?: string
  dealId?: string
  type: ActivityType | string
  title: string
  detail?: string
  date: string
  oldValue?: string
  newValue?: string
  icon?: string
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  company?: string
  jobTitle?: string
  officePhone?: string
  cellPhone?: string
  avatarUrl?: string
}

export interface UserSettings {
  id: string
  userId: string
  autoAddResearch: boolean
  firstEngage: boolean
  nextStepNotifications: boolean
  responseCadence: string
  outreachPersonality: 'Casual' | 'Professional' | 'Fun' | 'Enthusiastic' | 'Consultative' | 'Mimic Voice'
  scrubDnc: boolean
  automationMode: 'user_controlled' | 'full_auto'
  maxGiftValue: number
  monthlyBurnLimit: number
}

// UI-specific types
export type OpportunityFilter = 'all' | 'open' | 'won' | 'lost'
export type DateFilterType = 'day' | 'month' | 'year' | 'custom'

// Campaign configuration (UI state)
export interface CampaignConfig {
  channels: string[]
  budget: number
  aggressiveness: number
  products: string[]
  objective: string
}

// AI-generated insight report
export interface InsightReport {
  summary: string
  forecast: string
  recommendations: string[]
}
