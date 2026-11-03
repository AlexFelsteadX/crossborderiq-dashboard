import { NextResponse, after } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { pickUtmParams, recordReportView, serviceSupabase } from "@/lib/report-views"
import { REPORT, SIGNED_URL_TTL_SECONDS } from "../report"

export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "private, no-store" }

export async function GET(request: Request) {
  const url = new URL(request.url)
  const utm = pickUtmParams(url.searchParams)
  const isDownload = url.searchParams.get("download") === "1"

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const landing = `/reports/${REPORT.slug}${utm.size ? `?${utm}` : ""}`
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(landing)}`, url.origin), {
      headers: NO_STORE,
    })
  }

  const { data, error } = await serviceSupabase()
    .storage.from(REPORT.storageBucket)
    .createSignedUrl(REPORT.storagePath, SIGNED_URL_TTL_SECONDS, isDownload ? { download: REPORT.downloadFilename } : undefined)

  if (error || !data?.signedUrl) {
    console.error("Report signed URL failed:", error?.message)
    return new NextResponse("The report is not available right now. Please try again shortly.", {
      status: 503,
      headers: NO_STORE,
    })
  }

  if (!isDownload) {
    after(() =>
      recordReportView({ reportSlug: REPORT.slug, userId: user.id, userEmail: user.email ?? null, utm }),
    )
  }

  return NextResponse.redirect(data.signedUrl, { headers: NO_STORE })
}
