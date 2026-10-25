import { createClient } from '@/lib/supabase/server'
import { resolvePostAuthPath } from '@/lib/tier-access'
import { checkoutStartPath, parseCheckoutIntent } from '@/lib/checkout-intent'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // A checkout intent wins; then an explicit ?next; otherwise destination is
  // resolved by tier after trial activation.
  const checkoutPlan = parseCheckoutIntent(searchParams.get('intent'), searchParams.get('tier'))
  const next = searchParams.get('next')

  const supabase = await createClient()

  const redirectAfterAuth = async () => {
    try {
      await supabase.rpc('activate_trial')
    } catch {
      // never block auth on trial activation
    }
    const destination = checkoutPlan
      ? checkoutStartPath(checkoutPlan)
      : await resolvePostAuthPath(supabase, next)
    return NextResponse.redirect(`${origin}${destination}`)
  }

  // Code-style sign-in (OAuth / PKCE code): exchange the code for a session.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return redirectAfterAuth()
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
  }

  // No code present. The user may already have been signed in by the
  // token_hash magic-link flow at /auth/confirm or by the OTP code form,
  // both of which forward here. If a valid session exists, continue.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) return redirectAfterAuth()

  // Genuinely not authenticated and no code to exchange: send to login,
  // keeping the checkout intent so the retry still ends at Stripe.
  const retryIntent = checkoutPlan ? `&intent=checkout&tier=${checkoutPlan}` : ''
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error${retryIntent}`)
}
