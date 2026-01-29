export interface SignupProduct {
  id: string
  name: string
  description: string
  priceInCents: number
  type: 'one_time' | 'subscription'
  interval?: 'month' | 'year'
}

export const SIGNUP_PRODUCTS: SignupProduct[] = [
  // AgyntOS - Basic tier
  {
    id: 'agynt-os',
    name: 'AgyntOS Core',
    description: 'Core CRM, Calendar nodes, and contact intelligence repository',
    priceInCents: 9900, // $99.00
    type: 'subscription',
    interval: 'month',
  },
  // AgyntSync - Neural tier (base for 1 user)
  {
    id: 'agynt-sync-1',
    name: 'AgyntSync Neural (1 User)',
    description: 'Neural Network automation, multi-channel flow, and strategic AI assistance',
    priceInCents: 24900, // $249.00
    type: 'subscription',
    interval: 'month',
  },
  // AgyntSync - Neural tier (up to 5 users)
  {
    id: 'agynt-sync-5',
    name: 'AgyntSync Neural (5 Users)',
    description: 'Neural Network automation for teams up to 5 users',
    priceInCents: 49500, // $495.00
    type: 'subscription',
    interval: 'month',
  },
  // Legacy products
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
