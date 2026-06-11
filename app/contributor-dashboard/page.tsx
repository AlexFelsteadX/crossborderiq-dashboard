import { redirect } from "next/navigation"
import { TierLockedScreen } from "@/components/tier-locked-screen"
import { createClient } from "@/lib/supabase/server"

export default async function ContributorDashboardPage() {
  const supabase = await createClient()

  // Require an authenticated user — same server auth pattern as before.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/contributor-dashboard")
  }

  // Read the effective tier via the current_tier RPC, defaulting to "free".
  const { data: tierData } = await supabase.rpc("current_tier")
  const effectiveTier = (tierData as string) || "free"

  // Route paid tiers straight to their dashboards.
  if (effectiveTier === "vendor") {
    redirect("/vendor-premium-dashboard")
  }
  if (effectiveTier === "premium") {
    redirect("/premium-dashboard")
  }

  // Free (or any other) tier — show the survey-entry landing.
  // Preserve the Typeform link construction exactly as before.
  const typeformUrl = `https://form.typeform.com/to/GtsLFriE?email=${encodeURIComponent(user.email ?? "")}&uid=${encodeURIComponent(user.id)}`

  return (
    <TierLockedScreen
      heading="Unlock your Premium dashboard"
      message="Complete the Global Workforce Deployment survey to unlock 14 days of free access to the full Premium dashboard — every breakdown across all seven intelligence pillars, plus year-on-year trends and peer-segment comparisons."
      buttonText="Complete the survey"
      buttonHref={typeformUrl}
      buttonNewTab
    />
  )
}
