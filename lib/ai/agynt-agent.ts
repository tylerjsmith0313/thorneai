"use server"

import { createClient } from "@/lib/supabase/server"

// Server action to get user's custom AI instructions
export async function getUserAIContext(userId: string) {
  const supabase = await createClient()
  
  const { data: settings } = await supabase
    .from("user_settings")
    .select("ai_name, ai_description, ai_instructions, business_description, ai_goals, business_goals, personal_goals")
    .eq("user_id", userId)
    .single()

  if (!settings) return ""

  let context = ""
  
  if (settings.ai_name && settings.ai_name !== "AgyntSynq") {
    context += `\n\n## User Customization\nThe user has renamed you to "${settings.ai_name}". Use this name when referring to yourself.`
  }
  
  if (settings.ai_description) {
    context += `\n\n## Custom AI Description\n${settings.ai_description}`
  }
  
  if (settings.ai_instructions) {
    context += `\n\n## User's Custom Instructions\n${settings.ai_instructions}`
  }
  
  if (settings.business_description) {
    context += `\n\n## User's Business\n${settings.business_description}`
  }
  
  if (settings.ai_goals || settings.business_goals || settings.personal_goals) {
    context += `\n\n## Goals`
    if (settings.ai_goals) context += `\n### AI Usage Goals\n${settings.ai_goals}`
    if (settings.business_goals) context += `\n### Business Goals\n${settings.business_goals}`
    if (settings.personal_goals) context += `\n### Personal Development Goals\n${settings.personal_goals}`
  }

  return context
}
