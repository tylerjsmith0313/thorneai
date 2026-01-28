import { streamText, convertToModelMessages, UIMessage } from "ai"
import { createClient } from "@/lib/supabase/server"

const TRAINING_SYSTEM_PROMPT = `You are AgyntSynq in training mode. The user is teaching you about their business, products, sales processes, and other knowledge that will help you assist them better.

Your role in this conversation:
1. Ask clarifying questions to understand their business deeply
2. Summarize what you learn to confirm understanding
3. Suggest additional information that would be helpful
4. Store and remember everything they share
5. Make connections between different pieces of information

When the user shares information:
- Acknowledge what they've shared
- Ask follow-up questions if something is unclear
- Suggest related topics they might want to cover
- Confirm how this information might be used (e.g., "So when a prospect asks about pricing, I should explain...")

Topics to explore:
- Products/Services: Features, benefits, pricing, differentiators
- Ideal Customer Profile: Industry, company size, pain points
- Sales Process: Stages, typical timeline, key stakeholders
- Common Objections: What pushback do prospects give?
- Success Stories: Case studies, testimonials, proof points
- Competition: Main competitors, how you differentiate
- Company Culture: Values, mission, communication style

Remember: Every piece of information helps you serve the user better. Be curious and thorough.`

export async function POST(req: Request) {
  try {
    const { messages } = await req.json() as { messages: UIMessage[] }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const modelMessages = await convertToModelMessages(messages)

    const result = streamText({
      model: "openai/gpt-4o",
      system: TRAINING_SYSTEM_PROMPT,
      messages: modelMessages,
    })

    // Store the training conversation for future reference
    // This happens asynchronously so we don't block the response
    storeTrainingMessage(user.id, messages).catch(console.error)

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("[v0] Training Chat Error:", error)
    return new Response(
      JSON.stringify({ error: "Failed to process training chat" }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

async function storeTrainingMessage(userId: string, messages: UIMessage[]) {
  const supabase = await createClient()
  
  // Get the last user message and assistant response
  const lastUserMsg = messages.filter(m => m.role === "user").pop()
  const lastAssistantMsg = messages.filter(m => m.role === "assistant").pop()
  
  if (lastUserMsg || lastAssistantMsg) {
    await supabase
      .from("ai_chat_history")
      .insert({
        user_id: userId,
        chat_type: "training",
        messages: messages.map(m => ({
          role: m.role,
          content: m.parts?.filter((p: any) => p.type === "text").map((p: any) => p.text).join("") || "",
        })),
      })
  }
}
