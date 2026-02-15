import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication (inherently personal)
const protectedRoutes = [
  '/friends',
  '/messages',
  '/userprofile',
  '/profilesettings',
  '/sellerdashboard',
  '/addevent',
  '/chat'
]

// Browsable routes - accessible to everyone but may show different content based on auth status
const browsableRoutes = [
  '/yaps',
  '/events',
  '/marketplace'
]

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/reset-password'
]

// Routes that should redirect to yaps if user is already authenticated
const authRoutes = [
  '/login',
  '/signup'
]

/**
 * Lightweight JWT expiry check (decode-only, no signature verification).
 * The server still validates the full signature on API calls — this only
 * prevents the middleware redirect loop when the token is expired/corrupt.
 */
function isTokenValid(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    const payload = JSON.parse(atob(parts[1]))
    if (!payload.exp || typeof payload.exp !== 'number') return false
    // exp is in seconds, Date.now() is in milliseconds
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const rawToken = request.cookies.get('authToken')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '')

  // Check if the token was issued for a different API endpoint (dev ↔ staging switch)
  const storedEndpoint = request.cookies.get('authEndpoint')?.value
  const currentEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || ''
  const isEndpointMismatch = rawToken && storedEndpoint && storedEndpoint !== currentEndpoint

  // Treat expired, malformed, or endpoint-mismatched tokens as unauthenticated
  const authToken = rawToken && isTokenValid(rawToken) && !isEndpointMismatch ? rawToken : null

  // Allow all API routes and static files to pass through
  if (pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')) {
    return NextResponse.next()
  }

  // Check route types
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isBrowsableRoute = browsableRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.includes(pathname)
  const isAuthRoute = authRoutes.includes(pathname)

  // If we had a cookie but the token is invalid (expired, malformed, or wrong endpoint),
  // clear it and continue with the unauthenticated flow for the current route type
  if (rawToken && !authToken) {
    let response: ReturnType<typeof NextResponse.next | typeof NextResponse.redirect>
    if (isProtectedRoute) {
      response = NextResponse.redirect(new URL('/login', request.url))
    } else {
      response = NextResponse.next()
    }
    response.cookies.delete('authToken')
    response.cookies.delete('authEndpoint')
    return response
  }

  // If it's a protected route and user is not authenticated, redirect to login
  if (isProtectedRoute && !authToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Browsable routes pass through for everyone - add header to indicate auth status
  if (isBrowsableRoute) {
    const response = NextResponse.next()
    response.headers.set('x-auth-status', authToken ? 'authenticated' : 'unauthenticated')
    return response
  }

  // If user is authenticated and trying to access auth routes, redirect to yaps
  if (isAuthRoute && authToken) {
    return NextResponse.redirect(new URL('/yaps', request.url))
  }

  // Handle complete-profile route
  if (pathname === '/complete-profile' && !authToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}