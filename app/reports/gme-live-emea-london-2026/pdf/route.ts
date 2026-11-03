import { NextResponse, after } from "next/server"
import { pickUtmParams, recordReportView, serviceSupabase } from "@/lib/report-views"
import { getReportAccess } from "../access"
import { REPORT, SIGNED_URL_TTL_SECONDS } from "../report"

export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "private, no-store" }

export async function GET(request: Request) {
  const url = new URL(request.url)
  const utm = pickUtmParams(url.searchParams)
  const isDownload = url.searchParams.get("download") === "1"

  const access = await getReportAccess()

  if (access.state !== "member") {
    return new NextResponse("This report is for CBIQ members.", { status: 403, headers: NO_STORE })
  }

  const { data, error } = await serviceSupabase()
    .storage.from(REPORT.storageBucket)
    .createSignedUrl(
      REPORT.storagePath,
      SIGNED_URL_TTL_SECONDS,
      isDownload ? { download: REPORT.downloadFilename } : undefined,
    )

  if (error || !data?.signedUrl) {
    console.error("Report signed URL failed:", error?.message)
    return new NextResponse("The report is not available right now. Please try again shortly.", {
      status: 503,
      headers: NO_STORE,
    })
  }

  if (!isDownload) {
    after(() =>
      recordReportView({
        reportSlug: REPORT.slug,
        userId: access.user.id,
        userEmail: access.user.email,
        utm,
      }),
    )
  }

  return NextResponse.redirect(data.signedUrl, { headers: NO_STORE })
}
