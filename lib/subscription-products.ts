export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  pricePerSeatCents: number
  features: string[]
  maxSeats: number
  stripePriceId?: string
}

// Per-seat pricing plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for small teams getting started",
    pricePerSeatCents: 2900, // $29/seat/month
    features: [
      "Up to 500 contacts",
      "Basic AI assistance",
      "Email integration",
      "Standard support",
    ],
    maxSeats: 5,
  },
  {
    id: "professional",
    name: "Professional",
    description: "For growing teams that need more power",
    pricePerSeatCents: 7900, // $79/seat/month
    features: [
      "Up to 5,000 contacts",
      "Advanced AI with Thorne",
      "Multi-channel outreach",
      "Priority support",
      "Custom workflows",
    ],
    maxSeats: 25,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Full power for large organizations",
    pricePerSeatCents: 14900, // $149/seat/month
    features: [
      "Unlimited contacts",
      "Full Thorne AI suite",
      "All integrations",
      "Dedicated support",
      "Custom training",
      "API access",
    ],
    maxSeats: 100,
  },
]

export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((p) => p.id === planId)
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100)
}
