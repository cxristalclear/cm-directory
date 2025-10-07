import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - this also authenticates the user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Allow access to login page without authentication
  if (req.nextUrl.pathname === '/admin/login') {
    return res
  }

  // If accessing other admin routes without a valid user, redirect to login
  if (req.nextUrl.pathname.startsWith('/admin') && !user) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/admin/login'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: '/admin/:path*',
}