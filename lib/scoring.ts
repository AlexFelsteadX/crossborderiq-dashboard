// Single source of truth for CBIQ maturity scoring bands (0–100 score).

export type MmiBandName = "Emerging" | "Developing" | "Established" | "Leading"

export interface MmiBand {
  name: MmiBandName
  min: number
  max: number
}

export const MMI_BANDS: readonly MmiBand[] = [
  { name: "Emerging", min: 0, max: 39 },
  { name: "Developing", min: 40, max: 59 },
  { name: "Established", min: 60, max: 79 },
  { name: "Leading", min: 80, max: 100 },
] as const

export function mmiBand(score: number): MmiBand {
  const s = Math.min(100, Math.max(0, Number.isFinite(score) ? score : 0))
  for (let i = MMI_BANDS.length - 1; i >= 0; i--) {
    if (s >= MMI_BANDS[i].min) return MMI_BANDS[i]
  }
  return MMI_BANDS[0]
}

export const bandScaleLabel =
  "Score out of 100 · 0–39 Emerging · 40–59 Developing · 60–79 Established · 80–100 Leading"
