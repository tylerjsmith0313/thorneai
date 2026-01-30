import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Return a mock client that will gracefully fail with clear error messages
    // instead of crashing during initialization
    console.warn('[Supabase] Not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
    return {
      auth: {
        signInWithPassword: async () => ({ 
          data: { user: null, session: null }, 
          error: { message: 'Supabase is not configured. Please contact support.' } 
        }),
        signUp: async () => ({ 
          data: { user: null, session: null }, 
          error: { message: 'Supabase is not configured. Please contact support.' } 
        }),
        signOut: async () => ({ error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({ 
          eq: () => ({ single: async () => ({ data: null, error: { message: 'Supabase not configured' } }) }),
          single: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        }),
        insert: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        update: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        delete: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
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
