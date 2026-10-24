"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const INDUSTRY_OPTIONS = [
  "Construction & Engineering",
  "Education",
  "Energy & Utilities",
  "Financial Services",
  "Healthcare & Life Sciences",
  "Hospitality, Travel & Leisure",
  "Manufacturing",
  "Media, Marketing & Advertising",
  "Non-Profit / NGO",
  "Pharmaceuticals & Biotechnology",
  "Professional Services",
  "Public Sector / Government",
  "Retail & Consumer Goods",
  "Technology / Software",
  "Telecommunications",
  "Transportation & Logistics",
]

const HQ_OPTIONS = [
  "North America",
  "Latin America",
  "UK & Ireland",
  "Continental Europe",
  "Middle East",
  "Africa",
  "Asia-Pacific (APAC)",
]

const SIZE_OPTIONS = [
  "Fewer than 250",
  "250 – 999",
  "1,000 – 4,999",
  "5,000 – 9,999",
  "10,000 – 24,999",
  "25,000 – 49,999",
  "50,000+",
]

const E10_OPTIONS = [
  "Using AI in production",
  "Piloting AI use cases",
  "Planning to implement AI",
  "Not currently using AI in mobility operations",
]

const E16_OPTIONS = [
  "Yes — a dedicated Global Mobility / assignment management platform",
  "Partially — some tasks are supported by technology",
  "No — we manage the program with spreadsheets and general office tools",
  "We are currently evaluating or implementing a solution",
]

const SCALE_VALUES = ["0", "1", "2", "3", "4", "5", "6", "7"]

type AnswerKey = "industry" | "hq" | "size" | "q19" | "q20" | "q22" | "e10" | "e16"

type Step =
  | { key: AnswerKey; kind: "options"; prompt: string; options: string[] }
  | { key: AnswerKey; kind: "scale"; prompt: string }

const STEPS: Step[] = [
  { key: "industry", kind: "options", prompt: "Which industry is your organization in?", options: INDUSTRY_OPTIONS },
  { key: "hq", kind: "options", prompt: "Where is your organization headquartered?", options: HQ_OPTIONS },
  { key: "size", kind: "options", prompt: "How many employees does your organization have?", options: SIZE_OPTIONS },
  { key: "q19", kind: "scale", prompt: "We have a defined Global Mobility strategy" },
  {
    key: "q20",
    kind: "scale",
    prompt: "Our Global Mobility strategy is well aligned to the broader organizational strategy",
  },
  { key: "q22", kind: "scale", prompt: "The scope & complexity of Global mobility will grow in the next 12 months" },
  {
    key: "e10",
    kind: "options",
    prompt: "What best describes your use of AI in Global Mobility today?",
    options: E10_OPTIONS,
  },
  {
    key: "e16",
    kind: "options",
    prompt: "Are you currently using technology to manage your Global Mobility program?",
    options: E16_OPTIONS,
  },
]

type SubmitResult = { ok?: boolean; error?: string; response_ref?: string; written?: number; skipped?: number }

export function BenchmarkStepper({
  onCancel,
  onSubmitted,
  onVendorBlocked,
}: {
  onCancel: () => void
  onSubmitted: () => Promise<void>
  onVendorBlocked: () => void
}) {
  const supabase = useMemo(() => createClient(), [])
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Partial<Record<AnswerKey, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [failed, setFailed] = useState(false)

  const step = STEPS[stepIndex]
  const total = STEPS.length
  const isLast = stepIndex === total - 1
  const complete = STEPS.every((s) => answers[s.key] != null)

  async function submit(final: Partial<Record<AnswerKey, string>>) {
    setSubmitting(true)
    setFailed(false)
    try {
      const { data, error } = await supabase.rpc("submit_benchmark_answers", {
        p_q19: final.q19,
        p_q20: final.q20,
        p_q22: final.q22,
        p_e10: final.e10,
        p_e16: final.e16,
        p_industry: final.industry,
        p_hq: final.hq,
        p_size: final.size,
      })
      const result = (data ?? {}) as SubmitResult
      const message = `${error?.message ?? ""} ${result.error ?? ""}`
      if (message.includes("vendor_accounts_cannot_contribute")) {
        onVendorBlocked()
        return
      }
      if (error || !result.ok) {
        setFailed(true)
        return
      }
      await onSubmitted()
    } catch {
      setFailed(true)
    } finally {
      setSubmitting(false)
    }
  }

  function choose(value: string) {
    const next = { ...answers, [step.key]: value }
    setAnswers(next)
    setFailed(false)
    if (isLast) {
      if (STEPS.every((s) => next[s.key] != null)) void submit(next)
    } else {
      setStepIndex(stepIndex + 1)
    }
  }

  const selected = answers[step.key]

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-4 mb-3">
        <button
          type="button"
          onClick={() => (stepIndex === 0 ? onCancel() : setStepIndex(stepIndex - 1))}
          disabled={submitting}
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {stepIndex === 0 ? "Cancel" : "Back"}
        </button>
        <span className="text-xs text-slate-400 tabular-nums">{`Question ${stepIndex + 1} of ${total}`}</span>
      </div>
      <div
        className="h-1.5 w-full rounded-full bg-slate-700/60 overflow-hidden mb-6"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={stepIndex + 1}
        aria-label="Benchmark progress"
      >
        <div
          className="h-full bg-primary transition-[width] duration-300"
          style={{ width: `${((stepIndex + 1) / total) * 100}%` }}
        />
      </div>

      <fieldset disabled={submitting}>
        <legend className="text-lg font-semibold text-slate-100 text-pretty mb-5">{step.prompt}</legend>

        {step.kind === "options" ? (
          <div className="flex flex-col gap-2">
            {step.options.map((option) => {
              const active = selected === option
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => choose(option)}
                  aria-pressed={active}
                  className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition-colors ${
                    active
                      ? "border-primary bg-primary/15 text-slate-100"
                      : "border-slate-700/60 bg-brand-navy/40 text-slate-200 hover:border-primary/50"
                  }`}
                >
                  {option}
                </button>
              )
            })}
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-8 gap-1.5 sm:gap-2" role="group" aria-label="Score from 0 (disagree) to 7 (agree)">
              {SCALE_VALUES.map((value) => {
                const active = selected === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => choose(value)}
                    aria-pressed={active}
                    className={`h-11 rounded-lg border text-sm font-semibold tabular-nums transition-colors ${
                      active
                        ? "border-primary bg-primary text-brand-navy"
                        : "border-slate-700/60 bg-brand-navy/40 text-slate-200 hover:border-primary/50"
                    }`}
                  >
                    {value}
                  </button>
                )
              })}
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>Disagree</span>
              <span>Agree</span>
            </div>
          </div>
        )}
      </fieldset>

      {submitting && (
        <p className="flex items-center gap-2 text-sm text-slate-400 mt-5" role="status">
          <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
          Calculating your score…
        </p>
      )}
      {failed && !submitting && (
        <div className="mt-5 flex flex-wrap items-center gap-3" role="alert">
          <p className="text-sm text-slate-300">
            {"We couldn't save your answers. Your selections are kept, so you can try again."}
          </p>
          <button
            type="button"
            onClick={() => complete && void submit(answers)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-brand-navy hover:bg-primary/90"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
