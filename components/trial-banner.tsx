"use client"

import { useEffect, useMemo, useState } from "react"
import { Clock, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { PremiumCheckoutButton } from "@/components/premium-checkout-button"

interface TrialStatus {
  on_trial: boolean
  trial_ends_at: string | null
  days_left: number
}

/**
 * Slim top-of-dashboard banner shown ONLY while a member is on a Premium trial
 * (get_trial_status().on_trial === true). Paying premium/vendor customers get
 * on_trial === false and therefore see nothing.
 *
 * The "Keep your access" CTA reuses the EXISTING PremiumCheckoutButton, i.e. the
 * exact same Stripe Checkout path the pricing page uses (plan: "premium"). No new
 * checkout route or price logic is introduced here.
 */
export function TrialBanner() {
  const supabase = useMemo(() => createClient(), [])
  const [status, setStatus] = useState<TrialStatus | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      const { data, error } = await supabase.rpc("get_trial_status")
      if (cancelled || error) return
      // RPC may return a single object or a one-row array.
      const row = Array.isArray(data) ? data[0] : data
      setStatus((row as TrialStatus) ?? null)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [supabase])

  // Render nothing unless the user is actively on a trial.
  if (!status?.on_trial) return null

  const daysLeft = Math.max(0, status.days_left)
  const urgent = daysLeft <= 3
  const dayWord = daysLeft === 1 ? "day" : "days"

  return (
    <div
      className={`w-full border-b ${
        urgent
          ? "bg-[#2a1518] border-[#FB7185]/40"
          : "bg-brand-navy-2 border-[#16B8A6]/30"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
            urgent ? "bg-[#FB7185]/15 text-[#FB7185]" : "bg-[#16B8A6]/15 text-[#16B8A6]"
          }`}
          aria-hidden="true"
        >
          {urgent ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-100 text-pretty">
            {urgent
              ? `Only ${daysLeft} ${dayWord} left — subscribe to keep your benchmark`
              : `${daysLeft} ${dayWord} left in your Premium trial`}
          </p>
          <p className="text-xs text-slate-400 text-pretty">
            {urgent
              ? "Your trial is ending soon. Subscribe now so you don't lose access to your peer benchmarks."
              : "Subscribe before your trial ends to keep full access to the premium benchmark."}
          </p>
        </div>

        <div className="w-44 shrink-0">
          <PremiumCheckoutButton
            className={`w-full h-9 text-sm font-semibold ${
              urgent
                ? "bg-[#FB7185] hover:bg-[#f4596f] text-[#2a1518]"
                : "bg-[#16B8A6] hover:bg-[#13a594] text-brand-navy"
            }`}
          >
            Keep your access
          </PremiumCheckoutButton>
        </div>
      </div>
    </div>
  )
}
