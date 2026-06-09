import { NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { checkTierAccess } from "@/lib/tier-access"

// Map of downloadable gated reports -> their private Storage location.
const GATED_REPORTS: Record<string, { bucket: string; path: string }> = {
  "global-workforce-deployment-survey-2025": {
    bucket: "reports-gated",
    path: "global-workforce-deployment-survey-2025.pdf",
  },
  "hr-leader-crisis-response-survey-middle-east": {
    bucket: "reports-gated",
    path: "People-1st-HR-Leader-Crisis-Response-Survey-Report-Middle-East-1.pdf",
  },
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const report = GATED_REPORTS[id]

  // Unknown report id -> nothing to serve.
  if (!report) {
    return NextResponse.redirect(new URL("/reports", request.url))
  }

  // 1+2) Reuse the existing tier gate: it builds the same server Supabase
  // client, calls auth.getUser() and the current_tier() RPC. Contributor is
  // the lowest tier allowed to download gated reports (free is excluded).
  const access = await checkTierAccess("contributor", `/reports`)

  if (!access.allowed) {
    // Not logged in, or below the contributor tier -> send to contribute.
    return NextResponse.redirect(new URL("/contribute", request.url))
  }

  // 3) Member -> mint a short-lived signed URL using the SERVICE-ROLE client.
  // The gated bucket is private; only this route, after the tier check, can sign it.
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await serviceClient.storage
    .from(report.bucket)
    .createSignedUrl(report.path, 120) // 120s expiry

  if (error || !data?.signedUrl) {
    return NextResponse.redirect(new URL("/reports", request.url))
  }

  return NextResponse.redirect(data.signedUrl)
}
