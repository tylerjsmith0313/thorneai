import { type NextRequest, NextResponse } from 'next/server'

// Middleware that handles session refresh for Supabase auth
// Note: This is a simplified version that doesn't require @supabase/ssr
// The actual session management happens client-side via the Supabase client
export async function middleware(request: NextRequest) {
  // Create a response that we can modify
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
