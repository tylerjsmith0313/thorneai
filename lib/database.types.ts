// Database schema types for Thorne Neural Core
// These types map directly to the Supabase/PostgreSQL tables

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          company: string | null
          job_title: string | null
          office_phone: string | null
          cell_phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          company?: string | null
          job_title?: string | null
          office_phone?: string | null
          cell_phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          company?: string | null
          job_title?: string | null
          office_phone?: string | null
          cell_phone?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          company: string
          job_title: string | null
          phone: string | null
          address: string | null
          status: 'New' | 'Hot' | 'Withering' | 'Dead' | 'Needs Update' | 'Retouch' | 'Recapture'
          source: string | null
          engagement_score: number
          is_verified: boolean
          added_date: string
          last_contact_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          company: string
          job_title?: string | null
          phone?: string | null
          address?: string | null
          status?: 'New' | 'Hot' | 'Withering' | 'Dead' | 'Needs Update' | 'Retouch' | 'Recapture'
          source?: string | null
          engagement_score?: number
          is_verified?: boolean
          added_date?: string
          last_contact_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          first_name?: string
          last_name?: string
          email?: string
          company?: string
          job_title?: string | null
          phone?: string | null
          address?: string | null
          status?: 'New' | 'Hot' | 'Withering' | 'Dead' | 'Needs Update' | 'Retouch' | 'Recapture'
          source?: string | null
          engagement_score?: number
          is_verified?: boolean
          last_contact_date?: string | null
          updated_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          user_id: string
          contact_id: string | null
          client_name: string
          amount: number
          status: 'open' | 'closed-won' | 'closed-lost'
          is_monthly_recurring: boolean
          expected_close_date: string
          actual_close_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contact_id?: string | null
          client_name: string
          amount: number
          status?: 'open' | 'closed-won' | 'closed-lost'
          is_monthly_recurring?: boolean
          expected_close_date: string
          actual_close_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          contact_id?: string | null
          client_name?: string
          amount?: number
          status?: 'open' | 'closed-won' | 'closed-lost'
          is_monthly_recurring?: boolean
          expected_close_date?: string
          actual_close_date?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          contact_id: string
          channel: 'SMS' | 'Email' | 'LinkedIn' | 'WhatsApp' | 'Phone'
          status: 'awaiting_reply' | 'responded' | 'thorne_handling'
          unread_count: number
          last_message: string | null
          last_active: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contact_id: string
          channel: 'SMS' | 'Email' | 'LinkedIn' | 'WhatsApp' | 'Phone'
          status?: 'awaiting_reply' | 'responded' | 'thorne_handling'
          unread_count?: number
          last_message?: string | null
          last_active?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          channel?: 'SMS' | 'Email' | 'LinkedIn' | 'WhatsApp' | 'Phone'
          status?: 'awaiting_reply' | 'responded' | 'thorne_handling'
          unread_count?: number
          last_message?: string | null
          last_active?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_type: 'user' | 'contact' | 'thorne'
          content: string
          message_type: 'text' | 'email' | 'sms' | 'call_transcript'
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_type: 'user' | 'contact' | 'thorne'
          content: string
          message_type?: 'text' | 'email' | 'sms' | 'call_transcript'
          is_read?: boolean
          created_at?: string
        }
        Update: {
          content?: string
          is_read?: boolean
        }
      }
      products: {
        Row: {
          id: string
          user_id: string
          name: string
          pitch_context: string | null
          classification: 'SaaS' | 'Service' | 'Physical' | 'Subscription' | 'Consulting'
          retail_price: number
          cost: number | null
          volume: number
          billing_interval: 'one-time' | 'monthly' | 'annual'
          is_deployed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          pitch_context?: string | null
          classification?: 'SaaS' | 'Service' | 'Physical' | 'Subscription' | 'Consulting'
          retail_price: number
          cost?: number | null
          volume?: number
          billing_interval?: 'one-time' | 'monthly' | 'annual'
          is_deployed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          pitch_context?: string | null
          classification?: 'SaaS' | 'Service' | 'Physical' | 'Subscription' | 'Consulting'
          retail_price?: number
          cost?: number | null
          volume?: number
          billing_interval?: 'one-time' | 'monthly' | 'annual'
          is_deployed?: boolean
          updated_at?: string
        }
      }
      knowledge_sources: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'pdf' | 'document' | 'url' | 'text'
          source_url: string | null
          content: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'pdf' | 'document' | 'url' | 'text'
          source_url?: string | null
          content?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          type?: 'pdf' | 'document' | 'url' | 'text'
          source_url?: string | null
          content?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          user_id: string
          contact_id: string | null
          deal_id: string | null
          type: 'Human' | 'Thorne' | 'Gift' | 'System' | 'Update'
          title: string
          detail: string | null
          old_value: string | null
          new_value: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contact_id?: string | null
          deal_id?: string | null
          type: 'Human' | 'Thorne' | 'Gift' | 'System' | 'Update'
          title: string
          detail?: string | null
          old_value?: string | null
          new_value?: string | null
          created_at?: string
        }
        Update: {
          title?: string
          detail?: string | null
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          auto_add_research: boolean
          first_engage: boolean
          next_step_notifications: boolean
          response_cadence: string
          outreach_personality: 'Casual' | 'Professional' | 'Fun' | 'Enthusiastic' | 'Consultative' | 'Mimic Voice'
          scrub_dnc: boolean
          automation_mode: 'user_controlled' | 'full_auto'
          max_gift_value: number
          monthly_burn_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          auto_add_research?: boolean
          first_engage?: boolean
          next_step_notifications?: boolean
          response_cadence?: string
          outreach_personality?: 'Casual' | 'Professional' | 'Fun' | 'Enthusiastic' | 'Consultative' | 'Mimic Voice'
          scrub_dnc?: boolean
          automation_mode?: 'user_controlled' | 'full_auto'
          max_gift_value?: number
          monthly_burn_limit?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          auto_add_research?: boolean
          first_engage?: boolean
          next_step_notifications?: boolean
          response_cadence?: string
          outreach_personality?: 'Casual' | 'Professional' | 'Fun' | 'Enthusiastic' | 'Consultative' | 'Mimic Voice'
          scrub_dnc?: boolean
          automation_mode?: 'user_controlled' | 'full_auto'
          max_gift_value?: number
          monthly_burn_limit?: number
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      contact_status: 'New' | 'Hot' | 'Withering' | 'Dead' | 'Needs Update' | 'Retouch' | 'Recapture'
      deal_status: 'open' | 'closed-won' | 'closed-lost'
      conversation_status: 'awaiting_reply' | 'responded' | 'thorne_handling'
      channel_type: 'SMS' | 'Email' | 'LinkedIn' | 'WhatsApp' | 'Phone'
      activity_type: 'Human' | 'Thorne' | 'Gift' | 'System' | 'Update'
      product_classification: 'SaaS' | 'Service' | 'Physical' | 'Subscription' | 'Consulting'
      billing_interval: 'one-time' | 'monthly' | 'annual'
      outreach_personality: 'Casual' | 'Professional' | 'Fun' | 'Enthusiastic' | 'Consultative' | 'Mimic Voice'
      automation_mode: 'user_controlled' | 'full_auto'
      knowledge_type: 'pdf' | 'document' | 'url' | 'text'
    }
  }
}

// Convenience type exports for use in components
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Contact = Database['public']['Tables']['contacts']['Row']
export type ContactInsert = Database['public']['Tables']['contacts']['Insert']
export type ContactUpdate = Database['public']['Tables']['contacts']['Update']
export type ContactStatus = Database['public']['Enums']['contact_status']

export type Deal = Database['public']['Tables']['deals']['Row']
export type DealInsert = Database['public']['Tables']['deals']['Insert']
export type DealUpdate = Database['public']['Tables']['deals']['Update']
export type DealStatus = Database['public']['Enums']['deal_status']

export type Conversation = Database['public']['Tables']['conversations']['Row']
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert']
export type ConversationUpdate = Database['public']['Tables']['conversations']['Update']
export type ConversationStatus = Database['public']['Enums']['conversation_status']
export type ChannelType = Database['public']['Enums']['channel_type']

export type Message = Database['public']['Tables']['messages']['Row']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']

export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']
export type ProductClassification = Database['public']['Enums']['product_classification']
export type BillingInterval = Database['public']['Enums']['billing_interval']

export type KnowledgeSource = Database['public']['Tables']['knowledge_sources']['Row']
export type KnowledgeSourceInsert = Database['public']['Tables']['knowledge_sources']['Insert']
export type KnowledgeSourceUpdate = Database['public']['Tables']['knowledge_sources']['Update']
export type KnowledgeType = Database['public']['Enums']['knowledge_type']

export type Activity = Database['public']['Tables']['activities']['Row']
export type ActivityInsert = Database['public']['Tables']['activities']['Insert']
export type ActivityType = Database['public']['Enums']['activity_type']

export type UserSettings = Database['public']['Tables']['user_settings']['Row']
export type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert']
export type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update']
export type OutreachPersonality = Database['public']['Enums']['outreach_personality']
export type AutomationMode = Database['public']['Enums']['automation_mode']
