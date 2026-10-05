// Confidence tiers by base size: 300+ solid accent, 100-299 outlined, under 100
// outlined amber with an "Emerging dataset" note.
export function BaseBadge({ n, className = "" }: { n: number; className?: string }) {
  const label = `Base: ${n.toLocaleString()} organizations`

  if (n >= 300) {
    return (
      <span
        className={`inline-flex items-center whitespace-nowrap rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground ${className}`}
      >
        {label}
      </span>
    )
  }

  if (n >= 100) {
    return (
      <span
        className={`inline-flex items-center whitespace-nowrap rounded-full border border-brand-teal/60 px-2.5 py-0.5 text-[11px] font-semibold text-brand-teal ${className}`}
      >
        {label}
      </span>
    )
  }

  return (
    <span className={`inline-flex flex-col items-end gap-1 ${className}`}>
      <span className="inline-flex items-center whitespace-nowrap rounded-full border border-amber-400/60 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
        {label}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-wide text-amber-300/90">Emerging dataset</span>
    </span>
  )
}
