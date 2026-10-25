"use client"

import { useEffect, useState, type ComponentProps } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/** Option-button treatment shared by the benchmark stepper and Community answer choices. */
export function premiumOptionClass(active: boolean) {
  return cn(
    "w-full text-left rounded-lg border px-4 py-3 text-sm transition-colors",
    active
      ? "border-primary bg-primary/15 text-slate-100"
      : "border-slate-700/60 bg-brand-navy/40 text-slate-200 hover:border-primary/50",
  )
}

const CHIP_TONES = {
  accent: "border-brand-teal/30 bg-brand-teal/10 text-brand-teal",
  amber: "border-amber-400/40 bg-amber-400/15 text-amber-300",
  neutral: "border-slate-600/60 bg-slate-700/50 text-slate-200",
} as const

export function PremiumChip({
  tone = "accent",
  className,
  ...props
}: ComponentProps<typeof Badge> & { tone?: keyof typeof CHIP_TONES }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", CHIP_TONES[tone], className)}
      {...props}
    />
  )
}

/** Horizontal share bar matching the Score tiles: h-2.5 slate track, fill animates in unless reduced motion. */
export function PremiumBar({
  pct,
  highlight = false,
  label,
}: {
  pct: number
  highlight?: boolean
  label?: string
}) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="relative h-2.5 rounded-full bg-slate-700/60" role={label ? "img" : undefined} aria-label={label}>
      <div
        className={cn(
          "absolute inset-y-0 left-0 rounded-full motion-safe:transition-[width] motion-safe:duration-700 motion-safe:ease-out",
          highlight ? "bg-brand-teal" : "bg-slate-400/60",
        )}
        style={{ width: ready ? `${Math.max(0, Math.min(100, pct))}%` : "0%" }}
      />
    </div>
  )
}
