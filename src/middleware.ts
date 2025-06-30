import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = [
  '/yaps',
  '/events',
  '/marketplace',
  '/friends',
  '/messages',
  '/userprofile',
  '/profilesettings',
  '/sellerdashboard',
  '/addevent'
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authToken = request.cookies.get('authToken')?.value || 
                   request.headers.get('authorization')?.replace('Bearer ', '')

  // Allow all API routes and static files to pass through
  if (pathname.startsWith('/api/') || 
      pathname.startsWith('/_next/') || 
      pathname.includes('.')) {
    return NextResponse.next()
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.includes(pathname)
  const isAuthRoute = authRoutes.includes(pathname)

  // If it's a protected route and user is not authenticated
  if (isProtectedRoute && !authToken) {
    return NextResponse.redirect(new URL('/login', request.url))
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