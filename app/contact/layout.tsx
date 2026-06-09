import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the CBIQ team about workforce intelligence, benchmarking and membership. Powered by Global Mobility Executive (GME).",
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
