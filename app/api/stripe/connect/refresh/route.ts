import { NextResponse } from "next/server"

// This route handles when the user needs to re-authenticate with Stripe
export async function GET() {
  // Redirect back to the control center to retry connecting
  return NextResponse.redirect(new URL("/?stripe=refresh", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"))
}
