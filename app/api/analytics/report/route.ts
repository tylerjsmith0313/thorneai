import { NextRequest, NextResponse } from "next/server"
import { generateReport } from "@/lib/thorne/neural-network"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type") as 'daily' | 'weekly' | 'monthly' | 'custom' || 'monthly'
    
    const report = await generateReport(type)

    return NextResponse.json(report)
  } catch (error) {
    console.error("[Thorne Neural Network] Report generation error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to generate report" },
      { status: 500 }
    )
  }
}
