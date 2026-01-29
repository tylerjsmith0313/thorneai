import { streamText, convertToModelMessages, UIMessage } from "ai"
import { createClient } from "@/lib/supabase/server"
import { AGYNT_SYSTEM_INSTRUCTIONS } from "@/lib/ai/agynt-constants"
import { createAgyntTools, getUserAIContext } from "@/lib/ai/agynt-agent"

export async function POST(req: Request) {
  try {
    const { messages, contactContext } = await req.json() as { 
      messages: UIMessage[]
      contactContext?: {
        id: string
        firstName: string
        lastName: string
        company: string
        industry?: string
        interests?: string[]
        demeanor?: string
        engagementScore?: number
      }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Get user's custom AI context
    const userContext = await getUserAIContext(user.id)
    
    // Build context-aware system prompt
    let systemPrompt = AGYNT_SYSTEM_INSTRUCTIONS + userContext

    // Add contact context if available
    if (contactContext) {
      systemPrompt += `\n\n## Current Contact Context
You are currently focused on this contact:
- Name: ${contactContext.firstName} ${contactContext.lastName}
- Company: ${contactContext.company}
- Industry: ${contactContext.industry || "Unknown"}
- Interests: ${contactContext.interests?.join(", ") || "Not specified"}
- Demeanor: ${contactContext.demeanor || "Not assessed"}
- Engagement Score: ${contactContext.engagementScore || "Not calculated"}

Tailor your responses to be specific to this contact. When suggesting outreach or strategies, personalize them based on their profile.`
    }

    // Create tools for this user
    const tools = await createAgyntTools(user.id)

    // Convert UIMessages to model messages
    const modelMessages = await convertToModelMessages(messages)

    // Stream the response
    const result = streamText({
      model: "openai/gpt-4o",
      system: systemPrompt,
      messages: modelMessages,
      tools,
      maxSteps: 5,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("[v0] AI Chat Error:", error)
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
