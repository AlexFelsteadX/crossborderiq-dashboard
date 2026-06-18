"use client"

import { useState } from "react"
import Link from "next/link"
import { PopupButton } from "@typeform/embed-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react"

// Organic Global Workforce Deployment survey (no rep code).
const SURVEY_FORM_ID = "GtsLFriE"

export default function SurveyPage() {
  const supabase = createClient()

  // "intro" -> Typeform popup; "claim" -> email capture; flips to sent on success
  const [step, setStep] = useState<"intro" | "claim">("intro")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const handleClaim = async () => {
    const trimmedEmail = email.trim()
    if (!isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: rpcError } = await supabase.rpc("create_survey_grant", {
        p_email: trimmedEmail,
      })

      if (rpcError) {
        setError("Something went wrong unlocking your access. Please try again.")
        setLoading(false)
        return
      }

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/claim/activate`,
        },
      })

      if (otpError) {
        setError("We couldn't send your secure link. Please try again.")
        setLoading(false)
        return
      }

      setSent(true)
    } catch {
      setError("Something went wrong. Please try again.")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col relative">
      {/* Premium dark gradient mesh background — matches the rest of CBIQ */}
      <div className="fixed inset-0 bg-brand-navy -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--brand-teal-deep-rgb)_/_0.4),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgb(var(--brand-teal-deep-rgb)_/_0.15),transparent)] -z-10" />

      <header className="px-6 py-4 max-w-[1600px] mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md p-8 rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.25)]">
          <div className="text-center mb-8">
            <Link href="/">
              <img src="/cbiq-logo-lockup.svg" alt="CBIQ" className="h-8 w-auto mx-auto mb-6" />
            </Link>

            {step === "intro" ? (
              <>
                <h1 className="text-2xl font-bold text-slate-100 mb-2 text-balance">
                  Benchmark your Global Workforce Deployment strategy.
                </h1>
                <p className="text-sm text-slate-400 text-pretty">
                  Complete the survey and unlock 14 days of CBIQ Premium, free.
                </p>
              </>
            ) : sent ? (
              <>
                <h1 className="text-2xl font-bold text-slate-100 mb-2 text-balance">Check your inbox</h1>
                <p className="text-sm text-slate-400 text-pretty">
                  We&apos;ve sent a secure sign-in link to your email. Click it to unlock your 14 days of full Premium
                  access. The link is single use and arrives within a minute or two.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-slate-100 mb-2 text-balance">One last step</h1>
                <p className="text-sm text-slate-400 text-pretty">
                  Enter your work email and we&apos;ll send you a secure sign-in link. It unlocks 14 days of full
                  Premium access, so you can see exactly how your function compares to peers. No card, nothing to
                  cancel.
                </p>
              </>
            )}
          </div>

          {step === "intro" ? (
            <PopupButton
              id={SURVEY_FORM_ID}
              size={100}
              onSubmit={() => setStep("claim")}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Start the survey
            </PopupButton>
          ) : sent ? (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm text-green-500">
                Your secure sign-in link is on its way — check your inbox to unlock Premium.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-1.5">
                  Work email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !loading) handleClaim()
                    }}
                    placeholder="you@company.com"
                    className="pl-10 bg-brand-navy/60 border-primary/20 text-slate-100 placeholder:text-slate-500 focus-visible:ring-primary focus-visible:border-primary"
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={handleClaim}
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send my sign-in link"}
              </Button>

              <p className="text-xs text-slate-500 text-center text-pretty">
                Your responses are anonymized and aggregated, and never shared with vendors.
              </p>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
