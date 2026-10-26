import { MMI_BANDS } from "@/lib/scoring"

interface ScoreRingProps {
  score: number | null
  size?: number
  stroke?: number
  label?: string
  valueClassName?: string
}

export function ScoreRing({ score, size = 220, stroke = 14, label, valueClassName = "text-6xl" }: ScoreRingProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = score === null ? 0 : Math.min(100, Math.max(0, score))
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-white/10" />
        {score !== null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct / 100)}
            className="text-brand-teal"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-semibold tracking-tight text-slate-50 tabular-nums ${valueClassName}`}>
          {score === null ? "—" : score}
        </span>
        {label && <span className="mt-1 text-xs uppercase tracking-wider text-slate-400">{label}</span>}
      </div>
      <span className="sr-only">{score === null ? "Score unavailable" : `Score ${score} out of 100`}</span>
    </div>
  )
}

interface BandLadderProps {
  score: number | null
  /** Text shown on the marker. */
  markerLabel?: string
  /** Show a ghost marker at an unknown position instead of a real score. */
  unknown?: boolean
}

export function BandLadder({ score, markerLabel, unknown = false }: BandLadderProps) {
  const position = unknown ? null : score === null ? null : Math.min(100, Math.max(0, score))
  return (
    <div className="w-full">
      <div className="relative pt-7">
        {position !== null && (
          <div className="absolute top-0 -translate-x-1/2 flex flex-col items-center" style={{ left: `${position}%` }}>
            <span className="text-xs font-medium text-brand-teal whitespace-nowrap">{markerLabel ?? position}</span>
            <span className="mt-1 h-3 w-0.5 rounded-full bg-brand-teal" aria-hidden="true" />
          </div>
        )}
        {unknown && (
          <div className="absolute top-0 left-[62%] -translate-x-1/2 flex flex-col items-center">
            <span className="text-xs font-medium text-brand-teal whitespace-nowrap">{markerLabel ?? "You: ?"}</span>
            <span className="mt-1 h-3 w-0.5 rounded-full border-l-2 border-dashed border-brand-teal" aria-hidden="true" />
          </div>
        )}
        <div className="flex h-2 w-full gap-1 overflow-hidden rounded-full">
          {MMI_BANDS.map((b, i) => (
            <span
              key={b.name}
              className="h-full rounded-full bg-brand-teal"
              style={{ flexGrow: b.max - b.min + 1, opacity: 0.25 + i * 0.22 }}
            />
          ))}
        </div>
      </div>
      <div className="mt-2 flex w-full gap-1 text-[11px] text-slate-400">
        {MMI_BANDS.map((b) => (
          <span key={b.name} className="truncate" style={{ flexGrow: b.max - b.min + 1, flexBasis: 0 }}>
            {b.name}
          </span>
        ))}
      </div>
    </div>
  )
}
