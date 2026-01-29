'use server'

import { getStripe } from '@/lib/stripe'

export async function createSignupCheckoutSession(params: {
  email: string
  username: string
  userId: string
  companyName: string
  planId?: string
  seatCount?: number
  monthlyPrice?: number
}) {
  const { 
    email, 
    username, 
    userId, 
    companyName,
    planId = 'agyntsync',
    seatCount = 1,
    monthlyPrice = 249
  } = params
  
  const stripe = getStripe()

  // Create or get customer
  const customers = await stripe.customers.list({ email, limit: 1 })
  let customerId: string

  if (customers.data.length > 0) {
    customerId = customers.data[0].id
  } else {
    const customer = await stripe.customers.create({
      email,
      metadata: {
        username,
        userId,
        companyName,
      },
    })
    customerId = customer.id
  }

  // Determine product name based on plan
  const productName = planId === 'agyntsync' 
    ? `AgyntSync Neural Bundle${seatCount > 1 ? ` (${seatCount} seats)` : ''}`
    : `Agyntos Standard${seatCount > 1 ? ` (${seatCount} seats)` : ''}`

  // Create checkout session with subscription
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    line_items: [
      // Monthly subscription based on selected plan and seats
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: productName,
            description: `Monthly subscription to ${planId === 'agyntsync' ? 'AgyntSync' : 'Agyntos'} platform with ${seatCount} user seat${seatCount > 1 ? 's' : ''}`,
          },
          unit_amount: monthlyPrice * 100, // Convert to cents
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
        username,
        userId,
        planId,
        seatCount: seatCount.toString(),
      },
    },
    metadata: {
      username,
      userId,
      type: 'signup',
      tenantName: companyName,
      planId,
      seatCount: seatCount.toString(),
      email,
    },
  })

  return {
    clientSecret: session.client_secret,
    sessionId: session.id,
  }
}

export async function getCheckoutSessionStatus(sessionId: string) {
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  return {
    status: session.status,
    paymentStatus: session.payment_status,
    customerEmail: session.customer_details?.email,
  }
}
