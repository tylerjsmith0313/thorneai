// Non-server action tool definitions for the agent
// This file does NOT have "use server" because tool() returns sync objects

import { tool } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

// Tool definitions for the agent - these return tool objects (not async)
export function createAgyntTools(userId: string) {
  return {
    searchContacts: tool({
      description: "Search the user's contacts by name, company, email, or other criteria",
      inputSchema: z.object({
        query: z.string().describe("Search query - can be name, company, email, or keywords"),
        status: z.enum(["all", "new", "contacted", "qualified", "proposal", "won", "lost"]).nullable().describe("Filter by contact status"),
        limit: z.number().default(10).describe("Maximum number of results to return"),
      }),
      execute: async ({ query, status, limit }) => {
        const supabase = await createClient()
        let dbQuery = supabase
          .from("contacts")
          .select("id, first_name, last_name, email, company, job_title, status, engagement_score, last_contact_date, industry, interests, demeanor")
          .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`)
          .limit(limit)

        if (status && status !== "all") {
          dbQuery = dbQuery.eq("status", status)
        }

        const { data, error } = await dbQuery
        if (error) return { error: error.message, contacts: [] }
        return { contacts: data || [], count: data?.length || 0 }
      },
    }),

    getContactDetails: tool({
      description: "Get detailed information about a specific contact including their full profile, engagement history, and opportunities",
      inputSchema: z.object({
        contactId: z.string().describe("The UUID of the contact to retrieve"),
      }),
      execute: async ({ contactId }) => {
        const supabase = await createClient()
        
        const [contactResult, opportunitiesResult, researchResult] = await Promise.all([
          supabase.from("contacts").select("*").eq("id", contactId).single(),
          supabase.from("opportunities").select("*").eq("contact_id", contactId),
          supabase.from("contact_research").select("*").eq("contact_id", contactId).order("created_at", { ascending: false }).limit(5),
        ])

        return {
          contact: contactResult.data,
          opportunities: opportunitiesResult.data || [],
          research: researchResult.data || [],
          error: contactResult.error?.message,
        }
      },
    }),

    getUpcomingEvents: tool({
      description: "Get the user's upcoming calendar events and scheduled meetings",
      inputSchema: z.object({
        days: z.number().default(7).describe("Number of days ahead to look"),
      }),
      execute: async ({ days }) => {
        const supabase = await createClient()
        const startDate = new Date()
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + days)

        const { data, error } = await supabase
          .from("calendar_events")
          .select("id, title, event_type, start_time, end_time, status, contact_id")
          .gte("start_time", startDate.toISOString())
          .lte("start_time", endDate.toISOString())
          .order("start_time", { ascending: true })

        if (error) return { error: error.message, events: [] }
        return { events: data || [], count: data?.length || 0 }
      },
    }),

    getOpportunities: tool({
      description: "Get the user's sales opportunities and deal pipeline",
      inputSchema: z.object({
        stage: z.enum(["all", "discovery", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"]).nullable().describe("Filter by pipeline stage"),
        heatStatus: z.enum(["all", "hot", "warm", "cold"]).nullable().describe("Filter by deal heat status"),
      }),
      execute: async ({ stage, heatStatus }) => {
        const supabase = await createClient()
        let query = supabase
          .from("opportunities")
          .select("id, title, value, stage, probability, heat_status, expected_close_date, contact_id")
          .order("value", { ascending: false })

        if (stage && stage !== "all") {
          query = query.eq("stage", stage)
        }
        if (heatStatus && heatStatus !== "all") {
          query = query.eq("heat_status", heatStatus)
        }

        const { data, error } = await query
        if (error) return { error: error.message, opportunities: [] }
        
        const totalValue = data?.reduce((sum, opp) => sum + (opp.value || 0), 0) || 0
        return { opportunities: data || [], totalValue, count: data?.length || 0 }
      },
    }),

    searchKnowledgeBase: tool({
      description: "Search the knowledge base including Flourish Academy content, uploaded documents, and training materials",
      inputSchema: z.object({
        query: z.string().describe("Search query for finding relevant knowledge"),
        category: z.enum(["all", "sales", "marketing", "customer_service", "lead_generation", "closing", "objection_handling", "email_templates"]).nullable().describe("Filter by knowledge category"),
      }),
      execute: async ({ query, category }) => {
        const supabase = await createClient()
        
        // Search academy content
        let academyQuery = supabase
          .from("academy_content")
          .select("id, title, category, content, key_points, scripts")
          .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
          .limit(5)

        if (category && category !== "all") {
          academyQuery = academyQuery.eq("category", category)
        }

        // Search user documents
        const docsQuery = supabase
          .from("document_chunks")
          .select("id, content, document_id, knowledge_documents(title, document_type)")
          .ilike("content", `%${query}%`)
          .limit(5)

        const [academyResult, docsResult] = await Promise.all([academyQuery, docsQuery])

        return {
          academyContent: academyResult.data || [],
          userDocuments: docsResult.data || [],
          totalResults: (academyResult.data?.length || 0) + (docsResult.data?.length || 0),
        }
      },
    }),

    getUserSettings: tool({
      description: "Get the user's settings including their business description, goals, and AI preferences",
      inputSchema: z.object({}),
      execute: async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: "Not authenticated" }

        const { data, error } = await supabase
          .from("user_settings")
          .select("ai_name, ai_description, ai_instructions, business_description, ai_goals, business_goals, personal_goals")
          .eq("user_id", user.id)
          .single()

        if (error) return { error: error.message, settings: null }
        return { settings: data }
      },
    }),

    draftEmail: tool({
      description: "Draft a personalized email for a contact based on their profile and the specified purpose",
      inputSchema: z.object({
        contactId: z.string().describe("The contact to draft the email for"),
        purpose: z.enum(["cold_outreach", "follow_up", "meeting_request", "proposal", "thank_you", "re_engagement"]).describe("The purpose of the email"),
        tone: z.enum(["professional", "casual", "urgent", "friendly"]).default("professional").describe("The tone of the email"),
        keyPoints: z.array(z.string()).nullable().describe("Key points to include in the email"),
      }),
      execute: async ({ contactId, purpose, tone, keyPoints }) => {
        const supabase = await createClient()
        const { data: contact } = await supabase
          .from("contacts")
          .select("first_name, last_name, company, job_title, industry, interests, demeanor")
          .eq("id", contactId)
          .single()

        if (!contact) return { error: "Contact not found" }

        // Return context for the AI to draft the email
        return {
          contact,
          purpose,
          tone,
          keyPoints: keyPoints || [],
          instructions: `Draft a ${tone} ${purpose.replace("_", " ")} email for ${contact.first_name} ${contact.last_name} at ${contact.company}. Consider their industry (${contact.industry}), interests (${contact.interests?.join(", ")}), and demeanor (${contact.demeanor}).`,
        }
      },
    }),

    scheduleFollowUp: tool({
      description: "Create a follow-up task or calendar event for a contact",
      inputSchema: z.object({
        contactId: z.string().describe("The contact to follow up with"),
        type: z.enum(["call", "email", "meeting", "task"]).describe("Type of follow-up"),
        scheduledFor: z.string().describe("When to follow up (ISO date string)"),
        notes: z.string().nullable().describe("Notes about what to discuss or do"),
      }),
      execute: async ({ contactId, type, scheduledFor, notes }) => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: "Not authenticated" }

        const { data: contact } = await supabase
          .from("contacts")
          .select("first_name, last_name")
          .eq("id", contactId)
          .single()

        const eventType = type === "meeting" ? "meeting" : type === "call" ? "call" : "task"
        
        const { data, error } = await supabase
          .from("calendar_events")
          .insert({
            user_id: user.id,
            contact_id: contactId,
            title: `${type.charAt(0).toUpperCase() + type.slice(1)} with ${contact?.first_name} ${contact?.last_name}`,
            event_type: eventType,
            start_time: scheduledFor,
            duration_minutes: type === "meeting" ? 30 : type === "call" ? 15 : 5,
            status: "scheduled",
            notes,
          })
          .select()
          .single()

        if (error) return { error: error.message }
        return { success: true, event: data, message: `Follow-up ${type} scheduled for ${new Date(scheduledFor).toLocaleDateString()}` }
      },
    }),

    getDashboardMetrics: tool({
      description: "Get key dashboard metrics including contact stats, opportunity pipeline value, and activity summary",
      inputSchema: z.object({}),
      execute: async () => {
        const supabase = await createClient()
        
        const [contactsResult, opportunitiesResult, eventsResult] = await Promise.all([
          supabase.from("contacts").select("status", { count: "exact" }),
          supabase.from("opportunities").select("value, stage"),
          supabase.from("calendar_events").select("status").gte("start_time", new Date().toISOString()),
        ])

        const totalContacts = contactsResult.count || 0
        const opportunities = opportunitiesResult.data || []
        const pipelineValue = opportunities.reduce((sum, o) => sum + (o.value || 0), 0)
        const activeDeals = opportunities.filter(o => !["closed_won", "closed_lost"].includes(o.stage)).length
        const upcomingEvents = eventsResult.data?.length || 0

        return {
          totalContacts,
          pipelineValue,
          activeDeals,
          upcomingEvents,
          summary: `You have ${totalContacts} contacts, ${activeDeals} active deals worth $${pipelineValue.toLocaleString()}, and ${upcomingEvents} upcoming events.`,
        }
      },
    }),
  }
}
