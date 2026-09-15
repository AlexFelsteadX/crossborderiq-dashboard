"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { AlertCircle } from "lucide-react"

export default function ClaimActivatePage() {
  const router = useRouter()
  // Guard against the effect running twice (React strict mode / re-renders)
  const startedRef = useRef(false)
  // "working" shows the spinner; "error" shows the manual-retry message.
  const [status, setStatus] = useState<"working" | "error">("working")

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    const supabase = createClient()

    // The trial can already be claimed by the time this page runs: activate_trial
    // also fires server-side during OTP/magic-link verification (auth/confirm and
    // auth/callback). In that case the RPC here returns ok=false
    // ("no_eligible_grant"), which is not a real failure. Before showing the error
    // state, confirm whether the user already has active access.
    const hasActiveAccess = async () => {
      try {
        const { data: trial } = await supabase.rpc("get_trial_status")
        const trialResult = Array.isArray(trial) ? trial[0] : trial
        if (trialResult?.on_trial === true) return true

        const { data: tier } = await supabase.rpc("current_tier")
        const tierResult = Array.isArray(tier) ? tier[0] : tier
        const tierValue = typeof tierResult === "string" ? tierResult : tierResult?.tier
        return tierValue === "premium" || tierValue === "vendor"
      } catch {
        return false
      }
    }

    const activate = async () => {
      try {
        const { data, error } = await supabase.rpc("activate_trial")

        // The RPC returns { ok, message, ends_at }
        const result = Array.isArray(data) ? data[0] : data

        if (!error && result?.ok === true) {
          router.replace("/premium-dashboard?welcome=trial")
          return
        }
      } catch {
        // fall through to the access check below
      }

      // Activation returned ok=false or threw. This is expected when the grant
      // was already claimed during sign-in verification, so treat existing active
      // access as success rather than showing a false failure.
      if (await hasActiveAccess()) {
        router.replace("/premium-dashboard?welcome=trial")
        return
      }

      // Activation genuinely failed and the user has no active access. Surface a
      // retry path instead of dropping them into a dashboard they cannot use.
      setStatus("error")
    }

    activate()
  }, [router])

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center px-6 relative">
      <div className="fixed inset-0 bg-brand-navy -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--brand-teal-deep-rgb)_/_0.4),transparent)] -z-10" />

      <img src="/cbiq-logo-lockup.svg" alt="CBIQ" className="h-8 w-auto mb-8" />

      {status === "working" ? (
        <div className="flex items-center gap-3 text-slate-300">
          <span className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm">Setting up your access...</p>
        </div>
      ) : (
        <div className="w-full max-w-md p-6 rounded-2xl border border-destructive/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-3">
              <p className="text-sm text-slate-200">
                We could not activate your access automatically. Sign in again and it will retry, or contact us.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Sign in again
                </Link>
                <a href="mailto:crossborderiq@gemevents.co" className="text-slate-400 hover:text-slate-200 underline">
                  Contact us
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
