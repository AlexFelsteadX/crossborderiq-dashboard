import type { Metadata } from "next"
import { GWD_SURVEY_FORM_ID } from "@/lib/survey-config"
import { BenchmarkClaimClient } from "./benchmark-claim-client"

// All reps share the launch survey; per-rep attribution rides on the URL code, not the form.
const FORM_MAP: Record<string, string> = {
  CD: GWD_SURVEY_FORM_ID, // Charlie
  CK: GWD_SURVEY_FORM_ID, // Catherine
  AP: GWD_SURVEY_FORM_ID, // Artem
}
const FALLBACK_FORM_ID = GWD_SURVEY_FORM_ID

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "CBIQ — See how your Global Mobility program compares",
    description:
      "Complete a short benchmark and earn 30-Day Premium Access, free.",
    openGraph: {
      title: "CBIQ — See how your Global Mobility program compares",
      description:
        "Complete a short benchmark and earn 30-Day Premium Access, free.",
      images: [{ url: "/og-image.png?v=2", width: 1200, height: 630, alt: "CBIQ" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "CBIQ — See how your Global Mobility program compares",
      description:
        "Complete a short benchmark and earn 30-Day Premium Access, free.",
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
