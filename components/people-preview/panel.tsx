import type { ReactNode } from "react"
import { Users } from "lucide-react"
import { REPORTING_FLOOR, type Bar } from "@/lib/people-vendor-sample"

export const CARD_CLASS =
  "min-w-0 rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-5 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]"

export function BaseNote({ base, suffix }: { base: number; suffix?: string }) {
  return (
    <p className="text-xs text-slate-400 tabular-nums">
      {`n=${base.toLocaleString()} organizations${suffix ? `, ${suffix}` : ""}`}
    </p>
  )
}

export function PanelCard({
  title,
  base,
  baseSuffix,
  children,
}: {
  title: string
  base?: number
  baseSuffix?: string
  children: ReactNode
}) {
  return (
    <section className={`${CARD_CLASS} flex flex-col gap-4`}>
      <h3 className="text-sm font-semibold text-slate-100 text-pretty">{title}</h3>
      <div className="flex-1">{children}</div>
      {base !== undefined && <BaseNote base={base} suffix={baseSuffix} />}
    </section>
  )
}

export function ThinDataState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-700 px-4 py-8 text-center">
      <Users className="h-6 w-6 text-slate-500" aria-hidden="true" />
      <p className="max-w-xs text-sm leading-relaxed text-slate-400">
        {`Not enough responses yet. Results appear once ${REPORTING_FLOOR} organizations have answered.`}
      </p>
    </div>
  )
}

export function RankedBars({ bars, label }: { bars: Bar[]; label: string }) {
  const max = Math.max(1, ...bars.map((b) => b.pct))
  return (
    <ul className="flex flex-col gap-3" aria-label={label}>
      {bars.map((b) => (
        <li key={b.label} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className={`text-xs leading-snug text-pretty ${b.muted ? "text-slate-400" : "text-slate-200"}`}>
              {b.label}
            </span>
            <span
              className={`shrink-0 text-xs font-semibold tabular-nums ${b.muted ? "text-slate-400" : "text-primary"}`}
            >
              {`${b.pct}%`}
              <span className="sr-only">{` (${b.count} organizations)`}</span>
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#1a3344]" aria-hidden="true">
            <div
              className={`h-full rounded-full ${
                b.muted ? "bg-slate-600" : "bg-gradient-to-r from-primary to-[var(--brand-teal)]"
              }`}
              style={{ width: `${(b.pct / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
