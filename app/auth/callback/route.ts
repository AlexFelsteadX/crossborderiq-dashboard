import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  // Only allow same-origin relative redirects.
  const safeNext = next.startsWith('/') ? next : '/'

  const supabase = await createClient()

  // Code-style sign-in (OAuth / PKCE code): exchange the code for a session.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      try {
        await supabase.rpc('activate_trial')
      } catch {
        // never block auth on trial activation
      }
      return NextResponse.redirect(`${origin}${safeNext}`)
    }
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
  }

  // No code present. The user may already have been signed in by the
  // token_hash magic-link flow at /auth/confirm, which then forwards here.
  // If a valid session exists, continue to `next` instead of erroring.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    try {
      await supabase.rpc('activate_trial')
    } catch {
      // never block auth on trial activation
    }
    return NextResponse.redirect(`${origin}${safeNext}`)
  }

  // Genuinely not authenticated and no code to exchange: send to login.
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
