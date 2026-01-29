'use server'

import { getStripe } from '@/lib/stripe'

type PlanType = 'agynt-os' | 'agynt-sync'

interface OnboardingCheckoutParams {
  email: string
  company: string
  phone: string
  plan: PlanType
  userCount: number
  userId: string
}

// Calculate pricing based on plan and user count
function calculatePrice(plan: PlanType, userCount: number): number {
  if (plan === 'agynt-os') return 9900 // $99.00
  
  // AgyntSync pricing
  if (userCount <= 1) return 24900 // $249.00
  if (userCount <= 5) return 49500 // $495.00
  
  // $495 for first 5, then $295 per 5 users after
  const extraUsers = userCount - 5
  const extraBlocks = Math.ceil(extraUsers / 5)
  return 49500 + (extraBlocks * 29500)
}

export async function createOnboardingCheckoutSession(params: OnboardingCheckoutParams) {
  const { email, company, phone, plan, userCount, userId } = params
  const stripe = getStripe()

  const priceInCents = calculatePrice(plan, userCount)
  const productName = plan === 'agynt-os' ? 'AgyntOS Core' : 'AgyntSync Neural Bundle'
  const productDescription = plan === 'agynt-os' 
    ? 'Core CRM, Calendar, and Contact Intelligence' 
    : `Neural Network Automation for ${userCount} user${userCount > 1 ? 's' : ''}`

  // Create or get customer
  const customers = await stripe.customers.list({ email, limit: 1 })
  let customerId: string

  if (customers.data.length > 0) {
    customerId = customers.data[0].id
    // Update customer metadata
    await stripe.customers.update(customerId, {
      metadata: {
        company,
        phone,
        userId,
        plan,
        userCount: String(userCount),
      },
    })
  } else {
    const customer = await stripe.customers.create({
      email,
      metadata: {
        company,
        phone,
        userId,
        plan,
        userCount: String(userCount),
      },
    })
    customerId = customer.id
  }

  // Create checkout session with subscription
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: productName,
            description: productDescription,
          },
          unit_amount: priceInCents,
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    subscription_data: {
      metadata: {
        userId,
        company,
        plan,
        userCount: String(userCount),
      },
    },
    metadata: {
      userId,
      company,
      plan,
      userCount: String(userCount),
      type: 'onboarding',
    },
  })

  return {
    clientSecret: session.client_secret,
    sessionId: session.id,
  }
}

export async function getOnboardingSessionStatus(sessionId: string) {
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  return {
    status: session.status,
    paymentStatus: session.payment_status,
    customerEmail: session.customer_details?.email,
    subscriptionId: session.subscription,
  }
}
