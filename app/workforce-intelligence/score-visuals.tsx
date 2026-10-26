"use client"

import { useEffect, useId, useRef, useState, type CSSProperties } from "react"
import { MMI_BANDS } from "@/lib/scoring"

const DRAW_MS = 1000
const ACCENT = "var(--brand-teal)"
const ACCENT_BRIGHT = "color-mix(in oklab, var(--brand-teal) 55%, white)"
const LADDER_GRADIENT =
  "linear-gradient(90deg, #3a4d61 0%, #3b6577 32%, color-mix(in oklab, var(--brand-teal) 65%, #3b6577) 62%, var(--brand-teal) 100%)"

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
}

function useInView<T extends Element>(enabled: boolean) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(!enabled)

  useEffect(() => {
    if (!enabled) return
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.5 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [enabled])

  return [ref, inView] as const
}

interface ScoreRingProps {
  score: number | null
  size?: number
  stroke?: number
  label?: string
  valueClassName?: string
  /** "mount" draws on first paint; "view" waits until the ring is scrolled into view. */
  startOn?: "mount" | "view"
  delayMs?: number
}

export function ScoreRing({
  score,
  size = 220,
  stroke = 18,
  label,
  valueClassName = "text-6xl",
  startOn = "mount",
  delayMs = 0,
}: ScoreRingProps) {
  const gradientId = `ring-gradient-${useId().replace(/:/g, "")}`
  const [containerRef, inView] = useInView<HTMLDivElement>(startOn === "view")
  const arcRef = useRef<SVGCircleElement>(null)
  const numberRef = useRef<HTMLSpanElement>(null)

  const center = size / 2
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const pct = score === null ? 0 : Math.min(100, Math.max(0, score))

  // Gradient runs from the arc's start toward its end (capped at the half-way point so the vector never collapses).
  const theta = 2 * Math.PI * Math.min(pct / 100, 0.5)
  const gradientEnd = { x: center + r * Math.cos(theta), y: center + r * Math.sin(theta) }

  useEffect(() => {
    if (score === null) return
    const arc = arcRef.current
    const number = numberRef.current
    const apply = (progress: number) => {
      if (arc) {
        arc.style.strokeDashoffset = String(circumference * (1 - (pct / 100) * progress))
        arc.style.opacity = progress > 0 ? "1" : "0"
      }
      if (number) number.textContent = String(progress >= 1 ? score : Math.round(score * progress))
    }

    if (prefersReducedMotion()) {
      apply(1)
      return
    }
    if (!inView) return

    let frame = 0
    let start: number | null = null
    const tick = (now: number) => {
      if (start === null) start = now + delayMs
      const t = Math.min(1, Math.max(0, (now - start) / DRAW_MS))
      apply(easeOutCubic(t))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [score, pct, circumference, inView, delayMs])

  const innerEdge = r - stroke / 2 + 0.75
  const outerEdge = r + stroke / 2 - 0.75

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1={center + r}
            y1={center}
            x2={gradientEnd.x}
            y2={gradientEnd.y}
          >
            <stop offset="0%" style={{ stopColor: ACCENT }} />
            <stop offset="100%" style={{ stopColor: ACCENT_BRIGHT }} />
          </linearGradient>
        </defs>

        <circle cx={center} cy={center} r={r} fill="none" strokeWidth={stroke} stroke="rgb(255 255 255 / 0.05)" />
        <circle cx={center} cy={center} r={innerEdge} fill="none" strokeWidth={1.5} stroke="rgb(0 0 0 / 0.35)" />
        <circle cx={center} cy={center} r={outerEdge} fill="none" strokeWidth={1} stroke="rgb(255 255 255 / 0.04)" />

        {score !== null && (
          <circle
            ref={arcRef}
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{
              strokeDashoffset: circumference,
              opacity: 0,
              filter: `drop-shadow(0 0 ${Math.max(3, stroke * 0.55)}px rgb(var(--brand-teal-rgb) / 0.28))`,
            }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
        <span ref={numberRef} className={`font-bold tracking-tighter text-slate-50 tabular-nums ${valueClassName}`}>
          {score === null ? "—" : 0}
        </span>
        {label && <span className="mt-1 text-xs uppercase tracking-wider text-slate-400">{label}</span>}
      </div>
      <span className="sr-only">{score === null ? "Score unavailable" : `${label ? `${label}: ` : ""}${score} out of 100`}</span>
    </div>
  )
}

interface BandLadderProps {
  score: number | null
  /** Text shown above the marker. */
  markerLabel?: string
  /** Show a "You: ?" marker at an unknown position instead of a real score. */
  unknown?: boolean
  /** When the market marker lands; defaults to just after the hero ring finishes drawing. */
  markerDelayMs?: number
}

const TOTAL_SPAN = MMI_BANDS[MMI_BANDS.length - 1].max - MMI_BANDS[0].min + 1

export function BandLadder({ score, markerLabel, unknown = false, markerDelayMs = DRAW_MS + 50 }: BandLadderProps) {
  const position = unknown || score === null ? null : Math.min(100, Math.max(0, score))
  const activeIndex =
    position === null ? -1 : MMI_BANDS.findIndex((b) => Math.round(position) >= b.min && Math.round(position) <= b.max)
  const [unknownRef, unknownInView] = useInView<HTMLDivElement>(unknown)

  let cursor = 0
  const segments = MMI_BANDS.map((band) => {
    const fraction = (band.max - band.min + 1) / TOTAL_SPAN
    const start = cursor
    cursor += fraction
    return { band, fraction, start }
  })

  return (
    <div className="w-full">
      <div className="relative pt-8">
        <div className="flex h-3 items-center gap-px">
          {segments.map(({ band, fraction, start }, i) => {
            const active = i === activeIndex
            const style: CSSProperties = {
              flexGrow: fraction,
              flexBasis: 0,
              backgroundImage: LADDER_GRADIENT,
              backgroundSize: `${100 / fraction}% 100%`,
              backgroundPosition: `${fraction >= 1 ? 0 : (start / (1 - fraction)) * 100}% 0`,
              boxShadow: active ? "0 0 14px rgb(var(--brand-teal-rgb) / 0.3)" : undefined,
            }
            const rounding = active
              ? "rounded-full"
              : i === 0
                ? "rounded-l-full"
                : i === segments.length - 1
                  ? "rounded-r-full"
                  : ""
            return <span key={band.name} className={`${active ? "h-3" : "h-2"} ${rounding}`} style={style} />
          })}
        </div>

        {position !== null && (
          <div className="pointer-events-none absolute inset-y-0 -translate-x-1/2" style={{ left: `${position}%` }}>
            <div
              className="flex h-full flex-col items-center motion-safe:animate-[ladder-marker-settle_650ms_cubic-bezier(0.34,1.56,0.64,1)_both]"
              style={{ animationDelay: `${markerDelayMs}ms` }}
            >
              <span className="text-xs font-medium text-brand-teal whitespace-nowrap">{markerLabel ?? position}</span>
              <MarkerDot />
            </div>
          </div>
        )}

        {unknown && (
          <div ref={unknownRef} className="pointer-events-none absolute inset-y-0 left-[62%] -translate-x-1/2">
            <div className="flex h-full flex-col items-center">
              <span className="text-xs font-medium text-brand-teal whitespace-nowrap">{markerLabel ?? "You: ?"}</span>
              <MarkerDot pulse={unknownInView} />
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex w-full gap-px text-[11px]">
        {segments.map(({ band, fraction }, i) => (
          <span
            key={band.name}
            className={`truncate text-center ${i === activeIndex ? "font-medium text-slate-200" : "text-slate-400"}`}
            style={{ flexGrow: fraction, flexBasis: 0 }}
          >
            {band.name}
          </span>
        ))}
      </div>
    </div>
  )
}

function MarkerDot({ pulse = false }: { pulse?: boolean }) {
  return (
    <span className="relative mt-auto mb-[-1px] flex size-3.5" aria-hidden="true">
      {pulse && (
        <span className="absolute inset-0 rounded-full bg-brand-teal opacity-0 motion-safe:animate-[ladder-marker-halo_1s_ease-out_2]" />
      )}
      <span
        className={`relative size-3.5 rounded-full bg-brand-teal ring-2 ring-slate-50 shadow-[0_2px_8px_rgb(0_0_0/0.5)] ${
          pulse ? "motion-safe:animate-[ladder-marker-pulse_1s_ease-in-out_2]" : ""
        }`}
      />
    </span>
  )
}
