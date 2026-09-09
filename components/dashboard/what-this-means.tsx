import type React from "react"

// Reusable "What this means" teal callout. Presentational only; the narrative
// text is passed in as children. The eyebrow defaults to "What this means" and
// is overridden (e.g. "Start here") at the top-of-page market summary.
export function WhatThisMeans({
  children,
  eyebrow = "What this means",
}: {
  children: React.ReactNode
  eyebrow?: string
}) {
  return (
    <div className="rounded-xl rounded-l-none border-l-2 border-l-primary/50 bg-primary/[0.03] px-5 py-4 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <img src="/cbiq-mark.png" alt="" aria-hidden="true" width={20} height={20} className="h-5 w-5 shrink-0" />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{eyebrow}</p>
      </div>
      <p className="text-sm sm:text-base text-slate-200 leading-relaxed text-pretty">{children}</p>
    </div>
  )
}
