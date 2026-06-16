"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react"

export default function ClaimPage() {
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Confirmation state after a magic link is sent
  const [sent, setSent] = useState(false)
  const [eventName, setEventName] = useState<string | null>(null)
  // Set when the email is not on the attendee list
  const [ineligible, setIneligible] = useState(false)

  const handleClaim = async () => {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError("Please enter the email you registered with.")
      return
    }

    setLoading(true)
    setError(null)
    setIneligible(false)

    try {
      const { data, error: rpcError } = await supabase.rpc("check_trial_eligibility", {
        p_email: trimmedEmail,
      })

      if (rpcError) {
        setError("Something went wrong checking your eligibility. Please try again.")
        setLoading(false)
        return
      }

      // The RPC returns { eligible, event_name }
      const result = Array.isArray(data) ? data[0] : data
      const eligible = result?.eligible === true

      if (!eligible) {
        setIneligible(true)
        setLoading(false)
        return
      }

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/claim/activate`,
        },
      })

      if (otpError) {
        setError("We couldn't send your secure link. Please try again.")
        setLoading(false)
        return
      }

      setEventName(result?.event_name ?? null)
      setSent(true)
    } catch {
      setError("Something went wrong. Please try again.")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col relative">
      {/* Premium Dark Gradient Mesh Background - matches the rest of CBIQ */}
      <div className="fixed inset-0 bg-brand-navy -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--brand-teal-deep-rgb)_/_0.4),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgb(var(--brand-teal-deep-rgb)_/_0.15),transparent)] -z-10" />

      {/* Simple header */}
      <header className="px-6 py-4 max-w-[1600px] mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md p-8 rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.25)]">
          <div className="text-center mb-8">
            <Link href="/">
              <img src="/cbiq-logo-lockup.svg" alt="CBIQ" className="h-8 w-auto mx-auto mb-6" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-100 mb-2">Claim your CBIQ access</h1>
            <p className="text-sm text-slate-400">Enter the email you registered with for the event.</p>
          </div>

          {sent ? (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-500">
                  Check your inbox — we&apos;ve sent a secure link to start your 14 days of Premium.
                  {eventName ? ` Welcome, ${eventName} attendee.` : ""}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Don&apos;t see the email? Check your spam or junk folder.
                </p>
              </div>
            </div>
          ) : ineligible ? (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">
                We couldn&apos;t find that email on the attendee list. If you attended and think this is a
                mistake, email{" "}
                <a href="mailto:crossborderiq@gemevents.co" className="underline">
                  crossborderiq@gemevents.co
                </a>
                .
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
                {loading ? "Checking..." : "Claim access"}
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
