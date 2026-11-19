import type { Metadata } from "next"
import { ReportLanding, type ReportViewer } from "@/components/reports/report-landing"
import { MADRID_2026 } from "@/lib/reports/madrid-2026"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: MADRID_2026.metaTitle,
  description: MADRID_2026.metaDescription,
  robots: { index: false, follow: false },
}

const TEASER_TEXT =
  "The full report covers the Market Transformation Index, who is in the room, reporting line and structure, pressures, leadership and employee expectations, technology and AI, investment focus, and the forces reshaping Global Mobility. Sign in to view it. Registered for GME Leaders Exchange Madrid? Your CBIQ access is already set up with the email you registered with."

export default async function Madrid2026ReportPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let viewer: ReportViewer
  if (user) {
    const { data: tier } = await supabase.rpc("current_tier")
    viewer = {
      signedIn: true,
      dashboardHref: tier === "vendor" ? "/vendor-premium-dashboard" : "/premium-dashboard",
    }
  } else {
    viewer = {
      signedIn: false,
      signInHref: `/login?next=${encodeURIComponent(`/reports/${MADRID_2026.slug}`)}`,
    }
  }

  return <ReportLanding report={MADRID_2026} viewer={viewer} teaser={{ text: TEASER_TEXT }} />
}
