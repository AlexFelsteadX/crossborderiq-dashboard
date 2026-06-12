"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lock } from "lucide-react"

export interface RegionDatum {
  region: string
  /** Headline AI-tool adoption value for the region, as a whole-number percentage. */
  value: number
}

interface RegionFilterTasteProps {
  regions: RegionDatum[]
  /** Short label describing what the headline number represents. */
  metricLabel: string
}

/**
 * Small client child for the "live filter taste" section.
 * The Region dropdown updates a single headline number client-side.
 * NOTE: values come from a placeholder map passed by the server component
 * (TODO: wire to live RPC) — this component does not fetch anything itself
 * and never imports the server Supabase client.
 */
export function RegionFilterTaste({ regions, metricLabel }: RegionFilterTasteProps) {
  const [selected, setSelected] = useState(regions[0]?.region ?? "")
  const current = regions.find((r) => r.region === selected) ?? regions[0]

  return (
    <div className="rounded-2xl border-2 border-primary/50 bg-brand-navy-2 p-8 shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.4)]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Interactive: region dropdown + headline number */}
        <div>
          <label htmlFor="region-taste" className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
            Region
          </label>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger
              id="region-taste"
              className="w-full bg-brand-navy border-primary/30 text-foreground"
            >
              <SelectValue placeholder="Select a region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((r) => (
                <SelectItem key={r.region} value={r.region}>
                  {r.region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-3 text-xs text-slate-400">{metricLabel}</p>
        </div>

        {/* The single headline number that updates on selection */}
        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-6xl font-bold text-primary tracking-tight drop-shadow-[0_0_20px_rgb(var(--brand-teal-rgb)_/_0.5)]">
            {current?.value ?? 0}%
          </span>
          <span className="mt-1 text-xs text-slate-400">{current?.region}</span>
        </div>
      </div>

      {/* Locked deeper filters */}
      <div className="mt-6 flex items-center gap-2 rounded-lg border border-slate-700 bg-[#1a3344]/40 px-4 py-3">
        <Lock className="h-4 w-4 text-slate-500 shrink-0" />
        <span className="text-xs text-slate-400">
          Industry, company size &amp; assignee-type filters — unlock to go deeper.
        </span>
      </div>
    </div>
  )
}
