import { checkTierAccess } from "@/lib/tier-access"
import { redirect } from "next/navigation"
import { TierLockedScreen } from "@/components/tier-locked-screen"
import { PremiumDashboardClient } from "./client"

export const metadata = {
  robots: { index: false, follow: false },
}

export default async function PremiumDashboardPage() {
  const access = await checkTierAccess("premium", "/premium-dashboard")
  
  if (!access.allowed) {
    if (access.reason === "not_logged_in") {
      redirect("/login?next=/premium-dashboard")
    }
    
    // User is logged in but doesn't have premium tier
    return (
      <TierLockedScreen
        heading="Global Workforce Intelligence — members only"
        message="This dashboard is part of the Global Workforce Intelligence membership."
        buttonText="Upgrade to Premium"
        buttonHref="/pricing"
      />
    )
  }
  
  // User has premium or vendor tier - render the dashboard
  return <PremiumDashboardClient />
}
