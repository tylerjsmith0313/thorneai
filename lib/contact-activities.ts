import { createClient } from "@/lib/supabase/client"

export type ContactActivityType = 'email' | 'call' | 'meeting' | 'note' | 'task' | 'gift' | 'zoom' | 'sms' | 'other'

export interface ContactActivity {
  id: string
  contactId: string
  activityType: ContactActivityType
  title: string
  description?: string
  performedAt: string
  outcome?: string
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
    activityType: (item.type as ContactActivityType) || "other",
    title: item.title || "",
    description: item.detail || "",
    performedAt: item.created_at,
    outcome: item.outcome || undefined,
    metadata: {},
  }))
}

export async function createContactActivity(
  activity: Omit<ContactActivity, "id">
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
      type: activity.activityType,
      title: activity.title,
      detail: activity.description,
      outcome: activity.outcome,
      created_at: activity.performedAt || new Date().toISOString(),
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
        activityType: (data.type as ContactActivityType) || "other",
        title: data.title || "",
        description: data.detail || "",
        performedAt: data.created_at,
        outcome: data.outcome || undefined,
        metadata: {},
      }
    : null
}
