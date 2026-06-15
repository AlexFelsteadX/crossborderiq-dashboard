"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { ArrowRight, ArrowLeft, Lock, CheckCircle2, Loader2, BarChart3 } from "lucide-react"
import { submitAssessment, type SubmitState } from "./actions"

const AGREE_LABELS: Record<number, string> = {
  1: "Strongly disagree",
  2: "Disagree",
  3: "Neutral",
  4: "Agree",
  5: "Strongly agree",
}

const ROLE_OPTIONS = ["Strategy", "Advisory", "Vendor management", "Operational delivery", "Other"] as const

const LT_ASSIGNMENT_OPTIONS = ["None", "1–50", "51–100", "101–500", "501–1,000", "More than 1,000"]
const ST_ASSIGNMENT_OPTIONS = [
  "None",
  "1–100",
  "101–500",
  "501–1,000",
  "1,001–5,000",
  "5,001–10,000",
  "More than 10,000",
]

const initialState: SubmitState = { ok: false }

interface Props {
  industries: string[]
  regions: string[]
  employeeCounts: string[]
  benchmark: number
  previousSmi: number | null
  previousBand: string | null
}

export function BenchmarkAssessment({
  industries,
  regions,
  employeeCounts,
  benchmark,
  previousSmi,
  previousBand,
}: Props) {
  const [state, formAction, isPending] = useActionState(submitAssessment, initialState)
  // Allow a returning user to re-take (which renews contributor access).
  const [retaking, setRetaking] = useState(false)

  // Show results if this submission succeeded, or if the user has a prior score and isn't re-taking.
  const showResult = state.ok || (previousSmi !== null && !retaking)
  const resultScore = state.ok ? state.smi! : previousSmi!
  const resultBand = state.ok ? state.band! : previousBand!

  if (showResult) {
    return (
      <Result
        score={resultScore}
        band={resultBand}
        benchmark={benchmark}
        justSubmitted={state.ok}
        onRetake={() => setRetaking(true)}
      />
    )
  }

  return (
    <div>
      <header className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 mb-4">
          <BarChart3 className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-medium text-primary uppercase tracking-wider">Free assessment</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2 text-balance">
          Mobility Maturity Index™
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
          Ten quick questions. Get your score, benchmarked against the wider market, and unlock Contributor
          access.
        </p>
      </header>

      {state.error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-8">
        {/* SEGMENTATION */}
        <Section step="Part 1" title="About your organization">
          <SelectField name="industry" label="1. Industry sector" options={industries} required />
          <SelectField name="region" label="2. HQ region" options={regions} required />
          <SelectField name="employeeCount" label="3. Global employee count" options={employeeCounts} required />
          <SelectField
            name="ltAssignments"
            label="4. Approximately how many long-term assignments and permanent transfers does your organization manage per year?"
            options={LT_ASSIGNMENT_OPTIONS}
            required
          />
          <SelectField
            name="stAssignments"
            label="5. Approximately how many short-term assignments and business travelers does your organization manage per year?"
            options={ST_ASSIGNMENT_OPTIONS}
            required
          />
        </Section>

        {/* SCORED */}
        <Section step="Part 2" title="Your Global Mobility function">
          <AgreeField
            name="definedStrategy"
            label="6. We have a defined Global Mobility strategy."
          />
          <AgreeField
            name="strategyAlignment"
            label="7. Our Global Mobility strategy is well aligned to the broader organizational strategy."
          />
          <AgreeField
            name="embeddedInEvp"
            label="8. Global Mobility is embedded into the organization's Employee Value Proposition (EVP)."
          />

          <fieldset>
            <legend className="text-sm font-medium text-slate-200 mb-3">
              9. Is your Global Mobility function set up as a Center of Excellence?
            </legend>
            <div className="flex gap-3">
              {["Yes", "No"].map((opt) => (
                <label
                  key={opt}
                  className="flex-1 cursor-pointer rounded-lg border border-primary/20 bg-brand-navy/60 px-4 py-3 text-center text-sm text-slate-200 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/15 has-[:checked]:text-primary"
                >
                  <input type="radio" name="centreOfExcellence" value={opt} required className="sr-only" />
                  {opt}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-slate-200 mb-1">
              10. What is the role of the Global Mobility function?
            </legend>
            <p className="text-xs text-slate-500 mb-3">Select all that apply.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ROLE_OPTIONS.map((role) => (
                <label
                  key={role}
                  className="flex items-center gap-2.5 cursor-pointer rounded-lg border border-primary/20 bg-brand-navy/60 px-4 py-3 text-sm text-slate-200 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/15 has-[:checked]:text-primary"
                >
                  <input
                    type="checkbox"
                    name="roles"
                    value={role}
                    className="h-4 w-4 rounded border-primary/40 accent-[var(--brand-teal)]"
                  />
                  {role}
                </label>
              ))}
            </div>
          </fieldset>
        </Section>

        <button
          type="submit"
          disabled={isPending}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 h-12 font-semibold text-primary-foreground shadow-[0_8px_24px_-6px_rgb(var(--brand-teal-rgb)_/_0.55)] transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Calculating your score…
            </>
          ) : (
            <>
              Get my Mobility Maturity Index™
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}

function Section({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 space-y-6">
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">{step}</span>
        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function SelectField({
  name,
  label,
  options,
  required,
}: {
  name: string
  label: string
  options: string[]
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-200 mb-2">
        {label}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue=""
        className="w-full rounded-lg border border-primary/30 bg-brand-navy px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

function AgreeField({ name, label }: { name: string; label: string }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-200 mb-3">{label}</legend>
      <div className="grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5].map((v) => (
          <label
            key={v}
            className="flex flex-col items-center gap-1.5 cursor-pointer rounded-lg border border-primary/20 bg-brand-navy/60 px-1 py-2.5 text-center transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/15"
          >
            <input type="radio" name={name} value={v} required className="sr-only peer" />
            <span className="text-base font-semibold text-slate-300 peer-checked:text-primary">{v}</span>
            <span className="text-[10px] leading-tight text-slate-500 peer-checked:text-primary/80">
              {AGREE_LABELS[v]}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function Result({
  score,
  band,
  benchmark,
  justSubmitted,
  onRetake,
}: {
  score: number
  band: string
  benchmark: number
  justSubmitted: boolean
  onRetake: () => void
}) {
  const delta = score - benchmark
  const comparison =
    delta > 0 ? "above average" : delta < 0 ? "below average" : "in line with the benchmark"
  const circumference = 2 * Math.PI * 52

  return (
    <div className="space-y-6">
      {justSubmitted && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Thank you — your Contributor access is now active.
        </div>
      )}

      <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-8 text-center shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.25)]">
        <p className="text-sm text-slate-400 mb-6">Your Mobility Maturity Index™</p>

        <div className="relative mx-auto h-40 w-40 mb-6">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--brand-navy)" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="var(--brand-teal)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-primary drop-shadow-[0_0_12px_rgb(var(--brand-teal-rgb)_/_0.4)]">
              {score}
            </span>
            <span className="text-xs text-slate-400">{band}</span>
          </div>
        </div>

        <p className="text-lg font-semibold text-slate-100 mb-1">
          Your score: {score} · Industry benchmark: {benchmark}
        </p>
        <p className="text-sm text-primary font-medium mb-4">{comparison}</p>
        <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
          {delta >= 0
            ? "A strong result — your Global Mobility function is ahead of the wider market. Keep building on that momentum."
            : "A solid foundation to build on. Small shifts in strategy and alignment can move your score meaningfully."}
        </p>
      </div>

      {/* Locked premium upsell */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">Compare against companies like yours</h3>
        <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto mb-6">
          Unlock peer benchmarks filtered by industry, region and company size — see exactly where you stand
          against your closest competitors.
        </p>
        <Link
          href="/workforce-intelligence#access-full-research"
          className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 h-11 font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90"
        >
          Unlock full research
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <button
        type="button"
        onClick={onRetake}
        className="inline-flex w-full items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Re-take the assessment
      </button>
    </div>
  )
}
