import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { LegalContent } from "@/components/legal-content"
import type { ReactNode } from "react"

/**
 * Shared shell for legal pages. Mirrors the navy gradient-mesh background used
 * across the site (see FAQs) and constrains the body to a readable, centered
 * single column (~720px). Server component so pages can export `metadata`.
 */
export function LegalPageLayout({ content }: { content: string }): ReactNode {
  return (
    <div className="min-h-screen bg-brand-navy flex flex-col relative">
      {/* Premium Dark Gradient Mesh Background - same as the rest of the site */}
      <div className="fixed inset-0 bg-brand-navy -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--brand-teal-deep-rgb)_/_0.4),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgb(var(--brand-teal-deep-rgb)_/_0.15),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_50%_30%_at_10%_80%,rgb(var(--brand-teal-deep-rgb)_/_0.1),transparent)] -z-10" />

      <GlobalNav />

      <main className="flex-1 px-6 py-12 w-full">
        <article className="max-w-[720px] mx-auto w-full">
          <LegalContent content={content} />
        </article>
      </main>

      <GlobalFooter />
    </div>
  )
}
