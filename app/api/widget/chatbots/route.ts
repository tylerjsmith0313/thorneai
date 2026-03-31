import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { randomBytes } from "crypto"

// GET - Fetch user's chatbots
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: chatbots, error } = await supabase
      .from("widget_chatbots")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching chatbots:", error)
      return NextResponse.json({ error: "Failed to fetch chatbots" }, { status: 500 })
    }

    return NextResponse.json({ chatbots: chatbots || [] })
  } catch (error) {
    console.error("[v0] Chatbots fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create a new chatbot
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, welcomeMessage, aiInstructions, themeColor } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Generate a unique embed key
    const embedKey = randomBytes(16).toString("hex")

    const { data: chatbot, error } = await supabase
      .from("widget_chatbots")
      .insert({
        user_id: user.id,
        name: name,
        welcome_message: welcomeMessage || "Hi there! How can I help you today?",
        ai_instructions: aiInstructions || null,
        theme_color: themeColor || "#6366f1",
        embed_key: embedKey,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating chatbot:", error)
      return NextResponse.json({ error: "Failed to create chatbot" }, { status: 500 })
    }

    return NextResponse.json({ chatbot })
  } catch (error) {
    console.error("[v0] Chatbot create error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH - Update a chatbot
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, name, welcomeMessage, aiInstructions, themeColor, isActive } = body

    if (!id) {
      return NextResponse.json({ error: "Chatbot ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updates: Record<string, any> = {}
    if (name !== undefined) updates.name = name
    if (welcomeMessage !== undefined) updates.welcome_message = welcomeMessage
    if (aiInstructions !== undefined) updates.ai_instructions = aiInstructions
    if (themeColor !== undefined) updates.theme_color = themeColor
    if (isActive !== undefined) updates.is_active = isActive

    const { data: chatbot, error } = await supabase
      .from("widget_chatbots")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating chatbot:", error)
      return NextResponse.json({ error: "Failed to update chatbot" }, { status: 500 })
    }

    return NextResponse.json({ chatbot })
  } catch (error) {
    console.error("[v0] Chatbot update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete a chatbot
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Chatbot ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase
      .from("widget_chatbots")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("[v0] Error deleting chatbot:", error)
      return NextResponse.json({ error: "Failed to delete chatbot" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Chatbot delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
