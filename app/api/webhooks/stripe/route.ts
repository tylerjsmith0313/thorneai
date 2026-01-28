import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"

// Use service role for webhook operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event
  const stripe = getStripe()

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error("[v0] Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { planId, seatCount, tenantName, email } = session.metadata || {}
  
  if (!planId || !tenantName || !email) {
    console.error("[v0] Missing metadata in checkout session")
    return
  }

  // Generate a URL-safe slug from the tenant name
  const slug = tenantName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    + "-" + Date.now().toString(36)

  // Create the tenant
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert({
      name: tenantName,
      slug,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
      subscription_status: "active",
      plan: planId,
      seat_count: parseInt(seatCount || "1"),
      max_seats: parseInt(seatCount || "1"),
    })
    .select()
    .single()

  if (tenantError) {
    console.error("[v0] Failed to create tenant:", tenantError)
    return
  }

  // Create the owner as an admin user
  // Note: The actual user_id will be set when they sign up/login
  const { error: userError } = await supabase.from("tenant_users").insert({
    tenant_id: tenant.id,
    user_id: "00000000-0000-0000-0000-000000000000", // Placeholder until user signs up
    email,
    role: "admin",
    is_owner: true,
  })

  if (userError) {
    console.error("[v0] Failed to create tenant user:", userError)
  }

  console.log(`[v0] Created tenant ${tenant.name} with ${seatCount} seats`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const { error } = await supabase
    .from("tenants")
    .update({
      subscription_status: subscription.status,
      seat_count: subscription.items.data[0]?.quantity || 1,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id)

  if (error) {
    console.error("[v0] Failed to update tenant subscription:", error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { error } = await supabase
    .from("tenants")
    .update({
      subscription_status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id)

  if (error) {
    console.error("[v0] Failed to mark tenant as canceled:", error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string
  
  const { error } = await supabase
    .from("tenants")
    .update({
      subscription_status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscriptionId)

  if (error) {
    console.error("[v0] Failed to mark tenant as past_due:", error)
  }
}
