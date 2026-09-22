// =============================================================================
// CBIQ deterministic gap engine.
//
// Pure functions, no database, no AI. It receives the caller's own answers and
// the peer distribution (both already anonymity-floored by the RPC) and emits
// severity-ranked Gap objects. The AI layer only writes prose from these
// objects; it never computes a number.
//
// Question wording is not knowable from the app repo, so every question is
// located by needle regex against q_code / question_label (the same technique
// get_public_flagship_stats uses) and every answer is classified by regex. Any
// dimension whose question or the user's answer cannot be matched is skipped, so
// wording drift produces fewer gaps rather than wrong ones.
// =============================================================================

export type Severity = "attention" | "gap" | "critical"

export interface OwnAnswerRow {
  response_ref: string
  region_group: string | null
  industry_group: string | null
  size_band: string | null
  q_code: string
  question_label: string
  answer_option: string
}

export interface PeerRow {
  q_code: string
  question_label: string
  answer_option: string
  respondents: number
  base_n: number
  peer_level: string
  peer_label: string
}

export interface Gap {
  id: string
  dimension: string
  severity: Severity
  user_position: string
  peer_stat: string
  peer_base: number
  peer_label: string
}

export interface UserSegments {
  region_group: string | null
  industry_group: string | null
  size_band: string | null
}

const SEVERITY_RANK: Record<Severity, number> = { critical: 0, gap: 1, attention: 2 }

// -----------------------------------------------------------------------------
// Question needles. Dimensions backed by a stable survey code (E-codes) match on
// q_code ONLY. Dimensions from the survey wave where the q_code stores the full
// question text (success, business travel) match q_code first, label as a
// fallback. CONFIRM against stored wording if a dimension never appears.
// -----------------------------------------------------------------------------
const NEEDLE = {
  tech: { code: /^E16$/i, label: /technology to manage.*(global )?mobility/i },
  ai: { code: /^E10$/i, label: /use of ai|adoption of ai/i },
  leadership: { code: /^E6$/i, label: /leadership.*expectation|expectations.*rising/i },
  investment: { code: /^E13$/i, label: /investment or transformation/i },
  pressure: { code: /^E7$/i, label: /operational pressure/i },
  success: { code: /measure the success/i, label: /measure the success/i },
  btPolicy: { code: /business travel.*polic|travel compliance polic/i, label: /business travel.*polic/i },
  btDays: { code: /track.*(traveller|traveler).*days|(traveller|traveler) days.*track/i, label: /track.*(traveller|traveler).*days/i },
  btAccount: { code: /accountab/i, label: /accountab.*(compliance|failure)|who is accountable/i },
}

type NeedleKey = keyof typeof NEEDLE

// E-code dimensions must match strictly on q_code; their label is never consulted,
// so an unrelated question that happens to share wording cannot be miscaptured.
// The text-keyed dimensions (q_code holds the full question text this wave) match
// q_code first, then label.
const CODE_ONLY: ReadonlySet<NeedleKey> = new Set(["tech", "ai", "leadership", "investment", "pressure"])

function matchesNeedle(qCode: string, qLabel: string, key: NeedleKey): boolean {
  const n = NEEDLE[key]
  if (CODE_ONLY.has(key)) return n.code.test(qCode ?? "")
  return n.code.test(qCode ?? "") || n.label.test(qLabel ?? "")
}

// Answer-class regexes.
const CLASS = {
  techManual: /spreadsheet|manual|general office|\bexcel\b|\bemail\b|word process/i,
  techDedicatedPartial: /dedicated|partial|platform|point solution|specialist|purpose-built/i,
  techEvaluating: /evaluat|procur|selecting|assessing/i,
  noFormalMeasure: /do not (formally )?measure|not formally measure|no formal|(do not|don['\u2019]t) measure/i,
  roi: /\broi\b|return on investment/i,
  aiNotUsing: /not currently using|not using|\bno\b.*\bai\b|\bnone\b/i,
  aiProdPilot: /production|pilot|already using|in use|piloting|deployed/i,
  aiProduction: /production|in use|deployed|already using/i,
  aiPlanning: /planning|plan to|intend|exploring/i,
  reportingRoi: /report|\broi\b|return on investment|measurement|analytics/i,
  btNo: /^no\b|\bnone\b|do not|does not|(do not|don['\u2019]t)|no policy/i,
  btNotTracked: /^no\b|not track|(do not|don['\u2019]t) track|do not track|not measured/i,
  btNobody: /nobody|no one|not clearly|unclear|no single|no owner/i,
}

// Leadership expectation -> investment focus mapping (spec section G4).
const LEADERSHIP_TO_INVESTMENT: Array<{ label: string; expect: RegExp; invest: RegExp }> = [
  { label: "cost control", expect: /cost/i, invest: /cost optimization|process automation/i },
  { label: "AI adoption", expect: /\bai\b|artificial/i, invest: /ai-enabled|ai enabled|ai workflow/i },
  { label: "compliance assurance", expect: /complian|risk/i, invest: /risk|complian/i },
  { label: "better reporting", expect: /report|analytics|data|visibility/i, invest: /data visibility|analytics|reporting/i },
]

// Operational pressure -> investment focus mapping (spec section G6).
const PRESSURE_TO_INVESTMENT: Array<{ label: string; pressure: RegExp; invest: RegExp }> = [
  { label: "immigration pressure", pressure: /immigration/i, invest: /immigration/i },
  { label: "cost management", pressure: /cost/i, invest: /cost optimization/i },
  { label: "legacy systems", pressure: /legacy|system|technolog/i, invest: /mobility technology|process automation|technolog/i },
]

// -----------------------------------------------------------------------------
// Peer-side helpers
// -----------------------------------------------------------------------------
interface PeerQuestion {
  q_code: string
  question_label: string
  base_n: number
  peer_label: string
  peer_level: string
  options: Array<{ answer_option: string; respondents: number }>
}

function groupPeer(peer: PeerRow[]): PeerQuestion[] {
  const map = new Map<string, PeerQuestion>()
  for (const row of peer) {
    let q = map.get(row.q_code)
    if (!q) {
      q = {
        q_code: row.q_code,
        question_label: row.question_label ?? "",
        base_n: Number(row.base_n) || 0,
        peer_label: row.peer_label ?? "the wider market",
        peer_level: row.peer_level ?? "market",
        options: [],
      }
      map.set(row.q_code, q)
    }
    q.options.push({ answer_option: row.answer_option ?? "", respondents: Number(row.respondents) || 0 })
  }
  return [...map.values()]
}

// The matching question with the largest base, mirroring the flagship RPC.
function findPeerQuestion(peer: PeerQuestion[], key: NeedleKey): PeerQuestion | null {
  const hits = peer
    .filter((q) => matchesNeedle(q.q_code, q.question_label, key))
    .sort((a, b) => b.base_n - a.base_n)
  return hits[0] ?? null
}

// Share (0-100) of distinct peer respondents whose answer matches a class.
function peerShare(q: PeerQuestion | null, cls: RegExp): number | null {
  if (!q || q.base_n <= 0) return null
  const matched = q.options
    .filter((o) => cls.test(o.answer_option))
    .reduce((max, o) => Math.max(max, o.respondents), 0)
  // Options are per-answer distinct counts; the largest matching option is the
  // representative share for a single-select class. For sum classes we add them.
  const summed = q.options.filter((o) => cls.test(o.answer_option)).reduce((a, o) => a + o.respondents, 0)
  const value = summed > q.base_n ? matched : summed
  return Math.round((100 * value) / q.base_n)
}

// -----------------------------------------------------------------------------
// User-side helpers
// -----------------------------------------------------------------------------
function userAnswers(own: OwnAnswerRow[], key: NeedleKey): string[] {
  return own
    .filter((r) => matchesNeedle(r.q_code, r.question_label, key))
    .map((r) => r.answer_option)
    .filter(Boolean)
}

function anyMatch(answers: string[], cls: RegExp): boolean {
  return answers.some((a) => cls.test(a))
}

// =============================================================================
// The engine
// =============================================================================
export function computeGaps(own: OwnAnswerRow[], peer: PeerRow[]): Gap[] {
  const gaps: Gap[] = []
  const pq = groupPeer(peer)

  // ---- G1 Technology foundation -------------------------------------------
  const techQ = findPeerQuestion(pq, "tech")
  const techUser = userAnswers(own, "tech")
  if (techUser.length) {
    const dedicatedShare = peerShare(techQ, CLASS.techDedicatedPartial)
    // Precedence: dedicated/partial is tested first and wins. The canonical
    // "Partially" option contains the word "manual", so an answer that is
    // dedicated or partial must never be classified as manual. Only a non-
    // dedicated/partial answer can be manual, and only then evaluating.
    const isDedicatedPartial = anyMatch(techUser, CLASS.techDedicatedPartial)
    const isManual = !isDedicatedPartial && anyMatch(techUser, CLASS.techManual)
    const isEvaluating = !isDedicatedPartial && !isManual && anyMatch(techUser, CLASS.techEvaluating)
    if (isManual && dedicatedShare !== null && dedicatedShare >= 50) {
      gaps.push({
        id: "G1",
        dimension: "Technology foundation",
        severity: "critical",
        user_position: "You run the program on spreadsheets and general office tools.",
        peer_stat: `${dedicatedShare}% of ${techQ!.peer_label} run dedicated or partially supported platforms.`,
        peer_base: techQ!.base_n,
        peer_label: techQ!.peer_label,
      })
    } else if (isEvaluating && dedicatedShare !== null) {
      gaps.push({
        id: "G1",
        dimension: "Technology foundation",
        severity: "attention",
        user_position: "You are evaluating or procuring a mobility platform.",
        peer_stat: `${dedicatedShare}% of ${techQ!.peer_label} already run dedicated or partially supported platforms.`,
        peer_base: techQ!.base_n,
        peer_label: techQ!.peer_label,
      })
    }
  }

  // ---- G2 Measurement and ROI ---------------------------------------------
  const successQ = findPeerQuestion(pq, "success")
  const successUser = userAnswers(own, "success")
  const leadershipQ = findPeerQuestion(pq, "leadership")
  if (successUser.length) {
    if (anyMatch(successUser, CLASS.noFormalMeasure)) {
      const noMeasure = peerShare(successQ, CLASS.noFormalMeasure)
      const rising = peerShare(leadershipQ, CLASS.reportingRoi)
      if (noMeasure !== null) {
        const yClause =
          rising !== null && leadershipQ
            ? ` Leadership's fastest-rising expectations include better reporting and ROI measurement (${rising}% of ${leadershipQ.peer_label}).`
            : ""
        gaps.push({
          id: "G2",
          dimension: "Measurement and ROI",
          severity: "critical",
          user_position: "You do not formally measure program success.",
          peer_stat: `${noMeasure}% of ${successQ!.peer_label} do not formally measure success.${yClause}`,
          peer_base: successQ!.base_n,
          peer_label: successQ!.peer_label,
        })
      }
    } else if (!anyMatch(successUser, CLASS.roi)) {
      const roiShare = peerShare(successQ, CLASS.roi)
      if (roiShare !== null) {
        gaps.push({
          id: "G2",
          dimension: "Measurement and ROI",
          severity: "gap",
          user_position: "You measure program success, but not ROI.",
          peer_stat: `ROI is measured by only ${roiShare}% of ${successQ!.peer_label}, against a rising leadership expectation.`,
          peer_base: successQ!.base_n,
          peer_label: successQ!.peer_label,
        })
      }
    }
  }

  // ---- G3 AI adoption ------------------------------------------------------
  const aiQ = findPeerQuestion(pq, "ai")
  const aiUser = userAnswers(own, "ai")
  if (aiUser.length && aiQ) {
    const prodPilot = peerShare(aiQ, CLASS.aiProdPilot)
    const production = peerShare(aiQ, CLASS.aiProduction)
    if (anyMatch(aiUser, CLASS.aiNotUsing) && prodPilot !== null && prodPilot >= 40) {
      gaps.push({
        id: "G3",
        dimension: "AI adoption",
        severity: "gap",
        user_position: "You are not currently using AI in the program.",
        peer_stat: `${prodPilot}% of ${aiQ.peer_label} are piloting or already in production.`,
        peer_base: aiQ.base_n,
        peer_label: aiQ.peer_label,
      })
    } else if (anyMatch(aiUser, CLASS.aiPlanning) && production !== null) {
      gaps.push({
        id: "G3",
        dimension: "AI adoption",
        severity: "attention",
        user_position: "You are planning AI adoption.",
        peer_stat: `${production}% of ${aiQ.peer_label} are already in production.`,
        peer_base: aiQ.base_n,
        peer_label: aiQ.peer_label,
      })
    }
  }

  // ---- G4 Leadership alignment --------------------------------------------
  const investUser = userAnswers(own, "investment")
  const investQ = findPeerQuestion(pq, "investment")
  const leadershipUser = userAnswers(own, "leadership")
  if (leadershipUser.length) {
    for (const map of LEADERSHIP_TO_INVESTMENT) {
      const expected = leadershipUser.find((a) => map.expect.test(a))
      if (!expected) continue
      const hasInvestment = anyMatch(investUser, map.invest)
      if (!hasInvestment) {
        const investShare = peerShare(investQ, map.invest)
        gaps.push({
          id: `G4:${map.label}`,
          dimension: "Leadership alignment",
          severity: "gap",
          user_position: `Leadership expects ${expected}, but it does not appear in your investment plans.`,
          peer_stat:
            investShare !== null && investQ
              ? `${investShare}% of ${investQ.peer_label} are investing here.`
              : "This is not reflected in your current investment focus.",
          peer_base: investQ?.base_n ?? 0,
          peer_label: investQ?.peer_label ?? "the wider market",
        })
      }
    }
  }

  // ---- G5 Business travel governance ---------------------------------------
  const policyUser = userAnswers(own, "btPolicy")
  const daysUser = userAnswers(own, "btDays")
  const accountUser = userAnswers(own, "btAccount")
  const accountQ = findPeerQuestion(pq, "btAccount")
  const daysQ = findPeerQuestion(pq, "btDays")
  const btFlags: string[] = []
  if (policyUser.length && anyMatch(policyUser, CLASS.btNo)) btFlags.push("no travel policy")
  if (daysUser.length && anyMatch(daysUser, CLASS.btNotTracked)) btFlags.push("traveler days not tracked")
  if (accountUser.length && anyMatch(accountUser, CLASS.btNobody)) btFlags.push("nobody clearly accountable")
  if (btFlags.length) {
    const nobodyShare = peerShare(accountQ, CLASS.btNobody)
    const notTrackedShare = peerShare(daysQ, CLASS.btNotTracked)
    const stats: string[] = []
    if (nobodyShare !== null && accountQ)
      stats.push(`the most common accountability answer across ${accountQ.peer_label} is that nobody is clearly responsible (${nobodyShare}%)`)
    if (notTrackedShare !== null && daysQ)
      stats.push(`${notTrackedShare}% do not track traveler days`)
    const base = accountQ?.base_n ?? daysQ?.base_n ?? 0
    gaps.push({
      id: "G5",
      dimension: "Business travel governance",
      severity: btFlags.length >= 3 ? "critical" : "gap",
      user_position: `Your program has ${btFlags.join(", ")}.`,
      peer_stat: stats.length ? `${stats.join("; ")}.` : "Peer governance is stronger on business travel.",
      peer_base: base,
      peer_label: accountQ?.peer_label ?? daysQ?.peer_label ?? "the wider market",
    })
  }

  // ---- G6 Pressure response -------------------------------------------------
  const pressureUser = userAnswers(own, "pressure")
  if (pressureUser.length) {
    for (const map of PRESSURE_TO_INVESTMENT) {
      const pressed = pressureUser.find((a) => map.pressure.test(a))
      if (!pressed) continue
      if (!anyMatch(investUser, map.invest)) {
        const investShare = peerShare(investQ, map.invest)
        gaps.push({
          id: `G6:${map.label}`,
          dimension: "Pressure response",
          severity: "attention",
          user_position: `You rank ${pressed} as a top pressure, with no matching investment.`,
          peer_stat:
            investShare !== null && investQ
              ? `${investShare}% of ${investQ.peer_label} are investing in this area.`
              : "Peers under the same pressure are investing to relieve it.",
          peer_base: investQ?.base_n ?? 0,
          peer_label: investQ?.peer_label ?? "the wider market",
        })
      }
    }
  }

  // Severity-ordered, stable within a severity.
  return gaps
    .map((g, i) => ({ g, i }))
    .sort((a, b) => SEVERITY_RANK[a.g.severity] - SEVERITY_RANK[b.g.severity] || a.i - b.i)
    .map(({ g }) => g)
}

// Headline peer label: the label used by the most gaps (industry when available).
export function headlinePeerLabel(gaps: Gap[]): string {
  if (!gaps.length) return "your peer set"
  const counts = new Map<string, number>()
  for (const g of gaps) counts.set(g.peer_label, (counts.get(g.peer_label) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]
}
