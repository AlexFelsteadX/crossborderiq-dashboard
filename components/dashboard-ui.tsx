"use client"

// Shared visual primitives for the Contributor & Premium dashboards so the two
// feel like one product (circular gauges, percentage formatting, maturity band).

// Format a FRACTION (0–1) as a whole percentage string, e.g. 0.35 -> "35%".
export function formatPct(value: number): string {
  return `${Math.round(value * 100)}%`
}

// Maturity band derived from the 0–100 index value.
export function maturityBand(score: number): string {
  if (score >= 80) return "Leading"
  if (score >= 60) return "Established"
  if (score >= 40) return "Developing"
  return "Emerging"
}

// Circular/radial progress ring (SVG donut): muted slate track + teal arc.
// `value` and `max` define the fill ratio; `label` is rendered large in the
// centre, with optional `sublabel` beneath it.
export function CircularGauge({
  value,
  max = 100,
  size = 160,
  stroke = 12,
  label,
  sublabel,
}: {
  value: number
  max?: number
  size?: number
  stroke?: number
  label: string
  sublabel?: string
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const ratio = Math.min(Math.max(value / max, 0), 1)
  const dashOffset = circumference * (1 - ratio)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1a3344" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--brand-teal)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="drop-shadow-[0_0_6px_rgb(var(--brand-teal-rgb)_/_0.5)] transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-bold text-primary tracking-tight" style={{ fontSize: size * 0.26 }}>
          {label}
        </span>
        {sublabel && (
          <span className="text-slate-500 font-semibold mt-1" style={{ fontSize: size * 0.11 }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  )
}
