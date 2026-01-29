'use server'

import { getStripe } from '@/lib/stripe'
import { SIGNUP_PRODUCTS } from '@/lib/signup-products'

export async function createSignupCheckoutSession(params: {
  email: string
  username: string
  userId: string
  companyName: string
}) {
  const { email, username, userId, companyName } = params
  const stripe = getStripe()

  const setupProduct = SIGNUP_PRODUCTS.find((p) => p.id === 'agynt-setup-fee')
  const subscriptionProduct = SIGNUP_PRODUCTS.find((p) => p.id === 'agynt-monthly-subscription')

  if (!setupProduct || !subscriptionProduct) {
    throw new Error('Signup products not configured')
  }

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
      },
    })
    customerId = customer.id
  }

  // Create checkout session with both one-time fee and subscription
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    line_items: [
      // One-time setup fee
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: setupProduct.name,
            description: setupProduct.description,
          },
          unit_amount: setupProduct.priceInCents,
        },
        quantity: 1,
      },
      // Monthly subscription
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: subscriptionProduct.name,
            description: subscriptionProduct.description,
          },
          unit_amount: subscriptionProduct.priceInCents,
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
      },
    },
    metadata: {
      username,
      userId,
      type: 'signup',
      tenantName: companyName,
      planId: 'agynt-standard',
      seatCount: '1',
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
