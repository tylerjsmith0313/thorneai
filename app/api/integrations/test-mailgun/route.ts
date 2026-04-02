import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { apiKey, domain, fromEmail } = await request.json()

    if (!apiKey || !domain) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Test the Mailgun connection by getting domain info
    const response = await fetch(
      `https://api.mailgun.net/v3/domains/${domain}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] Mailgun test failed:", error)
      return NextResponse.json(
        { error: "Invalid credentials or domain" },
        { status: 401 }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      domain: data.domain?.name || domain,
      state: data.domain?.state || "unknown"
    })

  } catch (error) {
    console.error("[v0] Mailgun test error:", error)
    return NextResponse.json(
      { error: "Connection test failed" },
      { status: 500 }
    )
  }
}
