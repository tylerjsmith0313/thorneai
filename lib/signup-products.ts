export interface SignupProduct {
  id: string
  name: string
  description: string
  priceInCents: number
  type: 'one_time' | 'subscription'
  interval?: 'month' | 'year'
}

export const SIGNUP_PRODUCTS: SignupProduct[] = [
  {
    id: 'agynt-setup-fee',
    name: 'AgyntSynq Setup Fee',
    description: 'One-time setup and onboarding fee for AgyntSynq platform',
    priceInCents: 94900, // $949.00
    type: 'one_time',
  },
  {
    id: 'agynt-monthly-subscription',
    name: 'AgyntSynq Monthly Subscription',
    description: 'Monthly subscription to AgyntSynq platform with full access to all features',
    priceInCents: 49900, // $499.00
    type: 'subscription',
    interval: 'month',
  },
]

export function getSignupProduct(productId: string): SignupProduct | undefined {
  return SIGNUP_PRODUCTS.find((p) => p.id === productId)
}
