import { NextResponse } from "next/server"
import { 
  getDashboardMetrics, 
  getContactAnalytics, 
  getRevenueAnalytics,
  getConversationAnalytics 
} from "@/lib/thorne/neural-network"

export async function GET() {
  try {
    const [metrics, contactAnalytics, revenueAnalytics, conversationAnalytics] = await Promise.all([
      getDashboardMetrics(),
      getContactAnalytics(),
      getRevenueAnalytics(),
      getConversationAnalytics(),
    ])

    return NextResponse.json({
      success: true,
      metrics,
      contactAnalytics,
      revenueAnalytics,
      conversationAnalytics,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[Thorne Neural Network] Analytics error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
