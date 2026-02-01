import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js 16 Proxy Configuration
 * This replaces the deprecated middleware.ts convention.
 * The function must be named 'proxy' for the build to pass.
 */
export function proxy(request: NextRequest) {
  // Add your logic here (e.g., Auth checks, redirects, or headers)
  
  // For now, we allow all requests to proceed to their destination
  return NextResponse.next();
}

/**
 * The matcher allows you to filter which paths this proxy runs on.
 * This configuration excludes static files and API routes to optimize performance.
 */
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
