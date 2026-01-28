"use server"

import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import { SUBSCRIPTION_PLANS, getPlanById } from "@/lib/subscription-products"

export async function createCheckoutSession(params: {
  planId: string
  seatCount: number
  tenantName: string
  email: string
  successUrl: string
  cancelUrl: string
}) {
  const plan = getPlanById(params.planId)
  if (!plan) {
    return { error: "Invalid plan selected" }
  }

  if (params.seatCount > plan.maxSeats) {
    return { error: `Maximum ${plan.maxSeats} seats allowed for ${plan.name} plan` }
  }

  try {
    // Create checkout session with per-seat pricing
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: params.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${plan.name} Plan`,
              description: `${params.seatCount} seat(s) - ${plan.description}`,
            },
            unit_amount: plan.pricePerSeatCents,
            recurring: {
              interval: "month",
            },
          },
          quantity: params.seatCount,
        },
      ],
      metadata: {
        planId: params.planId,
        seatCount: params.seatCount.toString(),
        tenantName: params.tenantName,
        email: params.email,
      },
      subscription_data: {
        metadata: {
          planId: params.planId,
          seatCount: params.seatCount.toString(),
          tenantName: params.tenantName,
        },
      },
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    })

    return { sessionId: session.id, url: session.url }
  } catch (error) {
    console.error("[v0] Stripe checkout error:", error)
    return { error: "Failed to create checkout session" }
  }
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })
    return { url: session.url }
  } catch (error) {
    console.error("[v0] Billing portal error:", error)
    return { error: "Failed to create billing portal session" }
  }
}

export async function updateSubscriptionSeats(subscriptionId: string, newSeatCount: number) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const itemId = subscription.items.data[0]?.id

    if (!itemId) {
      return { error: "Subscription item not found" }
    }

    await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: itemId,
          quantity: newSeatCount,
        },
      ],
      proration_behavior: "create_prorations",
    })

    return { success: true }
  } catch (error) {
    console.error("[v0] Update seats error:", error)
    return { error: "Failed to update subscription seats" }
  }
}
