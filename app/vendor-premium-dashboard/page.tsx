import { checkTierAccess } from "@/lib/tier-access"
import { redirect } from "next/navigation"
import { TierLockedScreen } from "@/components/tier-locked-screen"
import { VendorPremiumDashboardClient } from "./client"

export const metadata = {
  robots: { index: false, follow: false },
}

export default async function VendorPremiumDashboardPage() {
  const access = await checkTierAccess("vendor", "/vendor-premium-dashboard")
  
  if (!access.allowed) {
    if (access.reason === "not_logged_in") {
      redirect("/login?next=/vendor-premium-dashboard")
    }
    
    // User is logged in but doesn't have vendor tier
    return (
      <TierLockedScreen
        heading="Vendor Intelligence — members only"
        message="This dashboard is part of the Vendor Intelligence membership."
        buttonText="Request Vendor access"
        buttonHref="/pricing"
      />
    )
  }
  
  // User has vendor tier - render the dashboard
  return <VendorPremiumDashboardClient />
}
