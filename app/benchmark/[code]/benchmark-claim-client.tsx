"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PopupButton } from "@typeform/embed-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mail, ArrowLeft, AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export function BenchmarkClaimClient({
  formId,
  code,
}: {
  formId: string
  code: string
}) {
  const supabase = createClient()

  // "intro" -> Typeform popup; "claim" -> email capture; flips to sent on success
  const [step, setStep] = useState<"intro" | "claim">("intro")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendMsg, setResendMsg] = useState<string | null>(null)

  // Tick down the resend cooldown once per second while it is active.
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  // Shared magic-link send used by both the initial claim and the resend button.
  const sendMagicLink = (targetEmail: string) =>
    supabase.auth.signInWithOtp({
      email: targetEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/claim/activate`,
      },
    })

  const handleResend = async () => {
    if (resendLoading || resendCooldown > 0) return
    setResendLoading(true)
    setResendMsg(null)

    try {
      const { error: otpError } = await sendMagicLink(email.trim())
      if (otpError) {
        setResendMsg("We couldn't resend the link. Please try again.")
      } else {
        setResendMsg("Link resent")
        setResendCooldown(45)
      }
    } catch {
      setResendMsg("We couldn't resend the link. Please try again.")
    }

    setResendLoading(false)
  }

  const handleClaim = async () => {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError("Please enter your email address.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: rpcError } = await supabase.rpc("create_referral_grant", {
        p_email: trimmedEmail,
        p_ref: code,
      })

      if (rpcError) {
        setError("Something went wrong unlocking your trial. Please try again.")
        setLoading(false)
        return
      }

      const result = Array.isArray(data) ? data[0] : data
      const ok = result?.ok === true

      if (!ok) {
        setError("We couldn't unlock your trial. Please try again or contact support.")
        setLoading(false)
        return
      }

      const { error: otpError } = await sendMagicLink(trimmedEmail)

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
                  See how your Global Mobility program compares.
                </h1>
                <p className="text-sm text-slate-400 text-pretty">
                  Complete a short benchmark and unlock 14 days of CBIQ Premium, free.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-slate-100 mb-2 text-balance">
                  Thanks for completing the benchmark.
                </h1>
                <p className="text-sm text-slate-400 text-pretty">
                  Enter your email to unlock your 14 days of Premium.
                </p>
              </>
            )}
          </div>

          {step === "intro" ? (
            <PopupButton
              id={formId}
              size={100}
              onSubmit={() => setStep("claim")}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Start the benchmark
            </PopupButton>
          ) : sent ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3 text-left">
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm font-semibold text-slate-100 mb-1">Almost there, check your inbox</h2>
                  <p className="text-sm text-slate-400 text-pretty">
                    We&apos;ve emailed a secure link to{" "}
                    <span className="font-medium text-slate-200">{email.trim()}</span> to unlock your 14 days of
                    Premium. Open it and you&apos;re in, it takes about 10 seconds. The email is from CBIQ
                    (crossborderiq@gemevents.co); if it&apos;s not there in a minute, check spam.
                  </p>
                </div>
              </div>

              {resendMsg && <p className="text-xs text-slate-400 text-center">{resendMsg}</p>}

              <Button
                type="button"
                variant="outline"
                onClick={handleResend}
                disabled={resendLoading || resendCooldown > 0}
                className="w-full border-primary/20 bg-transparent text-slate-200 hover:bg-primary/10 hover:text-slate-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {resendCooldown > 0
                  ? `Resend available in ${resendCooldown}s`
                  : resendLoading
                    ? "Resending..."
                    : "Resend the link"}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setSent(false)
                  setResendMsg(null)
                }}
                className="w-full text-sm text-slate-400 hover:text-slate-100 transition-colors"
              >
                Change email
              </button>
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
                  Email address
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
                {loading ? "Unlocking..." : "Unlock my 14 days of Premium"}
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
