import { checkTierAccess } from "@/lib/tier-access"
import { redirect } from "next/navigation"
import { TierLockedScreen } from "@/components/tier-locked-screen"
import { PremiumReportClient } from "./client"

export const metadata = {
  robots: { index: false, follow: false },
}

export default async function PremiumReportPage() {
  const access = await checkTierAccess("premium", "/premium-report")

  if (!access.allowed) {
    if (access.reason === "not_logged_in") {
      redirect("/login?next=/premium-report")
    }

    // User is logged in but doesn't have premium tier
    return (
      <TierLockedScreen
        heading="Global Workforce Intelligence — members only"
        message="This benchmark report is part of the Global Workforce Intelligence membership."
        buttonText="Upgrade to Premium"
        buttonHref="/pricing"
      />
    )
  }

  return <PremiumReportClient />
}
