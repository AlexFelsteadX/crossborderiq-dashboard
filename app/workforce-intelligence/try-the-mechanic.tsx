"use client"

import { useEffect, useState } from "react"
import { PrimaryCta } from "./ctas"

export interface MechanicOption {
  label: string
  pct: number
}

export function TryTheMechanic({ question, options, ctaHref }: { question: string; options: MechanicOption[]; ctaHref: string }) {
  const [pick, setPick] = useState<number | null>(null)
  const [grown, setGrown] = useState(false)

  useEffect(() => {
    if (pick === null) return
    const id = requestAnimationFrame(() => setGrown(true))
    return () => cancelAnimationFrame(id)
  }, [pick])

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-10">
      <p className="text-xs font-medium uppercase tracking-wider text-brand-teal">Try the mechanic</p>
      <h2 className="mt-3 text-2xl md:text-3xl font-semibold text-slate-50 text-balance">{question}</h2>

      {pick === null ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2" role="group" aria-label="Choose the statement that fits">
          {options.map((o, i) => (
            <button
              key={o.label}
              type="button"
              onClick={() => setPick(i)}
              className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3.5 text-left text-sm text-slate-200 transition-colors hover:border-brand-teal/60 hover:bg-brand-teal/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
            >
              {o.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-8" aria-live="polite">
          <ul className="flex flex-col gap-3">
            {options.map((o, i) => {
              const mine = i === pick
              return (
                <li key={o.label}>
                  <div className="flex items-baseline justify-between gap-4 text-sm">
                    <span className={mine ? "font-medium text-slate-50" : "text-slate-300"}>
                      {o.label}
                      {mine && <span className="ml-1.5 text-brand-teal">(you)</span>}
                    </span>
                    <span className={`tabular-nums ${mine ? "text-brand-teal font-medium" : "text-slate-400"}`}>{o.pct}%</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full motion-safe:transition-[width] motion-safe:duration-700 motion-safe:ease-out ${
                        mine ? "bg-brand-teal" : "bg-slate-500/50"
                      }`}
                      style={{ width: grown ? `${o.pct}%` : "0%" }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
          <p className="mt-8 text-lg text-slate-200 text-pretty">
            {"That’s how CBIQ works. Your answers go in anonymously. The market comes back."}
          </p>
          <div className="mt-6">
            <PrimaryCta href={ctaHref} />
          </div>
        </div>
      )}
    </div>
  )
}
