import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "How CBIQ works, where the data comes from, what membership includes, and how participant confidentiality is protected. Powered by GME.",
}

export default function FaqsLayout({ children }: { children: React.ReactNode }) {
  return children
}
