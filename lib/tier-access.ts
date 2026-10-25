import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

// Tier ladder: free < contributor < premium < vendor
const TIER_ORDER = ["free", "contributor", "premium", "vendor"] as const
export type Tier = (typeof TIER_ORDER)[number]

export type TierAccessResult =
  | { allowed: true; user: { id: string; email: string }; tier: Tier }
  | { allowed: false; reason: "not_logged_in" }
  | { allowed: false; reason: "insufficient_tier"; currentTier: Tier; user: { id: string; email: string } }

/**
 * Check if the user has access to a page based on their tier.
 * Returns the result without redirecting - caller handles the response.
 */
export async function checkTierAccess(
  requiredTier: Tier,
  currentPath: string
): Promise<TierAccessResult> {
  const supabase = await createClient()
  
  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { allowed: false, reason: "not_logged_in" }
  }
  
  // Get user's tier from the RPC
  const { data: tierData } = await supabase.rpc("current_tier")
  const userTier = (tierData as Tier) || "free"
  
  // Check if user's tier meets the required tier
  const userTierIndex = TIER_ORDER.indexOf(userTier)
  const requiredTierIndex = TIER_ORDER.indexOf(requiredTier)
  
  if (userTierIndex < requiredTierIndex) {
    return { 
      allowed: false, 
      reason: "insufficient_tier",
      currentTier: userTier,
      user: { id: user.id, email: user.email || "" }
    }
  }
  
  return {
    allowed: true,
    user: { id: user.id, email: user.email || "" },
    tier: userTier
  }
}

/** Landing page for a tier after sign-in: dashboards for paid tiers, home otherwise. */
export function dashboardPathForTier(tier: Tier): string {
  if (tier === "vendor") return "/vendor-premium-dashboard"
  return "/premium-dashboard"
}

/** Accepts only same-origin relative paths ("/x"), rejecting protocol-relative "//host". */
export function safeRelativePath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null
  return next
}

/**
 * Post-authentication destination: an explicit `next` wins; otherwise route by
 * the signed-in user's tier (current_tier RPC, same source as checkTierAccess).
 */
export async function resolvePostAuthPath(
  supabase: Awaited<ReturnType<typeof createClient>>,
  next: string | null,
): Promise<string> {
  const explicit = safeRelativePath(next)
  if (explicit) return explicit
  try {
    const { data } = await supabase.rpc("current_tier")
    return dashboardPathForTier((data as Tier) || "free")
  } catch {
    return "/premium-dashboard"
  }
}

/**
 * Server-side guard that redirects to login if not authenticated.
 * Call this at the top of a protected page.
 */
export async function requireAuth(currentPath: string): Promise<{ id: string; email: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(currentPath)}`)
  }
  
  return { id: user.id, email: user.email || "" }
}
