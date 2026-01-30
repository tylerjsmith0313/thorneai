import { createBrowserClient, type SupabaseClient } from '@supabase/ssr'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: SupabaseClient<any, "public", any> | null = null

// Mock client for when Supabase is not configured
const mockClient = {
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
    resetPasswordForEmail: async () => ({ data: null, error: { message: 'Supabase is not configured.' } }),
  },
  from: () => ({
    select: () => ({ 
      eq: () => ({ 
        single: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        maybeSingle: async () => ({ data: null, error: null }),
        order: () => ({ data: [], error: null }),
      }),
      single: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      order: () => ({ 
        limit: () => ({ data: [], error: null }),
        data: [], 
        error: null 
      }),
      limit: () => ({ data: [], error: null }),
      then: (resolve: (value: { data: null[]; error: null }) => void) => resolve({ data: [], error: null }),
    }),
    insert: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
    update: () => ({ 
      eq: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
    }),
    delete: () => ({ 
      eq: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
    }),
    upsert: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
  }),
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
  channel: () => ({
    on: () => ({ subscribe: () => ({}) }),
  }),
// eslint-disable-next-line @typescript-eslint/no-explicit-any
} as unknown as SupabaseClient<any, "public", any>

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Return a mock client that will gracefully fail with clear error messages
    console.warn('[Supabase] Not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
    return mockClient
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
