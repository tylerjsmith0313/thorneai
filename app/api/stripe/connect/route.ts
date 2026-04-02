import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Get current tenant
    const { data: tenant } = await supabase
      .from("tenants")
      .select("id, stripe_account_id")
      .single()

    let accountId = tenant?.stripe_account_id

    // Create a new connected account if one doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "standard",
      })
      accountId = account.id

      // Save the account ID to the tenant
      if (tenant?.id) {
        await supabase
          .from("tenants")
          .update({ 
            stripe_account_id: accountId,
            stripe_account_status: "pending"
          })
          .eq("id", tenant.id)
      }
    }

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/stripe/connect/refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/stripe/connect/callback`,
      type: "account_onboarding",
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error("Stripe Connect error:", error)
    return NextResponse.json(
      { error: "Failed to create Stripe Connect link" },
      { status: 500 }
    )
  }
}
