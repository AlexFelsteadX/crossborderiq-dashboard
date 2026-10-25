import { checkTierAccess } from "@/lib/tier-access"
import { redirect } from "next/navigation"
import { TierLockedScreen } from "@/components/tier-locked-screen"
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

  const isFreeTier = access.tier === "free" || access.tier === "contributor"
  return <PremiumDashboardClient isFreeTier={isFreeTier} />
}
