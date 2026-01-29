import { createClient } from "@/lib/supabase/client"

// Contact activity management for tracking interactions with contacts

/**
 * Represents an activity associated with a contact
 */
export interface ContactActivity {
  id: string
  contactId: string
  activityType: 'call' | 'email' | 'meeting' | 'zoom' | 'sms' | 'note' | 'gift' | 'task' | 'status_change' | 'profile_update'
  title: string
  description?: string
  outcome?: string
  performedAt?: string
  metadata?: {
    oldValue?: string
    newValue?: string
    [key: string]: any
  }
  createdAt?: string
}

function transformContactActivity(row: any): ContactActivity {
  return {
    id: row.id,
    contactId: row.contact_id,
    activityType: row.type,
    title: row.title,
    description: row.detail,
    outcome: row.new_value,
    performedAt: row.created_at,
    metadata: {
      oldValue: row.old_value,
      newValue: row.new_value,
    },
    createdAt: row.created_at,
  }
}

/**
 * Get all activities for a specific contact
 * @param contactId - The contact's unique identifier
 * @returns Array of activities for the contact
 */
export async function getContactActivities(contactId: string): Promise<ContactActivity[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching contact activities:", error)
    return []
  }

  return (data || []).map(transformContactActivity)
}

/**
 * Create a new activity for a contact
 * @param activity - The activity details to create
 * @returns The created activity or null if failed
 */
export async function createContactActivity(activity: {
  contactId: string
  activityType: ContactActivity['activityType']
  title: string
  description?: string
  outcome?: string
  performedAt?: string
  metadata?: ContactActivity['metadata']
}): Promise<ContactActivity | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error("[v0] No authenticated user")
    return null
  }

  const { data, error } = await supabase
    .from("activities")
    .insert({
      user_id: user.id,
      contact_id: activity.contactId,
      type: activity.activityType,
      title: activity.title,
      detail: activity.description,
      old_value: activity.metadata?.oldValue,
      new_value: activity.outcome || activity.metadata?.newValue,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating contact activity:", error)
    return null
  }

  return data ? transformContactActivity(data) : null
}
