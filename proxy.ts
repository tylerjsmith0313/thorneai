import { NextRequest, NextResponse } from 'next/server';

/**
 * This function is what Next.js runs for every request handled by this proxy 
 * (previously called middleware).
 * * To fix the build error: 
 * 1. Ensure this file is named 'proxy.ts'
 * 2. Ensure it has a named "proxy" function export.
 */
export function proxy(request: NextRequest) {
  // Add your custom logic here (e.g., checking session cookies, 
  // blocking specific IPs, or rewriting paths).

  // To simply allow the request to proceed:
  return NextResponse.next();
}

// Optional: You can also use a matcher to limit where this runs
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
