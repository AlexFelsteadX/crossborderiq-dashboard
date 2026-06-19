"use client"

import { useState, useEffect } from "react"
import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, ChevronDown, Lock, ArrowRight, Check, Share2 } from "lucide-react"

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

// --------------------------- MOCK benchmark -------------------------
// Per-industry cohort mean MMI (replace with get_premium_mmi(industry)).
const COHORT_MEAN = {
  "Technology & IT": 56, "Financial Services": 54, "Professional Services": 50,
  "Healthcare & Life Sciences": 49, "Energy & Utilities": 46, "Manufacturing & Industrial": 44,
  "Media & Entertainment": 45, "Retail & Consumer": 43, Other: 47,
}
const COHORT_SD = 16            // spread used for the percentile estimate
const OVERALL_MEAN = 48         // matches the live homepage MMI headline
// Per-leg cohort averages (replace with get_premium_breakdown_core legs).
const LEG_PEER = { strategy: 51, alignment: 48, future: 44, techai: 50 }

const INDUSTRIES = Object.keys(COHORT_MEAN)
const REGIONS = ["Americas", "Europe", "Middle East", "Africa", "Asia-Pacific (APAC & Australia)"]
const SIZES = ["Fewer than 250", "250 – 999", "1,000 – 4,999", "5,000 – 9,999",
  "10,000 – 24,999", "25,000 – 49,999", "50,000+"]

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

// ----------------------------- scoring ------------------------------
const scaleToScore = (v) => Math.round(((v - 1) / 6) * 100) // 1..7 -> 0..100

function computeResult(answers, industry) {
  const strategy = scaleToScore(answers.Q19)
  const alignment = scaleToScore(answers.Q20)
  const future = scaleToScore(answers.Q22)
  const techai = Math.round((answers.E10 + answers.E16) / 2)
  const legs = { strategy, alignment, future, techai }
  const score = Math.round((strategy + alignment + future + techai) / 4)
  const mean = COHORT_MEAN[industry] ?? OVERALL_MEAN
  // normal-CDF percentile estimate vs the cohort
  const z = (score - mean) / COHORT_SD
  const pct = Math.max(1, Math.min(99, Math.round(cdf(z) * 100)))
  return { score, legs, mean, pct }
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
  const [segment, setSegment] = useState({ industry: "", region: "", size: "" })
  const [answers, setAnswers] = useState({})

  const reset = () => { setStep(-1); setSegment({ industry: "", region: "", size: "" }); setAnswers({}) }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <style>{`
        @media (prefers-reduced-motion: reduce){ *{ transition:none !important; animation:none !important; } }
        .tnum{ font-variant-numeric: tabular-nums; }
        .lift{ transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease; }
        .lift:hover{ transform: translateY(-1px); }
      `}</style>

      <GlobalNav />

      <main className="flex-1 w-full">
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

      <GlobalFooter />
    </div>
  )
}

// ----------------------------- intro --------------------------------
function Intro({ onStart }) {
  return (
    <div>
      <div className="font-mono text-xs uppercase tracking-[0.15em] text-brand-teal mb-4">
        Free benchmark · ~3 minutes
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05] text-balance mb-4">
        Mobility Maturity<br />Scorecard
      </h1>
      <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-[540px] mb-7">
        Answer eight quick questions and get your Mobility Maturity Index score, then see how
        you compare to mobility leaders in your industry, region, and company size.
      </p>
      <div className="flex flex-wrap gap-x-8 gap-y-4 mb-8">
        {[["8", "questions"], ["1", "personal score"], ["427+", "leaders benchmarked"]].map(([n, l]) => (
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
        Your answers are anonymized and aggregated into the benchmark. Contact details are never shared with vendors.
      </p>
    </div>
  )
}

// ----------------------------- segment ------------------------------
function Segment({ segment, setSegment, onNext }) {
  const ready = segment.industry && segment.region && segment.size
  const set = (k) => (e) => setSegment({ ...segment, [k]: e.target.value })
  return (
    <div>
      <Progress index={0} />
      <h2 className="text-2xl font-bold tracking-tight mt-5 mb-1.5">First, your peer group</h2>
      <p className="text-sm text-muted-foreground mb-6">
        We'll compare your score to leaders who match your profile.
      </p>
      <Field label="Industry"><Select value={segment.industry} onChange={set("industry")} options={INDUSTRIES} /></Field>
      <Field label="Headquarters region"><Select value={segment.region} onChange={set("region")} options={REGIONS} /></Field>
      <Field label="Employees globally"><Select value={segment.size} onChange={set("size")} options={SIZES} /></Field>
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
      <Progress index={step} />
      <div className="font-mono text-xs text-muted-foreground mt-5 mb-2.5">
        {q.id} · {legName(q.leg)}
      </div>
      <h2 className="text-xl sm:text-2xl font-bold leading-snug tracking-tight mb-6 max-w-[600px]">{q.label}</h2>

      {isScale ? (
        <ScaleInput value={current} onPick={pick} />
      ) : (
        <div className="grid gap-2.5">
          {q.options.map((o) => (
            <OptionRow key={o.t} active={current === o.v} onClick={() => pick(o.v)}>{o.t}</OptionRow>
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
  const r = computeResult(answers, segment.industry)
  const a = archetype(r.score)
  const [prog, setProg] = useState(0)
  const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches

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

  return (
    <div>
      <div className="font-mono text-xs uppercase tracking-[0.12em] text-brand-teal mb-1">
        Your result
      </div>

      {/* gauge + headline */}
      <div className="bg-brand-navy rounded-[18px] px-6 pt-7 pb-6 mb-4 border border-border">
        <Gauge score={r.score} peer={r.mean} prog={prog} />
        <div className="text-center mt-1">
          <div className="tnum font-mono text-[56px] font-extrabold leading-none tracking-tighter text-white">{shown}</div>
          <div className="text-xs text-[#9fb0ba] mt-0.5 font-mono">MOBILITY MATURITY INDEX · 0–100</div>
          <div className="text-[22px] font-bold mt-3.5 tracking-tight text-brand-teal">{a.name}</div>
          <p className="text-sm leading-relaxed text-[#c7d2d8] max-w-[460px] mx-auto mt-2">{a.line}</p>
        </div>
      </div>

      {/* the ONE free peer line */}
      <div className="bg-card border border-border rounded-2xl px-5 py-4.5 mb-4 flex gap-3.5 items-center">
        <div className="tnum font-mono text-3xl font-extrabold text-brand-teal min-w-16">{r.pct}%</div>
        <div className="text-sm leading-snug text-foreground">
          You scored higher than <strong>{r.pct}% of {segment.industry || "your"} leaders</strong> in the CBIQ benchmark.
          Your cohort averages <span className="tnum font-mono font-bold">{r.mean}</span>.
        </div>
      </div>

      {/* gated depth */}
      <LockedBreakdown legs={r.legs} />

      {/* CTA */}
      <TrialCTA />

      <div className="flex gap-3.5 justify-center mt-5">
        <button onClick={onRestart} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Retake</button>
        <span className="text-border">·</span>
        <button className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Share2 size={14} /> Share your score
        </button>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-4.5">
        Prototype with sample benchmark data. Live scores draw on the GWD survey.
      </p>
    </div>
  )
}

// SVG semicircle dial: fill = your score, tick = peer average, needle = you.
function Gauge({ score, peer, prog }) {
  const w = 320, h = 176, cx = 160, cy = 158, r = 132
  const ang = (v) => Math.PI * (1 - v / 100)           // value -> radians
  const pt = (v, rad) => [cx + rad * Math.cos(ang(v)), cy - rad * Math.sin(ang(v))]
  const arc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`
  const offset = 100 - score * prog                    // pathLength=100
  const [px, py] = pt(peer, r)
  const [px2, py2] = pt(peer, r + 13)
  const [nx, ny] = pt(score * prog, r * 0.74)          // needle tip

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" className="block max-w-[360px] mx-auto">
      <path d={arc} fill="none" stroke="#23344a" strokeWidth={14} strokeLinecap="round" />
      <path d={arc} fill="none" stroke="var(--brand-teal)" strokeWidth={14} strokeLinecap="round"
        pathLength={100} strokeDasharray="100" strokeDashoffset={offset} />
      {/* peer tick */}
      <line x1={px} y1={py} x2={px2} y2={py2} stroke="#fff" strokeWidth={2.5} />
      <text x={px2} y={py2 - 6} fill="#9fb0ba" fontSize={10} className="font-mono" textAnchor="middle">peers {peer}</text>
      {/* needle */}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#fff" strokeWidth={3} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={6} fill="#fff" />
      {/* end labels */}
      <text x={cx - r} y={cy + 18} fill="#5d6f7d" fontSize={10} className="font-mono" textAnchor="middle">0</text>
      <text x={cx + r} y={cy + 18} fill="#5d6f7d" fontSize={10} className="font-mono" textAnchor="middle">100</text>
    </svg>
  )
}

function LockedBreakdown({ legs }) {
  const rows = [
    ["strategy", "Defined strategy"], ["alignment", "Strategic alignment"],
    ["future", "Future-readiness"], ["techai", "Technology & AI"],
  ]
  return (
    <div className="relative border border-border rounded-2xl overflow-hidden mb-4">
      <div className="px-5 py-4.5 blur-[5px] pointer-events-none select-none bg-card">
        <div className="text-sm font-bold mb-3.5">Your full breakdown</div>
        {rows.map(([k, l]) => (
          <div key={k} className="mb-3">
            <div className="flex justify-between text-[13px] mb-1.5">
              <span>{l}</span>
              <span className="tnum font-mono">{legs[k]} <span className="text-muted-foreground">vs {LEG_PEER[k]}</span></span>
            </div>
            <Bar you={legs[k]} peer={LEG_PEER[k]} />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 grid place-items-center bg-background/60">
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
    </div>
  )
}

function Bar({ you, peer }) {
  return (
    <div className="relative h-2.5 rounded-full bg-border">
      <div className="absolute inset-0 rounded-full bg-brand-teal" style={{ width: `${you}%` }} />
      <div className="absolute -top-1 w-0.5 h-[15px] bg-foreground" style={{ left: `${peer}%` }} />
    </div>
  )
}

function TrialCTA() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const ok = /\S+@\S+\.\S+/.test(email)
  if (sent) {
    return (
      <div className="bg-brand-teal/10 border border-brand-teal rounded-2xl px-5 py-5 text-center">
        <div className="font-bold text-sm text-foreground">Check your inbox</div>
        <div className="text-[13px] text-muted-foreground mt-1">Your full report and 14-day Premium trial link are on the way.</div>
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
        <button
          onClick={() => ok && setSent(true)} disabled={!ok}
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
function Progress({ index }) {
  const pct = Math.round((index / TOTAL_STEPS) * 100)
  return (
    <div>
      <div className="flex justify-between text-[11px] text-muted-foreground font-mono mb-1.5">
        <span>STEP {index + 1} / {TOTAL_STEPS}</span><span>{pct}%</span>
      </div>
      <div className="h-1 rounded-full bg-border">
        <div className="h-full rounded-full bg-brand-teal transition-[width] duration-300" style={{ width: `${Math.max(8, pct)}%` }} />
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
