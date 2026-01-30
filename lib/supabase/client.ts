import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Return a mock client when Supabase is not configured
    const mockError = { message: 'Supabase is not configured. Please add environment variables.' }
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: mockError }),
        getSession: async () => ({ data: { session: null }, error: mockError }),
        signOut: async () => ({ error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: mockError }),
        signUp: async () => ({ data: { user: null, session: null }, error: mockError }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({ data: null, error: mockError }),
        insert: () => ({ data: null, error: mockError }),
        update: () => ({ data: null, error: mockError }),
        delete: () => ({ data: null, error: mockError }),
        upsert: () => ({ data: null, error: mockError }),
        eq: () => ({ data: null, error: mockError, single: () => ({ data: null, error: mockError }) }),
      }),
    } as unknown as ReturnType<typeof createBrowserClient>
  }

  if (!client) {
    client = createBrowserClient(url, key)
  }

  return client
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
