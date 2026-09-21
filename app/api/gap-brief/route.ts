import { NextResponse } from "next/server"
import { generateText } from "ai"
import { createClient } from "@/lib/supabase/server"
import {
  computeGaps,
  headlinePeerLabel,
  type Gap,
  type OwnAnswerRow,
  type PeerRow,
} from "@/lib/gap-engine"

export const dynamic = "force-dynamic"

const MODEL = "anthropic/claude-sonnet-4.6"

const SYSTEM_PROMPT = `You are CBIQ's insights writer. You write short, direct briefs for Global Mobility leaders about how their program compares with peers. Use only the figures provided in the input JSON. Never invent, recalculate, or extrapolate numbers, and never present any field value from the JSON as a finding unless it appears in the gaps array. Never mention any organization by name. Plain text only: no markdown, no asterisks, no headers with symbols. US English. No em dashes. 'Global Mobility' capitalized. Structure: (1) a two-sentence summary of where the program stands; (2) one short paragraph per gap in the gaps array, in the order given, covering every gap provided and no others, each explaining why it matters given the leadership expectations in the JSON; (3) one closing paragraph on what organizations ahead of this profile typically do next, referencing only the peer statistics and investment areas explicitly present in the JSON, with no invented example metrics. Under 400 words. Confident, useful, never alarmist.`

// Bump to invalidate every previously cached brief when the prompt or payload
// contract changes.
const BRIEF_CACHE_VERSION = "v2"

// Best-effort per-instance cache: brief is kept until the user's answers or the
// peer pool watermark changes (spec section 3).
const briefCache = new Map<string, string>()

function watermark(own: OwnAnswerRow[], peer: PeerRow[]): string {
  const o = own
    .map((r) => `${r.q_code}=${r.answer_option}`)
    .sort()
    .join("|")
  const p = peer.reduce((a, r) => a + Number(r.respondents || 0), 0)
  let h = 0
  const s = `${o}#${p}#${peer.length}`
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return String(h)
}

// Labeled peer investment distribution for the closing paragraph, taken from the
// investment question with the largest anonymity-floored base. Shares only, no
// organization identifiers.
function peerInvestmentStats(
  peer: PeerRow[],
): Array<{ area: string; peer_pct: number; peer_label: string; base_n: number }> {
  const invest = peer.filter((r) => /invest/i.test(r.q_code) || /invest/i.test(r.question_label))
  if (!invest.length) return []
  const byBase = new Map<string, number>()
  for (const r of invest) byBase.set(r.q_code, Math.max(byBase.get(r.q_code) ?? 0, Number(r.base_n) || 0))
  const topQ = [...byBase.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
  return invest
    .filter((r) => r.q_code === topQ && (Number(r.base_n) || 0) > 0)
    .map((r) => ({
      area: r.answer_option,
      peer_pct: Math.round((100 * (Number(r.respondents) || 0)) / (Number(r.base_n) || 1)),
      peer_label: r.peer_label ?? "the wider market",
      base_n: Number(r.base_n) || 0,
    }))
    .sort((a, b) => b.peer_pct - a.peer_pct)
}

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "not_logged_in" }, { status: 401 })

  const [{ data: tierData }, { data: trialData }] = await Promise.all([
    supabase.rpc("current_tier"),
    supabase.rpc("get_trial_status"),
  ])
  const tier = (tierData as string) || "free"
  const onTrial = Boolean((trialData as { on_trial?: boolean } | null)?.on_trial)
  const isPaid = (tier === "premium" && !onTrial) || tier === "vendor"

  // 1) The caller's own answers. RPC missing / not-yet-applied -> empty state.
  const ownRes = await supabase.rpc("get_my_workforce_response")
  if (ownRes.error) {
    return NextResponse.json({ hasResponse: false, isPaid, tier, onTrial, engineReady: false })
  }
  const own = (ownRes.data ?? []) as OwnAnswerRow[]
  if (!own.length) {
    return NextResponse.json({ hasResponse: false, isPaid, tier, onTrial, engineReady: true })
  }

  const first = own[0]
  const segments = {
    region_group: first.region_group ?? null,
    industry_group: first.industry_group ?? null,
    size_band: first.size_band ?? null,
  }

  // 2) Peer distribution (anonymity floor + widening enforced in SQL).
  const peerRes = await supabase.rpc("get_workforce_peer_distribution", {
    p_industry: segments.industry_group,
    p_region: segments.region_group,
    p_size: segments.size_band,
  })
  const peer = (peerRes.error ? [] : ((peerRes.data ?? []) as PeerRow[]))

  // 3) Deterministic engine.
  const allGaps = computeGaps(own, peer)
  const peerLabel = headlinePeerLabel(allGaps)
  const pullDate = new Date().toISOString().slice(0, 10)

  // Paywall boundary: non-paid callers never receive locked stats over the wire.
  const visibleGaps: Gap[] = isPaid ? allGaps : allGaps.slice(0, 2)
  const lockedPreviews = isPaid
    ? []
    : allGaps.slice(2).map((g) => ({ dimension: g.dimension, severity: g.severity }))

  // 4) Narrative layer — Premium only, and never blocks the gap cards.
  let brief: string | null = null
  let briefFailed = false
  if (isPaid && allGaps.length) {
    const key = `${BRIEF_CACHE_VERSION}:${user.id}:${watermark(own, peer)}`
    if (briefCache.has(key)) {
      brief = briefCache.get(key)!
    } else {
      try {
        const payload = {
          user_segments: segments,
          gaps: allGaps.map((g) => ({
            dimension: g.dimension,
            severity: g.severity,
            user_position: g.user_position,
            peer_stat: g.peer_stat,
            peer_base: g.peer_base,
            peer_label: g.peer_label,
          })),
          peer_investment_stats: peerInvestmentStats(peer),
        }
        const { text } = await generateText({
          model: MODEL,
          system: SYSTEM_PROMPT,
          prompt: JSON.stringify(payload),
          temperature: 0.4,
          maxOutputTokens: 700,
        })
        brief = text.trim()
        briefCache.set(key, brief)
      } catch (err) {
        console.error("[v0] gap-brief AI generation failed:", (err as Error).message)
        brief = null
        briefFailed = true
      }
    }
  }

  return NextResponse.json({
    hasResponse: true,
    engineReady: true,
    isPaid,
    tier,
    onTrial,
    peerLabel,
    segments,
    totalGaps: allGaps.length,
    gaps: visibleGaps,
    lockedPreviews,
    brief,
    briefFailed,
    generatedAt: pullDate,
  })
}
