import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/**
 * Refreshes the Supabase session cookie on navigation and guards /account.
 * No-ops when Supabase is not configured yet.
 */
export async function middleware(request: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return NextResponse.next()

  let response = NextResponse.next({ request })

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/account')) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/signin'
    redirectUrl.searchParams.set('next', '/account')
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  // The Node.js runtime keeps the middleware on the same runtime as the rest
  // of the app. The Edge runtime is deprecated and is rejected outright by
  // anonymous Vercel deployments.
  runtime: 'nodejs',
  matcher: ['/((?!_next/static|_next/image|images|favicon.ico|.*\\.png$|.*\\.svg$).*)'],
}
