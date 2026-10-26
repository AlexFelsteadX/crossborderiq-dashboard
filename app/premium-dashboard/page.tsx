import { checkTierAccess, dashboardPathForTier } from "@/lib/tier-access"
import { redirect } from "next/navigation"
import { TierLockedScreen } from "@/components/tier-locked-screen"
import { createClient } from "@/lib/supabase/server"
import type { PublicFlagshipStat } from "@/lib/flagship-stats"
import { PremiumDashboardClient } from "./client"

export const metadata = {
  robots: { index: false, follow: false },
}

export default async function PremiumDashboardPage() {
  // Every signed-in tier gets in; free and contributor corporates see the locked free experience.
  const access = await checkTierAccess("free", "/premium-dashboard")

  if (!access.allowed) {
    if (access.reason === "not_logged_in") {
      redirect("/login?next=/premium-dashboard")
    }

    return (
      <TierLockedScreen
        heading="Global Workforce Intelligence: members only"
        message="This dashboard is part of the Global Workforce Intelligence membership."
        buttonText="Upgrade to Premium"
        buttonHref="/pricing"
      />
    )
  }

  // Vendor sits above "free" on the tier ladder, so the gate above admits it;
  // vendors belong on their own dashboard.
  if (access.tier === "vendor") {
    redirect(dashboardPathForTier("vendor"))
  }

  const isFreeTier = access.tier === "free" || access.tier === "contributor"

  // Free tier never loads question-level breakdowns; the Explore theme cards use
  // the same public, market-only headline figures as /workforce-intelligence.
  const flagshipStats: Record<string, PublicFlagshipStat> = {}
  if (isFreeTier) {
    const supabase = await createClient()
    const { data } = await supabase.rpc("get_public_flagship_stats")
    if (Array.isArray(data)) {
      for (const row of data as PublicFlagshipStat[]) {
        if (row?.theme_key) flagshipStats[row.theme_key] = row
      }
    }
  }

  return <PremiumDashboardClient isFreeTier={isFreeTier} flagshipStats={flagshipStats} />
}
