import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get("contactId")
    const direction = searchParams.get("direction") // "inbound" | "outbound" | null (all)
    const status = searchParams.get("status") // "received" | "sent" | "opened" | etc.
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    // Build query
    let query = supabase
      .from("email_messages")
      .select(`
        *,
        contacts:contact_id (
          id,
          first_name,
          last_name,
          email,
          company
        )
      `)
      .order("received_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (contactId) {
      query = query.eq("contact_id", contactId)
    }
    if (direction) {
      query = query.eq("direction", direction)
    }
    if (status) {
      query = query.eq("status", status)
    }

    const { data: emails, error } = await query

    if (error) {
      console.error("[v0] Error fetching emails:", error)
      return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from("email_messages")
      .select("id", { count: "exact", head: true })

    if (contactId) {
      countQuery = countQuery.eq("contact_id", contactId)
    }
    if (direction) {
      countQuery = countQuery.eq("direction", direction)
    }
    if (status) {
      countQuery = countQuery.eq("status", status)
    }

    const { count } = await countQuery

    return NextResponse.json({
      emails: emails || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0)
      }
    })
  } catch (error) {
    console.error("[v0] Email inbox error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
