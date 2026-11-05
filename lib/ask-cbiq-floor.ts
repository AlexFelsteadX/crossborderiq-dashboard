export const REPORTING_FLOOR = 10

type Row = Record<string, unknown>

export type Suppressed = { suppressed: true; base: number; reason: "below reporting floor" }

function suppressed(base: number | null): Suppressed {
  return { suppressed: true, base: base ?? 0, reason: "below reporting floor" }
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function belowFloor(base: number | null): boolean {
  return base === null || base < REPORTING_FLOOR
}

// The RPC marks a segment "suppressed" when it falls back to market figures, so its seg_pct
// can still carry a low-base value; treat that the same as a base under the floor.
export function floorBreakdownRow(row: Row): Row {
  const segBase = toNumber(row.seg_base_n)
  if (belowFloor(segBase) || row.confidence === "suppressed") {
    return {
      q_code: row.q_code,
      question_key: row.question_key,
      question_label: row.question_label,
      answer_option: row.answer_option,
      ...suppressed(segBase),
    }
  }

  const overallBase = toNumber(row.overall_base_n)
  if (!belowFloor(overallBase)) return row

  const { overall_pct: _pct, overall_base_n: _base, ...rest } = row
  return { ...rest, overall: suppressed(overallBase) }
}

export function floorTrendRow(row: Row): Row {
  const out: Row = { ...row }
  const forceSuppress = row.confidence === "suppressed"
  let floored = false

  for (const year of ["2025", "2026"]) {
    const base = toNumber(row[`base_${year}`])
    if (forceSuppress || belowFloor(base)) {
      delete out[`base_${year}`]
      out[`pct_${year}`] = suppressed(base)
      floored = true
    }
  }

  if (floored) delete out.delta_pts
  return out
}
