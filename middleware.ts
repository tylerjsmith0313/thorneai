import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip all middleware processing if Supabase is not configured
  // This allows the app to run without Supabase for development/preview
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next()
  }

  try {
    // Dynamically import Supabase middleware only when configured
    const { updateSession } = await import('@/lib/supabase/middleware')
    return await updateSession(request)
  } catch (error) {
    // If Supabase middleware fails, continue without blocking
    console.error('[Middleware] Supabase error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
