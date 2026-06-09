// Stripe price IDs for self-serve plans (LIVE)
// Forward map uses the GBP price as the default currency for checkout,
// matching the displayed £ pricing.
export const STRIPE_PLANS = {
  premium: "price_1TftoXJOqQWzUk4xnazKuuDa",
  vendor: "price_1TftmnJOqQWzUk4xpduG9tpT",
} as const

export type StripePlan = keyof typeof STRIPE_PLANS

// Reverse map: priceId -> tier
// Both currency prices for a product map to the same tier, so webhook
// subscription events in either GBP or USD resolve to the correct tier.
export const PRICE_ID_TO_TIER: Record<string, string> = {
  // Global Workforce Intelligence -> premium
  "price_1TftoXJOqQWzUk4xnazKuuDa": "premium", // GBP
  "price_1TftjCJOqQWzUk4xMFna8XUM": "premium", // USD
  // Vendor Intelligence -> vendor
  "price_1TftmnJOqQWzUk4xpduG9tpT": "vendor", // GBP
  "price_1TftkhJOqQWzUk4xZycWbtxl": "vendor", // USD
}
