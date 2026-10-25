import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dashboardPathForTier, type Tier } from "@/lib/tier-access"
import { parseCheckoutIntent, signupForCheckoutPath } from "@/lib/checkout-intent"

const TIER_ORDER: Tier[] = ["free", "contributor", "premium", "vendor"]

// Post-auth handoff: /auth/callback and /auth/confirm land here when the user
// signed up with intent=checkout, and this sends them straight to Stripe.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const plan = parseCheckoutIntent("checkout", searchParams.get("tier"))

  if (!plan) {
    return NextResponse.redirect(`${origin}/pricing`)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${origin}${signupForCheckoutPath(plan)}`)
  }

  // Already on this tier or above: don't sell it again, open their dashboard.
  try {
    const { data } = await supabase.rpc("current_tier")
    const currentTier = (data as Tier) || "free"
    if (TIER_ORDER.indexOf(currentTier) >= TIER_ORDER.indexOf(plan)) {
      return NextResponse.redirect(`${origin}${dashboardPathForTier(currentTier)}`)
    }
  } catch {
    // Tier lookup failure shouldn't block a purchase.
  }

  try {
    // Imported lazily so the auth/tier redirects above never depend on Stripe initialising.
    const { createCheckoutSessionUrl } = await import("@/lib/stripe/checkout-session")
    const url = await createCheckoutSessionUrl({ user, plan, origin })
    return NextResponse.redirect(url, 303)
  } catch (error) {
    console.log("[CheckoutStart] Failed to create checkout session:", error)
    return NextResponse.redirect(`${origin}/pricing?checkout_error=1`)
  }
}
