import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Workforce Intelligence Reports",
  description:
    "Executive research and benchmarking studies for HR, Talent, Mobility, Immigration and Compliance leaders. Download CBIQ intelligence reports.",
}

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return children
}
