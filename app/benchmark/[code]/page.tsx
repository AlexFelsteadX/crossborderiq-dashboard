import type { Metadata } from "next"
import { BenchmarkClaimClient } from "./benchmark-claim-client"

// All reps share the launch survey; per-rep attribution rides on the URL code, not the form.
const FORM_MAP: Record<string, string> = {
  CD: "GtsLFriE", // Charlie
  CK: "GtsLFriE", // Catherine
  AP: "GtsLFriE", // Artem
}
const FALLBACK_FORM_ID = "GtsLFriE"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "CBIQ — See how your Global Mobility program compares",
    description:
      "Complete a short benchmark and unlock 14 days of CBIQ Premium, free.",
    openGraph: {
      title: "CBIQ — See how your Global Mobility program compares",
      description:
        "Complete a short benchmark and unlock 14 days of CBIQ Premium, free.",
      images: [{ url: "/og-image.png?v=2", width: 1200, height: 630, alt: "CBIQ" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "CBIQ — See how your Global Mobility program compares",
      description:
        "Complete a short benchmark and unlock 14 days of CBIQ Premium, free.",
      images: ["/og-image.png?v=2"],
    },
  }
}

export default async function BenchmarkCodePage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const normalizedCode = code.toUpperCase()
  const formId = FORM_MAP[normalizedCode] ?? FALLBACK_FORM_ID
  // Known codes use the uppercased value as the ref; unknown codes pass through raw.
  const ref = FORM_MAP[normalizedCode] ? normalizedCode : code

  return <BenchmarkClaimClient formId={formId} code={ref} />
}
