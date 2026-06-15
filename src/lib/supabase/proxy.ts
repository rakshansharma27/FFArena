import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get active authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // Check if accessing a private route
  const isProtectedRoute =
    url.pathname.startsWith('/dashboard') ||
    url.pathname.startsWith('/profile/edit') ||
    url.pathname.startsWith('/organizer') ||
    url.pathname.startsWith('/admin')

  // Check if accessing an authentication route
  const isAuthRoute =
    url.pathname.startsWith('/login') ||
    url.pathname.startsWith('/signup') ||
    url.pathname.startsWith('/forgot-password') ||
    url.pathname.startsWith('/update-password')

  // Redirect logic
  if (!user && isProtectedRoute) {
    url.pathname = '/login'
    // Retain original path to redirect back after successful login
    url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search)
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute && !url.pathname.startsWith('/auth/callback')) {
    // If user is resetting their password, let them access the update-password page
    if (url.pathname.startsWith('/update-password') && request.nextUrl.searchParams.get('code')) {
      return supabaseResponse
    }
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
