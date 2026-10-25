import Link from "next/link"
import { Lock } from "lucide-react"

export const UNLOCK_LINE = "Free for 30 days when you attend a GME event or complete the benchmark survey."
export const UNLOCK_HREF = "/pricing"

interface LockedPanelProps {
  title: string
  description?: string
  variant?: "full" | "compact"
  className?: string
}

/**
 * Locked treatment for free-tier panels. The skeleton is purely decorative CSS
 * shapes so no real data is ever rendered behind the blur.
 */
export function LockedPanel({ title, description, variant = "full", className = "" }: LockedPanelProps) {
  if (variant === "compact") {
    return (
      <Link
        href={UNLOCK_HREF}
        aria-label={`${title}. Unlock full access`}
        className={`group inline-flex min-w-0 flex-col gap-1.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${className}`}
      >
        <span className="inline-flex items-center gap-1 text-xs text-slate-400 group-hover:text-slate-200">
          <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
          {title}
        </span>
        <span aria-hidden="true" className="flex select-none items-center gap-1.5 blur-[3px]">
          <span className="h-6 w-9 rounded bg-slate-500/50" />
          <span className="h-2 w-12 rounded-full bg-slate-600/50" />
        </span>
      </Link>
    )
  }

  return (
    <section
      aria-label={`${title} (locked)`}
      className={`rounded-2xl border border-primary/30 bg-brand-navy-2/95 p-6 md:p-8 mb-12 ${className}`}
    >
      <h2 className="mb-5 inline-flex items-center gap-2 text-xl font-bold text-slate-100">
        {title}
        <Lock className="h-4 w-4 text-primary" aria-hidden="true" />
        <span className="sr-only">(locked)</span>
      </h2>

      <div aria-hidden="true" className="pointer-events-none mb-6 select-none space-y-3 blur-sm">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-700/50 bg-brand-navy/60 p-4">
            <div className="flex-1 space-y-2">
              <div className={`h-3 rounded bg-slate-500/50 ${i === 1 ? "w-1/3" : "w-1/2"}`} />
              <div className="h-2 w-5/6 rounded bg-slate-600/40" />
              <div className={`h-2 rounded bg-slate-600/40 ${i === 2 ? "w-1/2" : "w-2/3"}`} />
            </div>
            <div className="h-5 w-16 shrink-0 rounded-full bg-slate-500/40" />
          </div>
        ))}
      </div>

      {description && <p className="mb-2 max-w-2xl text-sm text-slate-300">{description}</p>}
      <p className="mb-5 max-w-2xl text-sm text-slate-400">{UNLOCK_LINE}</p>
      <Link
        href={UNLOCK_HREF}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-primary/90"
      >
        <Lock className="h-4 w-4" aria-hidden="true" />
        Unlock full access
      </Link>
    </section>
  )
}
