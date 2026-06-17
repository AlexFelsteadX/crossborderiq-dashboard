import type { Metadata } from "next"
import { BenchmarkClaimClient } from "./benchmark-claim-client"

// Rep-specific Typeform form IDs. Unknown codes fall back to Artem's form.
const FORM_MAP: Record<string, string> = {
  CD: "hLVNuaJi", // Charlie
  CK: "C1fH1an9", // Catherine
  AP: "GkAq0nvz", // Artem
}

const FALLBACK_FORM_ID = "GkAq0nvz"

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
