// =============================================================================
// FLAGSHIP STATS — curated one-line stat per Detailed-breakdowns overview card.
// Keyed by theme KEY. Each stat is computed live from ONE named question inside
// that section, so an answer never appears without its question. The q_code for
// each question is not known here (it lives in the RPC payload), so questions are
// matched by text signals WITHIN their own section, which keeps matching narrow.
// Every claim is self-validating: if the question or expected answers are absent,
// compute returns null and the card falls back to no sentence.
//
// Extracted from app/premium-dashboard/client.tsx so both the premium dashboard
// (which has full GroupedQuestion[] distributions) and the public free-page
// teaser (which only has one pre-reduced figure per theme, via the public RPC)
// can share the icon map and the exact wording.
// =============================================================================

import {
  Compass,
  Cpu,
  Sparkles,
  TrendingUp,
  Users,
  Target,
  Gauge,
  Plane,
  Handshake,
  Globe,
  PieChart,
  type LucideIcon,
} from "lucide-react"
import type { WorkforceTheme } from "@/lib/workforce-themes"
import type { GroupedQuestion } from "@/lib/premium-breakdown-types"

export const pctOf = (frac: number) => Math.round(frac * 100)

// First question in the section whose q_code + label contains every needle.
export function findFlagshipQuestion(questions: GroupedQuestion[], ...needles: string[]): GroupedQuestion | undefined {
  return questions.find((q) => {
    const hay = `${q.qCode} ${q.questionLabel}`.toLowerCase()
    return needles.every((n) => hay.includes(n))
  })
}

export function topFlagshipAnswer(q: GroupedQuestion) {
  return [...q.answers].sort((a, b) => b.overallPct - a.overallPct)[0]
}

export function sumFlagshipPct(q: GroupedQuestion, re: RegExp): number {
  return q.answers.filter((a) => re.test(a.option)).reduce((s, a) => s + a.overallPct, 0)
}

export type FlagshipStat = {
  icon: LucideIcon
  compute: (questions: GroupedQuestion[]) => string | null
}

export const FLAGSHIP_STATS: Partial<Record<WorkforceTheme, FlagshipStat>> = {
  "Strategy & maturity": {
    icon: Compass,
    compute: (questions) => {
      const q = findFlagshipQuestion(questions, "scope") ?? findFlagshipQuestion(questions, "complex")
      if (!q) return null
      const top3 = q.answers
        .filter((a) => ["5", "6", "7"].includes(a.option.trim()))
        .reduce((s, a) => s + a.overallPct, 0)
      if (top3 <= 0) return null
      return `${pctOf(top3)}% agree the scope and complexity of Global Mobility will grow this year.`
    },
  },
  "AI & technology": {
    icon: Cpu,
    compute: (questions) => {
      const q = findFlagshipQuestion(questions, "ai") ?? findFlagshipQuestion(questions, "artificial")
      if (!q) return null
      const using = sumFlagshipPct(q, /production|pilot|already using|in use/i)
      if (using <= 0) return null
      return `${pctOf(using)}% are already using or piloting AI in mobility operations.`
    },
  },
  "Experience & Outcomes": {
    icon: Sparkles,
    compute: (questions) => {
      const q = findFlagshipQuestion(questions, "success") ?? findFlagshipQuestion(questions, "measure")
      if (!q) return null
      const objective = q.answers.find((a) => /business|objective/i.test(a.option))
      const noMeasure = q.answers.find((a) => /not.*(measure|formal)|no formal|don.?t measure/i.test(a.option))
      if (!objective) return null
      const base = `The most common way to measure success: business-objective achievement (${pctOf(objective.overallPct)}%).`
      return noMeasure ? `${base} ${pctOf(noMeasure.overallPct)}% do not formally measure at all.` : base
    },
  },
  "Future of mobility": {
    icon: TrendingUp,
    compute: (questions) => {
      const q =
        findFlagshipQuestion(questions, "state") ??
        findFlagshipQuestion(questions, "program") ??
        findFlagshipQuestion(questions, "direction")
      if (!q) return null
      const sorted = [...q.answers].sort((a, b) => b.overallPct - a.overallPct)
      const combined = (sorted[0]?.overallPct ?? 0) + (sorted[1]?.overallPct ?? 0)
      const looksLikeState = sorted.slice(0, 2).some((a) => /optim|review|active|evolv/i.test(a.option))
      if (combined <= 0 || !looksLikeState) return null
      return `Most programs are actively optimizing or reviewing rather than standing still (${pctOf(combined)}% combined across the top two answers).`
    },
  },
  "Employee experience": {
    icon: Users,
    compute: (questions) => {
      const q = findFlagshipQuestion(questions, "employee", "expect") ?? findFlagshipQuestion(questions, "expect")
      if (!q) return null
      const top = topFlagshipAnswer(q)
      if (!top || top.overallPct <= 0) return null
      return `The fastest-rising employee expectation: ${top.option} (${pctOf(top.overallPct)}%).`
    },
  },
  "Leadership expectations": {
    icon: Target,
    compute: (questions) => {
      const q = findFlagshipQuestion(questions, "leadership") ?? findFlagshipQuestion(questions, "expect")
      if (!q) return null
      const top = topFlagshipAnswer(q)
      if (!top || top.overallPct <= 0) return null
      return `Leadership's top rising ask: ${top.option} (${pctOf(top.overallPct)}%).`
    },
  },
  "Operational pressure": {
    icon: Gauge,
    compute: (questions) => {
      const q = findFlagshipQuestion(questions, "pressure")
      if (!q) return null
      const top = topFlagshipAnswer(q)
      if (!top || top.overallPct <= 0) return null
      return `The most-cited pressure: ${top.option} (${pctOf(top.overallPct)}%).`
    },
  },
  "Business travel": {
    icon: Plane,
    compute: (questions) => {
      const q =
        findFlagshipQuestion(questions, "compliance", "account") ??
        findFlagshipQuestion(questions, "accountab") ??
        findFlagshipQuestion(questions, "compliance")
      if (!q) return null
      const top = topFlagshipAnswer(q)
      if (!top || top.overallPct <= 0) return null
      return `Asked who is accountable for a compliance failure, the most common answer is ${top.option} (${pctOf(top.overallPct)}%).`
    },
  },
  "Investment & vendors": {
    icon: Handshake,
    compute: (questions) => {
      const q = findFlagshipQuestion(questions, "outsourc")
      if (!q) return null
      const sorted = [...q.answers].sort((a, b) => b.overallPct - a.overallPct)
      const first = sorted[0]
      const second = sorted[1]
      if (!first || first.overallPct <= 0) return null
      if (!second || second.overallPct <= 0) {
        return `The most outsourced service: ${first.option} (${pctOf(first.overallPct)}%).`
      }
      return `The most outsourced services: ${first.option} (${pctOf(first.overallPct)}%) and ${second.option} (${pctOf(second.overallPct)}%).`
    },
  },
  "International remote work": {
    icon: Globe,
    compute: (questions) => {
      const q = findFlagshipQuestion(questions, "remote", "support") ?? findFlagshipQuestion(questions, "remote")
      if (!q) return null
      const supported = sumFlagshipPct(q, /^yes/i)
      if (supported <= 0) return null
      return `${pctOf(supported)}% of organizations support international remote work.`
    },
  },
  "Who took part": {
    icon: PieChart,
    compute: (questions) => {
      const q =
        findFlagshipQuestion(questions, "headquart") ??
        findFlagshipQuestion(questions, "hq") ??
        findFlagshipQuestion(questions, "location")
      if (!q) return null
      const top = topFlagshipAnswer(q)
      if (!top || top.overallPct <= 0) return null
      return `${pctOf(top.overallPct)}% of contributing organizations are headquartered in ${top.option}.`
    },
  },
}

// -----------------------------------------------------------------------------
// PUBLIC (free-page) FLAGSHIP FORMATTER
// The public RPC get_public_flagship_stats() returns ONE pre-reduced figure per
// theme (headline_pct + headline_label + base_n), never answer arrays. These
// single-figure sentences mirror the dashboard wording above; where the
// dashboard prints two answers, the public version states only the headline one.
// -----------------------------------------------------------------------------

export interface PublicFlagshipStat {
  theme_key: string
  headline_pct: number
  headline_label: string
  base_n: number
}

const PUBLIC_FLAGSHIP_TEMPLATES: Partial<Record<WorkforceTheme, (pct: number, label: string) => string>> = {
  "Strategy & maturity": (pct) => `${pct}% agree the scope and complexity of Global Mobility will grow this year.`,
  "AI & technology": (pct) => `${pct}% are already using or piloting AI in mobility operations.`,
  "Experience & Outcomes": (pct, label) => `The most common way to measure success: ${label} (${pct}%).`,
  "Future of mobility": (pct, label) => `Most programs describe themselves as ${label} (${pct}%).`,
  "Employee experience": (pct, label) => `The fastest-rising employee expectation: ${label} (${pct}%).`,
  "Leadership expectations": (pct, label) => `Leadership's top rising ask: ${label} (${pct}%).`,
  "Operational pressure": (pct, label) => `The most-cited pressure: ${label} (${pct}%).`,
  "Business travel": (pct, label) =>
    `Asked who is accountable for a compliance failure, the most common answer is ${label} (${pct}%).`,
  "Investment & vendors": (pct, label) => `The most outsourced service: ${label} (${pct}%).`,
  "International remote work": (pct) => `${pct}% of organizations support international remote work.`,
  "Who took part": (pct, label) => `${pct}% of contributing organizations are headquartered in ${label}.`,
}

// Format a public stat row into a dashboard-matching sentence, or null when the
// figure is missing/zero so the card degrades to a label-only locked teaser.
export function formatFlagshipSentence(stat: PublicFlagshipStat | undefined | null): string | null {
  if (!stat) return null
  const pct = Math.round(stat.headline_pct)
  if (!Number.isFinite(pct) || pct <= 0) return null
  const template = PUBLIC_FLAGSHIP_TEMPLATES[stat.theme_key as WorkforceTheme]
  if (!template) return null
  return template(pct, stat.headline_label)
}

// -----------------------------------------------------------------------------
// STAT-FIRST PARTS — the same public figure split into a hero percentage and a
// number-free phrase, so the free-page cards can render the percentage huge with
// the phrase beside it. Each phrase reads naturally after the percentage, e.g.
// "68%" + "support international remote work". Returns null on missing/zero data
// so the card falls back to a locked placeholder.
// -----------------------------------------------------------------------------

const PUBLIC_FLAGSHIP_PHRASES: Partial<Record<WorkforceTheme, (label: string) => string>> = {
  "Strategy & maturity": () => "agree the scope and complexity of Global Mobility will grow this year",
  "AI & technology": () => "are already using or piloting AI in mobility operations",
  "Experience & Outcomes": (label) => `measure success by ${label}`,
  "Future of mobility": (label) => `describe their program as ${label}`,
  "Employee experience": (label) => `name ${label} as the fastest-rising employee expectation`,
  "Leadership expectations": (label) => `name ${label} as leadership's top rising ask`,
  "Operational pressure": (label) => `cite ${label} as their top pressure`,
  "Business travel": (label) => `say ${label} is accountable for a compliance failure`,
  "Investment & vendors": (label) => `outsource ${label}`,
  "International remote work": () => "support international remote work",
  "Who took part": (label) => `are headquartered in ${label}`,
}

export function publicFlagshipParts(
  stat: PublicFlagshipStat | undefined | null,
): { pct: number; phrase: string } | null {
  if (!stat) return null
  const pct = Math.round(stat.headline_pct)
  if (!Number.isFinite(pct) || pct <= 0) return null
  const phrase = PUBLIC_FLAGSHIP_PHRASES[stat.theme_key as WorkforceTheme]
  if (!phrase) return null
  return { pct, phrase: phrase(stat.headline_label) }
}
