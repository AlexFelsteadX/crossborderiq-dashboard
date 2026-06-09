import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing & Membership",
  description:
    "CBIQ Founding Membership — executive-grade global workforce benchmarking from £995/year, without the enterprise price tag. Compare plans.",
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
