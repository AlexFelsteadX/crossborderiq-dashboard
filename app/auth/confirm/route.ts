import { createClient } from '@/lib/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })

    if (!error) {
      try {
        await supabase.rpc('activate_trial')
      } catch {
        // never block auth on trial activation
      }
      // Resolve `next` against the request origin and only allow same-origin
      // redirects to avoid open-redirect vulnerabilities.
      const redirectUrl = new URL(next, origin)
      if (redirectUrl.origin === origin) {
        return NextResponse.redirect(redirectUrl.toString())
      }
      return NextResponse.redirect(`${origin}/`)
    }
  }

  // Missing params or verification error — send the user to login.
  return NextResponse.redirect(`${origin}/login`)
}
