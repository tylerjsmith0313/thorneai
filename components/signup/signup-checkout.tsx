'use client'

import { useCallback, useState, useEffect } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Loader2, CreditCard, Shield } from 'lucide-react'

import { createSignupCheckoutSession } from '@/app/actions/signup-checkout'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface SignupCheckoutProps {
  email: string
  username: string
  userId: string
  companyName: string
  planId?: string
  seatCount?: number
  monthlyPrice?: number
  onComplete: () => void
}

export default function SignupCheckout({ 
  email, 
  username, 
  userId, 
  companyName,
  planId = 'agyntsync',
  seatCount = 1,
  monthlyPrice = 249,
  onComplete 
}: SignupCheckoutProps) {
  const [isReady, setIsReady] = useState(false)

  const fetchClientSecret = useCallback(async () => {
    const { clientSecret } = await createSignupCheckoutSession({
      email,
      username,
      userId,
      companyName,
      planId,
      seatCount,
      monthlyPrice,
    })
    return clientSecret!
  }, [email, username, userId, companyName, planId, seatCount, monthlyPrice])

  useEffect(() => {
    setIsReady(true)
  }, [])

  if (!isReady) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div id="signup-checkout">
      {/* Order Summary */}
      <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <p className="text-xs font-medium text-slate-400 tracking-wider mb-3">ORDER YIELD</p>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-900">
            {planId === 'agyntsync' ? 'AGYNTSYNC NEURAL BUNDLE' : 'AGYNTOS STANDARD'} 
            {seatCount > 1 && ` (${seatCount} seats)`}
          </span>
          <span className="text-lg font-bold text-indigo-500">${monthlyPrice}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">Monthly recurring charge</p>
      </div>

      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{
          fetchClientSecret,
          onComplete,
        }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>

      {/* PCI Compliance Note */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
        <Shield className="w-4 h-4" />
        <span>PCI-DSS COMPLIANT AUTHORIZATION</span>
      </div>
    </div>
  )
}
