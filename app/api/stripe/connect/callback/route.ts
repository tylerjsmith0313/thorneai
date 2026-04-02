import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current tenant
    const { data: tenant } = await supabase
      .from("tenants")
      .select("id, stripe_account_id")
      .single()

    if (tenant?.stripe_account_id) {
      // Check if the account is fully onboarded
      const account = await stripe.accounts.retrieve(tenant.stripe_account_id)
      
      if (account.details_submitted) {
        // Update status to connected
        await supabase
          .from("tenants")
          .update({ stripe_account_status: "connected" })
          .eq("id", tenant.id)
      }
    }

    // Redirect back to the control center
    return NextResponse.redirect(new URL("/?stripe=connected", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"))
  } catch (error) {
    console.error("Stripe Connect callback error:", error)
    return NextResponse.redirect(new URL("/?stripe=error", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"))
  }
}
