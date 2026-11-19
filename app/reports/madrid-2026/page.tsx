import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { ReportLanding } from "@/components/reports/report-landing"
import { MADRID_2026 } from "@/lib/reports/madrid-2026"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: MADRID_2026.metaTitle,
  description: MADRID_2026.metaDescription,
  robots: { index: false, follow: false },
}

export default async function Madrid2026ReportPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Same rule as the event briefings on /reports: any signed-in account.
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/reports/${MADRID_2026.slug}`)}`)
  }

  const { data: tier } = await supabase.rpc("current_tier")
  const dashboardHref = tier === "vendor" ? "/vendor-premium-dashboard" : "/premium-dashboard"

  return <ReportLanding report={MADRID_2026} dashboardHref={dashboardHref} />
}
