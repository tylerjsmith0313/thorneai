'use client'

import { useCallback, useState, useEffect } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Loader2 } from 'lucide-react'

import { createSignupCheckoutSession } from '@/app/actions/signup-checkout'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface SignupCheckoutProps {
  email: string
  username: string
  userId: string
  onComplete: () => void
}

export default function SignupCheckout({ email, username, userId, onComplete }: SignupCheckoutProps) {
  const [isReady, setIsReady] = useState(false)

  const fetchClientSecret = useCallback(async () => {
    const { clientSecret } = await createSignupCheckoutSession({
      email,
      username,
      userId,
    })
    return clientSecret!
  }, [email, username, userId])

  useEffect(() => {
    setIsReady(true)
  }, [])

  if (!isReady) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div id="signup-checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{
          fetchClientSecret,
          onComplete,
        }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
