import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Mock client for when Supabase is not configured
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockClient: any = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signOut: async () => ({ error: null }),
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
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createClient(): Promise<any> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Return a mock client that will gracefully fail with clear error messages
    return mockClient
  }

  const cookieStore = await cookies()

  return createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // The "setAll" method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  )
}
