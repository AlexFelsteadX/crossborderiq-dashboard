// Client-safe helpers for the signup-then-checkout contract. The `tier` values
// are the STRIPE_PLANS keys; price IDs stay server-side in lib/stripe/plans.
export const CHECKOUT_PLANS = ["premium", "vendor"] as const
export type CheckoutPlan = (typeof CHECKOUT_PLANS)[number]

export function parseCheckoutIntent(
  intent: string | null | undefined,
  tier: string | null | undefined,
): CheckoutPlan | null {
  if (intent !== "checkout" || !tier) return null
  return (CHECKOUT_PLANS as readonly string[]).includes(tier) ? (tier as CheckoutPlan) : null
}

export function checkoutIntentQuery(plan: CheckoutPlan): string {
  return `intent=checkout&tier=${plan}`
}

/** Where a logged-out paid-tier click goes. */
export function signupForCheckoutPath(plan: CheckoutPlan): string {
  return `/login?mode=signup&${checkoutIntentQuery(plan)}`
}

/** Server handoff that turns an authenticated session into a Stripe Checkout redirect. */
export function checkoutStartPath(plan: CheckoutPlan): string {
  return `/checkout/start?tier=${plan}`
}
