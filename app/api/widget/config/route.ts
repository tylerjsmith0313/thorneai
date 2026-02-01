import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET - Fetch chatbot configuration for the widget
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const chatbotId = searchParams.get("id")

    if (!chatbotId) {
      return NextResponse.json(
        { error: "Missing chatbot ID" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: chatbot, error } = await supabase
      .from("widget_chatbots")
      .select("id, name, welcome_message, theme_color, is_active")
      .eq("id", chatbotId)
      .eq("is_active", true)
      .single()

    if (error || !chatbot) {
      return NextResponse.json(
        { error: "Chatbot not found or inactive" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      chatbot: {
        id: chatbot.id,
        name: chatbot.name,
        welcomeMessage: chatbot.welcome_message,
        themeColor: chatbot.theme_color,
      },
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      },
    })
  } catch (error) {
    console.error("[v0] Widget config error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Allow CORS for embedded widgets
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
