import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

const SESSION_TIMEOUT_MINUTES = 15
const SESSION_TIMEOUT_MS = SESSION_TIMEOUT_MINUTES * 60 * 1000

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase is not configured, just pass through
  if (!url || !key) {
    return NextResponse.next({ request })
  }

  const supabaseResponse = NextResponse.next({ request })

  const supabase = createClient(url, key)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/signup', '/auth/callback', '/auth/forgot-password']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // If user is not authenticated and trying to access protected route
  if (!user && !isPublicRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated, check session timeout
  if (user) {
    const lastActivityCookie = request.cookies.get('last_activity')
    const now = Date.now()

    if (lastActivityCookie) {
      const lastActivity = parseInt(lastActivityCookie.value, 10)
      const timeSinceLastActivity = now - lastActivity

      // If session has timed out (15 minutes of inactivity)
      if (timeSinceLastActivity > SESSION_TIMEOUT_MS) {
        // Sign out the user
        await supabase.auth.signOut()
        
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/auth/login'
        redirectUrl.searchParams.set('reason', 'session_timeout')
        
        const response = NextResponse.redirect(redirectUrl)
        response.cookies.delete('last_activity')
        return response
      }
    }

    // Update last activity timestamp
    supabaseResponse.cookies.set('last_activity', now.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_TIMEOUT_MS / 1000,
    })

    // If authenticated user tries to access login/signup, redirect to home
    if (isPublicRoute && pathname !== '/auth/callback') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/'
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}
