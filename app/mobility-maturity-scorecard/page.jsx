"use client"

import { useState, useEffect, useRef } from "react"
import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { Button } from "@/components/ui/button"
import { CircularGauge } from "@/components/dashboard-ui"
import { createClient } from "@/lib/supabase/client"
import { toPng } from "html-to-image"
import { ChevronRight, ChevronLeft, ChevronDown, Lock, ArrowRight, Check, Share2, X } from "lucide-react"

/*
  CBIQ — Mobility Maturity Scorecard
  ----------------------------------
  Visual layer restyled to the app's design system (dark navy/teal tokens,
  Geist fonts, shadcn Button) and wrapped in the standard GlobalNav/GlobalFooter
  chrome. Flow, gauge behaviour, copy, scoring logic, mock data, and the
  email/share stubs are unchanged from the prototype.

  >>> Everything marked MOCK is sample data. In production these come from your
  >>> Supabase RPCs (get_premium_mmi / get_premium_breakdown_core) by segment,
  >>> and the email capture posts to the same survey-to-trial path you already run.
*/

// --------------------------- benchmark cohort -----------------------
// Cohort figures come live from the public Supabase RPC get_scorecard_cohort(...).
// These industry strings match the benchmark's industry_group values exactly.
const INDUSTRIES = ["Technology & IT", "Financial Services", "Professional Services",
  "Healthcare & Life Sciences", "Energy & Utilities", "Manufacturing & Industrial",
  "Media & Entertainment", "Retail & Consumer", "Other"]
const REGIONS = ["Americas", "Europe", "Middle East", "Africa", "Asia-Pacific (APAC & Australia)"]
const SIZES = ["Fewer than 250", "250 – 999", "1,000 – 4,999", "5,000 – 9,999",
  "10,000 – 24,999", "25,000 – 49,999", "50,000+"]
// Assignee-population ranges — identical to the Premium Dashboard peer-segment
// filters of the same names (excluding the "All" default). Collected for the
// benchmark; not used in scoring or the cohort call.
const LONGTERM_OPTIONS = ["1–50", "51–100", "101–500", "501–1,000", "More than 1,000"]
const TRAVELLER_OPTIONS = ["None", "1–100", "101–500", "501–1,000", "1,001–5,000", "5,001–10,000", "More than 10,000"]

// ----------------------------- questions ----------------------------
const AGREE = ["Strongly disagree", "Disagree", "Slightly disagree", "Neutral",
  "Slightly agree", "Agree", "Strongly agree"] // 1..7

const SCALE_Q = [
  { id: "Q19", leg: "strategy", label: "We have a defined Global Mobility strategy." },
  { id: "Q20", leg: "alignment", label: "Our Global Mobility strategy is well aligned to the broader organizational strategy." },
  { id: "Q22", leg: "future", label: "The scope and complexity of Global Mobility will grow over the next 12 months." },
]
const CHOICE_Q = [
  {
    id: "E10", leg: "techai", label: "What best describes your use of AI in Global Mobility today?",
    options: [
      { t: "In production across workflows", v: 100 },
      { t: "Piloting in selected areas", v: 67 },
      { t: "Exploring, nothing live yet", v: 33 },
      { t: "Not using AI", v: 0 },
    ],
  },
  {
    id: "E16", leg: "techai", label: "Are you using technology to manage your Global Mobility program?",
    options: [
      { t: "A dedicated mobility / assignment platform", v: 100 },
      { t: "Partial — some tasks are tech-supported", v: 55 },
      { t: "Mainly spreadsheets and office tools", v: 25 },
      { t: "No dedicated technology", v: 0 },
    ],
  },
]
const TOTAL_STEPS = 1 + SCALE_Q.length + CHOICE_Q.length // segment + 5
const QUESTION_COUNT = SCALE_Q.length + CHOICE_Q.length // 5 scoring questions

// ----------------------------- scoring ------------------------------
// Binary scoring mirrors the benchmark exactly so the taker's score is
// directly comparable to the cohort returned by get_scorecard_cohort.
const E10_YES = ["In production across workflows", "Piloting in selected areas"]
const E16_YES = ["A dedicated mobility / assignment platform", "Partial — some tasks are tech-supported"]

function computeResult(answers) {
  // 1..7 scale: top-2 box (6 or 7) counts as 100, else 0.
  const strategy = answers.Q19 === 6 || answers.Q19 === 7 ? 100 : 0
  const alignment = answers.Q20 === 6 || answers.Q20 === 7 ? 100 : 0
  const future = answers.Q22 === 6 || answers.Q22 === 7 ? 100 : 0
  // techai = (E10 flag + E16 flag) / 2 * 100 -> 0, 50, or 100.
  const e10 = E10_YES.includes(answers.E10) ? 1 : 0
  const e16 = E16_YES.includes(answers.E16) ? 1 : 0
  const techai = ((e10 + e16) / 2) * 100
  const legs = { strategy, alignment, future, techai }
  const score = Math.round((strategy + alignment + future + techai) / 4)
  return { score, legs }
}
function cdf(z) { // Abramowitz-Stegun approximation
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp(-z * z / 2)
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return z > 0 ? 1 - p : p
}
function archetype(s) {
  if (s >= 80) return { name: "Strategic Leader", line: "Mobility is a strategic, well-aligned function with mature technology and AI. You're operating ahead of most peers." }
  if (s >= 60) return { name: "Established", line: "A defined strategy and solid foundations. The gap to leading sits in alignment, future-readiness, or tech depth." }
  if (s >= 40) return { name: "Building Momentum", line: "The pieces are forming. Strategy and tooling are partway there, with clear room to tighten alignment and adoption." }
  return { name: "Reactive", line: "Mobility runs operationally without a defined strategic core. The biggest gains are in strategy and technology foundations." }
}

// =================================================================
export default function MobilityMaturityScorecardPage() {
  const [step, setStep] = useState(-1) // -1 intro, 0 segment, 1..5 questions, 99 result
  const [segment, setSegment] = useState({ industry: "", region: "", size: "", longTerm: "", traveller: "" })
  const [answers, setAnswers] = useState({})

  const reset = () => { setStep(-1); setSegment({ industry: "", region: "", size: "", longTerm: "", traveller: "" }); setAnswers({}) }

  return (
    <div className="relative min-h-screen flex flex-col bg-brand-navy text-foreground">
      <style>{`
        @media (prefers-reduced-motion: reduce){ *{ transition:none !important; animation:none !important; } }
        .tnum{ font-variant-numeric: tabular-nums; }
        .lift{ transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease; }
        .lift:hover{ transform: translateY(-1px); }
      `}</style>

      {/* Homepage background treatment: global network texture, navy overlay,
          teal radial glows, and a bottom fade — fixed so it sits behind every step. */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <img
          src="/images/hero-network.jpg"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-brand-navy/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--brand-teal-deep-rgb)_/_0.4),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgb(var(--brand-teal-deep-rgb)_/_0.15),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_55%,var(--brand-navy)_100%)]" />
      </div>

      <GlobalNav />

      <main className="relative flex-1 w-full">
        <div className="mx-auto w-full max-w-[720px] px-5 py-10 sm:py-14">
          {step !== -1 && (
            <div className="flex justify-end mb-6">
              <button
                onClick={reset}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Start over
              </button>
            </div>
          )}

          {step === -1 && <Intro onStart={() => setStep(0)} />}
          {step === 0 && (
            <Segment
              segment={segment} setSegment={setSegment}
              onNext={() => setStep(1)}
            />
          )}
          {step >= 1 && step <= 5 && (
            <Questions
              step={step} answers={answers} setAnswers={setAnswers}
              onBack={() => setStep(step - 1)}
              onNext={() => setStep(step + 1 > 5 ? 99 : step + 1)}
            />
          )}
          {step === 99 && <Result segment={segment} answers={answers} onRestart={reset} />}
        </div>
      </main>

      <div className="relative">
        <GlobalFooter />
      </div>
    </div>
  )
}

// ----------------------------- intro --------------------------------
function Intro({ onStart }) {
  const [leadersBenchmarked, setLeadersBenchmarked] = useState("1,200+")

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.rpc("get_leaders_benchmarked")
        if (!active || error || data == null) return
        const floored = Math.floor(Number(data) / 100) * 100
        setLeadersBenchmarked(floored.toLocaleString("en-US") + "+")
      } catch (_) {
        // keep the default fallback on any error
      }
    })()
    return () => {
      active = false
    }
  }, [])

  return (
    <div>
      <div className="font-mono text-xs uppercase tracking-[0.15em] text-brand-teal mb-4">
        Free benchmark · ~3 minutes
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05] text-balance mb-4">
        Mobility Maturity<br />Scorecard
      </h1>
      <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-[540px] mb-7">
        Tell us about your organization, answer five quick questions and get your Mobility Maturity
        Index score, benchmarked against Global Mobility, HR and Talent leaders in your industry.
      </p>
      <div className="flex flex-wrap gap-x-8 gap-y-4 mb-8">
        {[["5", "questions"], ["1", "personal score"], [leadersBenchmarked, "leaders benchmarked"]].map(([n, l]) => (
          <div key={l}>
            <div className="tnum font-mono text-2xl font-bold text-foreground">{n}</div>
            <div className="text-xs text-muted-foreground">{l}</div>
          </div>
        ))}
      </div>
      <Button size="lg" onClick={onStart} className="gap-2">
        Get my score <ArrowRight size={17} />
      </Button>
      <p className="text-xs text-muted-foreground mt-4 max-w-[480px]">
        Your answers are anonymized and aggregated into the benchmark. Contact details are never shared.
      </p>
    </div>
  )
}

// ----------------------------- segment ------------------------------
function Segment({ segment, setSegment, onNext }) {
  const ready = segment.industry && segment.region && segment.size && segment.longTerm && segment.traveller
  const set = (k) => (e) => setSegment({ ...segment, [k]: e.target.value })
  return (
    <div>
      <Progress setup />
      <h2 className="text-2xl font-bold tracking-tight mt-5 mb-1.5">First, your peer group</h2>
      <p className="text-sm text-muted-foreground mb-6">
        We'll compare your score to leaders who match your profile.
      </p>
      <Field label="Industry"><Select value={segment.industry} onChange={set("industry")} options={INDUSTRIES} /></Field>
      <Field label="Headquarters region"><Select value={segment.region} onChange={set("region")} options={REGIONS} /></Field>
      <Field label="Employees globally"><Select value={segment.size} onChange={set("size")} options={SIZES} /></Field>
      <Field label="Approx. number of long-term & permanent"><Select value={segment.longTerm} onChange={set("longTerm")} options={LONGTERM_OPTIONS} /></Field>
      <Field label="Approx. number of short-term & business travel"><Select value={segment.traveller} onChange={set("traveller")} options={TRAVELLER_OPTIONS} /></Field>
      <div className="mt-3">
        <Button size="lg" onClick={onNext} disabled={!ready} className="gap-2">
          Continue <ChevronRight size={17} />
        </Button>
      </div>
    </div>
  )
}

// --------------------------- questions ------------------------------
function Questions({ step, answers, setAnswers, onBack, onNext }) {
  // step 1..3 -> scale questions; 4..5 -> choice questions
  const isScale = step <= SCALE_Q.length
  const q = isScale ? SCALE_Q[step - 1] : CHOICE_Q[step - 1 - SCALE_Q.length]
  const current = answers[q.id]
  const answered = current !== undefined

  const pick = (val) => {
    const next = { ...answers, [q.id]: val }
    setAnswers(next)
    setTimeout(onNext, 220) // auto-advance, with a beat to register the choice
  }

  return (
    <div>
      <Progress step={step} />
      <div className="font-mono text-xs text-muted-foreground mt-5 mb-2.5">
        {q.id} · {legName(q.leg)}
      </div>
      <h2 className="text-xl sm:text-2xl font-bold leading-snug tracking-tight mb-6 max-w-[600px]">{q.label}</h2>

      {isScale ? (
        <ScaleInput value={current} onPick={pick} />
      ) : (
        <div className="grid gap-2.5">
          {q.options.map((o) => (
            <OptionRow key={o.t} active={current === o.t} onClick={() => pick(o.t)}>{o.t}</OptionRow>
          ))}
        </div>
      )}

      <div className="mt-7 flex justify-between items-center">
        <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={15} /> Back
        </button>
        {answered && (
          <button onClick={onNext} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-teal hover:opacity-80 transition-opacity">
            Next <ChevronRight size={15} />
          </button>
        )}
      </div>
    </div>
  )
}

function ScaleInput({ value, onPick }) {
  return (
    <div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => {
          const on = value === n
          return (
            <button
              key={n}
              onClick={() => onPick(n)}
              className={`lift flex-1 h-13 min-h-12 rounded-lg font-mono text-base font-bold border transition-colors ${
                on
                  ? "border-brand-teal bg-brand-teal text-white"
                  : "border-border bg-card text-foreground hover:border-brand-teal/50"
              }`}
            >
              {n}
            </button>
          )
        })}
      </div>
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>{AGREE[0]}</span><span>{AGREE[6]}</span>
      </div>
    </div>
  )
}

function OptionRow({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`lift text-left px-4 py-3.5 rounded-xl text-sm border flex items-center justify-between gap-3 transition-colors ${
        active ? "border-brand-teal bg-brand-teal/10" : "border-border bg-card hover:border-brand-teal/50"
      } text-foreground`}
    >
      <span>{children}</span>
      <span className={`w-[18px] h-[18px] rounded-full flex-shrink-0 grid place-items-center border ${
        active ? "border-brand-teal bg-brand-teal" : "border-border bg-transparent"
      }`}>
        {active && <Check size={12} className="text-white" />}
      </span>
    </button>
  )
}

// ----------------------------- result -------------------------------
function Result({ segment, answers, onRestart }) {
  const r = computeResult(answers)
  const a = archetype(r.score)
  const [prog, setProg] = useState(0)
  const [cohort, setCohort] = useState({ loading: true, error: false, row: null, usedOverall: false })
  const [unlocked, setUnlocked] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  // Pull the peer cohort from Supabase when the result screen mounts.
  // v1: industry only; region/size left null. Score is computed locally and
  // renders immediately — only the peer line and breakdown wait on this.
  useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    const call = (p) => supabase.rpc("get_scorecard_cohort", p)
    async function load() {
      try {
        const first = await call({ p_industry: segment.industry || null, p_region: null, p_size: null })
        if (first.error) throw first.error
        let row = Array.isArray(first.data) ? first.data[0] : first.data
        let usedOverall = false
        // Thin-base guard: under 20 responses, fall back to the overall cohort.
        if (row && typeof row.base_n === "number" && row.base_n < 20) {
          const overall = await call({ p_industry: null, p_region: null, p_size: null })
          if (!overall.error) {
            const orow = Array.isArray(overall.data) ? overall.data[0] : overall.data
            if (orow) { row = orow; usedOverall = true }
          }
        }
        if (!cancelled) setCohort({ loading: false, error: !row, row: row || null, usedOverall })
      } catch {
        if (!cancelled) setCohort({ loading: false, error: true, row: null, usedOverall: false })
      }
    }
    load()
    return () => { cancelled = true }
  }, [segment.industry])

  useEffect(() => {
    if (reduce) { setProg(1); return }
    let raf, start
    const dur = 1150
    const tick = (t) => {
      if (!start) start = t
      const p = Math.min(1, (t - start) / dur)
      setProg(easeOut(p))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, []) // eslint-disable-line

  const shown = Math.round(r.score * prog)

  // Percentile vs the cohort, using the existing CDF helper. Needs a non-zero SD.
  const row = cohort.row
  const hasPct = !!row && typeof row.mmi_sd === "number" && row.mmi_sd > 0
  const pct = hasPct
    ? Math.max(1, Math.min(99, Math.round(cdf((r.score - row.mmi) / row.mmi_sd) * 100)))
    : null
  const cohortLabel = cohort.usedOverall
    ? "Global Mobility and HR leaders in the CBIQ benchmark"
    : `Global Mobility and HR leaders in the ${segment.industry || "your"} sector in the CBIQ benchmark`

  // Reveal immediately on a valid email; fire the trusted write in the background.
  // We never block the un-blur on the server response.
  const handleUnlock = ({ email, companyWebsite }) => {
    setUnlocked(true)
    const e10Index = CHOICE_Q[0].options.findIndex((o) => o.t === answers.E10)
    const e16Index = CHOICE_Q[1].options.findIndex((o) => o.t === answers.E16)
    const payload = {
      email,
      segment: {
        industry: segment.industry,
        region: segment.region,
        size: segment.size,
        longTerm: segment.longTerm,
        shortTerm: segment.traveller,
      },
      q19: answers.Q19,
      q20: answers.Q20,
      q22: answers.Q22,
      e10Index,
      e16Index,
      company_website: companyWebsite,
    }
    fetch("/api/scorecard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {})
  }

  return (
    <div>
      <div className="font-mono text-xs uppercase tracking-[0.12em] text-brand-teal mb-1">
        Your result
      </div>

      {/* gauge + headline */}
      <div className="bg-brand-navy-2 rounded-2xl px-6 pt-8 pb-7 mb-4 border-2 border-primary/50 shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.4)]">
        <div className="flex flex-col items-center text-center">
          <CircularGauge value={r.score * prog} max={100} size={176} stroke={13} label={String(shown)} sublabel="/100" />
          <div className="text-xs text-slate-400 mt-4 font-mono uppercase tracking-[0.15em]">Mobility Maturity Index · 0–100</div>
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mt-3">{a.name}</span>
          <p className="text-sm leading-relaxed text-slate-300 max-w-[460px] mx-auto mt-3">{a.line}</p>
        </div>
      </div>

      {/* the ONE free peer line — driven by the live cohort */}
      {cohort.loading ? (
        <div className="bg-brand-navy-2 border border-primary/15 rounded-xl px-5 py-4.5 mb-4 flex gap-3.5 items-center animate-pulse">
          <div className="h-8 w-14 rounded bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-full rounded bg-white/10" />
            <div className="h-3 w-2/3 rounded bg-white/10" />
          </div>
        </div>
      ) : !cohort.error && row ? (
        <div className="bg-brand-navy-2 border border-primary/15 rounded-xl px-5 py-4.5 mb-4 flex gap-3.5 items-center">
          {hasPct && <div className="tnum font-mono text-3xl font-extrabold text-brand-teal min-w-16">{pct}%</div>}
          <div className="text-sm leading-snug text-foreground">
            {hasPct ? (
              <>
                You scored higher than <strong>{pct}% of {cohortLabel}</strong>.{" "}
                Your cohort averages <span className="tnum font-mono font-bold">{Math.round(row.mmi)}</span>.
              </>
            ) : (
              <>Your cohort averages <span className="tnum font-mono font-bold">{Math.round(row.mmi)}</span>.</>
            )}
          </div>
        </div>
      ) : null}

      {/* gated depth */}
      {cohort.loading ? (
        <div className="border border-primary/20 bg-brand-navy-2 rounded-xl mb-4 h-[188px] animate-pulse" />
      ) : !cohort.error && row ? (
        <LockedBreakdown
          legs={r.legs}
          peers={{ strategy: row.strategy, alignment: row.alignment, future: row.future, techai: row.techai }}
          unlocked={unlocked}
        />
      ) : null}

      {/* CTA */}
      <TrialCTA onUnlock={handleUnlock} />

      <div className="flex gap-3.5 justify-center mt-5">
        <button onClick={onRestart} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Retake</button>
        <span className="text-border">·</span>
        <button onClick={() => setShowShare(true)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Share2 size={14} /> Share your score
        </button>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-4.5">
        Prototype with sample benchmark data. Live scores draw on the GWD survey.
      </p>

      {showShare && (
        <ShareCardModal
          score={r.score}
          archetype={a.name}
          pct={pct}
          hasPct={hasPct}
          industry={segment.industry}
          usedOverall={cohort.usedOverall}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  )
}

// LinkedIn-ready share card. Visual only for now — no download/share actions.
// Rendered at a fixed 1080-wide, square-minimum canvas and scaled to fit the
// viewport (both axes) so the whole card — footer included — is always visible.
function ShareCardModal({ score, archetype, pct, hasPct, industry, usedOverall, onClose }) {
  const cardRef = useRef(null)
  const [fit, setFit] = useState({ scale: 0.4, h: 1080 })
  useEffect(() => {
    const recompute = () => {
      // offsetHeight is the pre-transform layout height (>= 1080 via min-height).
      const natural = cardRef.current ? cardRef.current.offsetHeight : 1080
      const availW = Math.min(window.innerWidth - 48, 560)
      const availH = window.innerHeight - 120
      const scale = Math.min(availW / 1080, availH / natural)
      setFit({ scale, h: natural })
    }
    recompute()
    const raf = requestAnimationFrame(recompute) // re-measure once layout settles
    window.addEventListener("resize", recompute)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", recompute)
    }
  }, [])

  const sector = !usedOverall && industry ? ` in the ${industry} sector` : ""
  const peerLine = hasPct
    ? `Higher than ${pct}% of Global Mobility and HR leaders${sector}`
    : `Benchmarked against Global Mobility and HR leaders${sector}`

  const [downloading, setDownloading] = useState(false)

  // Export the full-resolution card (not the scaled preview). We override the
  // preview's scale transform to none and pin the canvas to its natural 1080px
  // width at 2x pixel ratio so the PNG is crisp.
  const handleDownload = async () => {
    if (!cardRef.current || downloading) return
    setDownloading(true)
    try {
      const dataUrl = await toPng(cardRef.current, {
        width: 1080,
        height: fit.h,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#0A1628",
        style: { transform: "none", transformOrigin: "top left", margin: "0" },
      })
      const link = document.createElement("a")
      link.download = "cbiq-mobility-maturity-score.png"
      link.href = dataUrl
      link.click()
    } catch (e) {
      console.log("[v0] share card export failed:", e)
    } finally {
      setDownloading(false)
    }
  }

  const linkedInUrl =
    "https://www.linkedin.com/sharing/share-offsite/?url=" +
    encodeURIComponent("https://www.cbiq.ai/mobility-maturity-scorecard")

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-background/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Shareable result card"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 w-10 h-10 grid place-items-center rounded-full bg-brand-navy-2 border border-border text-slate-300 hover:text-white transition-colors"
      >
        <X size={18} />
      </button>

      {/* Column: scaled card preview + action buttons. */}
      <div className="flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
      {/* Scaling wrapper keeps the fixed-width card centered and fully visible. */}
      <div style={{ width: 1080 * fit.scale, height: fit.h * fit.scale }}>
        <div
          ref={cardRef}
          className="relative bg-brand-navy text-white flex flex-col items-center text-center overflow-hidden"
          style={{ width: 1080, minHeight: 1080, transform: `scale(${fit.scale})`, transformOrigin: "top left", padding: 84 }}
        >
          {/* Homepage background treatment: network texture, navy overlay, teal glows, bottom fade. */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <img src="/images/hero-network.jpg" alt="" aria-hidden="true" className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-brand-navy/80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--brand-teal-deep-rgb)_/_0.4),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgb(var(--brand-teal-deep-rgb)_/_0.15),transparent)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_55%,var(--brand-navy)_100%)]" />
          </div>

          {/* content sits above the background layers — centered stack with even spacing */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center w-full h-full" style={{ flex: 1, gap: 52 }}>
            {/* CBIQ logo */}
            <img src="/cbiq-lockup-transparent.png" alt="CBIQ" style={{ height: 92 }} className="object-contain" />

            {/* label */}
            <div className="font-mono uppercase text-brand-teal" style={{ fontSize: 26, letterSpacing: 6 }}>
              Mobility Maturity Index
            </div>

            {/* score gauge */}
            <CircularGauge value={score} max={100} size={380} stroke={28} label={String(score)} sublabel="/100" />

            {/* archetype pill */}
            <span
              className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 font-medium text-primary"
              style={{ fontSize: 34, paddingLeft: 32, paddingRight: 32, paddingTop: 12, paddingBottom: 12 }}
            >
              {archetype}
            </span>

            {/* peer line */}
            <p className="text-slate-200 leading-snug text-balance" style={{ fontSize: 36, maxWidth: 820 }}>
              {peerLine}
            </p>

            {/* CTA */}
            <div
              className="rounded-2xl border border-primary/30 bg-primary/5 text-slate-300 leading-snug"
              style={{ fontSize: 30, padding: "28px 40px", maxWidth: 900 }}
            >
              Take the free 3-minute benchmark at{" "}
              <span className="font-bold text-brand-teal">cbiq.ai/mobility-maturity-scorecard</span>
            </div>

            {/* Powered by + GME globe mark */}
            <div className="flex items-center justify-center" style={{ gap: 20 }}>
              <span className="font-mono uppercase text-slate-400" style={{ fontSize: 22, letterSpacing: 3 }}>
                Powered by
              </span>
              <img src="/gme-white.png" alt="Global Mobility Executive" style={{ height: 80 }} className="object-contain opacity-90" />
            </div>
          </div>
        </div>
      </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg font-bold text-[15px] bg-brand-teal text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {downloading ? "Preparing…" : "Download image"}
          </button>
          <a
            href={linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg font-bold text-[15px] border border-border bg-brand-navy-2 text-foreground hover:border-brand-teal transition-colors"
          >
            Share on LinkedIn
          </a>
        </div>
      </div>
    </div>
  )
}

// Map a binary/half leg value to a human standing word + brand-appropriate styling.
// 100 = Strong (positive/teal), 50 = Partly there (neutral), 0 = Developing (muted).
function standing(v) {
  if (v >= 100) return { label: "Strong", cls: "border-primary/30 bg-primary/10 text-primary" }
  if (v >= 50) return { label: "Partly there", cls: "border-slate-500/30 bg-slate-500/10 text-slate-200" }
  return { label: "Developing", cls: "border-slate-600/30 bg-slate-600/10 text-slate-400" }
}

function LockedBreakdown({ legs, peers, unlocked }) {
  const rows = [
    ["strategy", "Defined strategy"], ["alignment", "Strategic alignment"],
    ["future", "Future-readiness"], ["techai", "Technology & AI"],
  ]
  return (
    <div className="relative border border-primary/20 bg-brand-navy-2 rounded-xl overflow-hidden mb-4">
      <div className={`px-5 py-5 ${unlocked ? "" : "blur-[5px] pointer-events-none select-none"}`}>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3.5">Your full breakdown</p>
        <div className="space-y-2.5">
          {rows.map(([k, l]) => {
            const peerPct = Math.round(peers[k])
            const s = standing(legs[k])
            return (
              <div key={k}>
                <div className="flex justify-between items-center gap-3 text-xs mb-1">
                  <span className="text-slate-400">
                    {l} <span className="text-slate-600">—</span>{" "}
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${s.cls}`}>{s.label}</span>
                  </span>
                  <span className="text-slate-500 font-normal tnum whitespace-nowrap">{peerPct}% of peers strong</span>
                </div>
                <div className="h-1.5 bg-[#1a3344] rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(Math.max(peerPct, 0), 100)}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {!unlocked && (
        <div className="absolute inset-0 grid place-items-center bg-background/70">
          <div className="text-center p-4">
            <div className="w-10 h-10 rounded-full bg-brand-navy border border-border grid place-items-center mx-auto mb-2.5">
              <Lock size={18} className="text-white" />
            </div>
            <div className="text-sm font-bold">See your leg-by-leg breakdown</div>
            <div className="text-[13px] text-muted-foreground max-w-[340px] mx-auto mt-1">
              Where you lead, where you lag, and what the top quartile does differently.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TrialCTA({ onUnlock }) {
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("") // honeypot — must stay empty for real users
  const [sent, setSent] = useState(false)
  const ok = /\S+@\S+\.\S+/.test(email)
  const submit = () => {
    if (!ok) return
    setSent(true)
    onUnlock({ email, companyWebsite: company })
  }
  if (sent) {
    return (
      <div className="bg-brand-teal/10 border-2 border-brand-teal rounded-2xl px-5 py-6 shadow-[0_0_40px_-12px_rgb(var(--brand-teal-rgb)_/_0.5)]">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-teal/20 border border-brand-teal/40 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-teal">
          This is just the start
        </div>
        <div className="text-[20px] font-bold text-white tracking-tight mt-3">See the full picture</div>
        <div className="text-[13.5px] text-[#cdd8de] mt-2 leading-relaxed">
          You&apos;ve just seen four areas. The full benchmark covers all eight pillars, shows exactly
          how you compare to your peers in depth, and unlocks <span className="font-semibold text-white">14 days of Premium access</span>.
          It takes a few minutes — and it&apos;s <span className="font-semibold text-white">completely free</span>.
        </div>
        <ul className="mt-3.5 space-y-1.5">
          {[
            "Your full eight-pillar maturity profile",
            "In-depth peer comparison and year-on-year trends",
            "14-day Premium trial — free, no card required",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-[13px] text-[#cdd8de]">
              <Check size={15} className="mt-0.5 shrink-0 text-brand-teal" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <a
          href="https://www.cbiq.ai/survey"
          className="mt-5 w-full h-[50px] px-5 rounded-lg font-bold text-[15px] inline-flex items-center justify-center gap-1.5 bg-brand-teal text-white transition-shadow hover:shadow-[0_0_28px_-4px_rgb(var(--brand-teal-rgb)_/_0.7)]"
        >
          See your full benchmark + 14-day trial <ArrowRight size={16} />
        </a>
      </div>
    )
  }
  return (
    <div className="bg-brand-navy border border-border rounded-2xl px-5 py-5.5">
      <div className="text-[17px] font-bold text-white tracking-tight">Unlock your full report</div>
      <div className="text-[13px] text-[#b8c4cb] mt-1.5 leading-relaxed">
        Your complete breakdown, your peer cohort in depth, year-on-year trends, and a 14-day Premium trial. Free when you complete the benchmark.
      </div>
      <div className="flex gap-2 mt-4 flex-wrap">
        <input
          value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" type="email"
          className="flex-1 min-w-[180px] h-[46px] rounded-lg border border-white/15 bg-background/40 px-3.5 text-[15px] text-foreground placeholder:text-muted-foreground outline-none focus:border-brand-teal"
        />
        {/* Honeypot: invisible to humans; bots that fill it are silently dropped server-side. */}
        <input
          type="text"
          name="company_website"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
        />
        <button
          onClick={submit} disabled={!ok}
          className={`h-[46px] px-5 rounded-lg font-bold text-[15px] inline-flex items-center gap-1.5 transition-colors ${
            ok ? "bg-brand-teal text-white cursor-pointer" : "bg-white/10 text-muted-foreground cursor-not-allowed"
          }`}
        >
          Unlock <ArrowRight size={16} />
        </button>
      </div>
      <div className="text-[11.5px] text-[#8a9aa2] mt-2.5">Anonymized and aggregated. Contact details never shared with vendors.</div>
    </div>
  )
}

// ----------------------------- shared bits --------------------------
// `setup` = peer-group screen: no step number, empty bar.
// Otherwise `step` is 1..QUESTION_COUNT for the five question screens.
function Progress({ step, setup }) {
  const total = QUESTION_COUNT
  const pct = setup ? 0 : Math.round((step / total) * 100)
  return (
    <div>
      <div className="flex justify-between text-[11px] text-muted-foreground font-mono mb-1.5">
        <span>{setup ? "SETUP" : `QUESTION ${step} OF ${total}`}</span><span>{pct}%</span>
      </div>
      <div className="h-1 rounded-full bg-border">
        <div className="h-full rounded-full bg-brand-teal transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <div className="text-[12.5px] font-semibold text-muted-foreground mb-1.5">{label}</div>
      {children}
    </div>
  )
}

function Select({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value} onChange={onChange}
        className={`w-full h-12 rounded-xl border bg-input px-3 pr-10 text-[15px] cursor-pointer appearance-none outline-none transition-colors ${
          value ? "border-brand-teal text-foreground" : "border-border text-muted-foreground"
        } focus:border-brand-teal`}
      >
        <option value="" disabled>Select…</option>
        {options.map((o) => <option key={o} value={o} className="text-foreground bg-popover">{o}</option>)}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}

const legName = (k) => ({ strategy: "Defined strategy", alignment: "Strategic alignment", future: "Future-readiness", techai: "Technology & AI" }[k])
const easeOut = (p) => 1 - Math.pow(1 - p, 3)
