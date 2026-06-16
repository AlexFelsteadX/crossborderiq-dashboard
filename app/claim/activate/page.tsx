"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function ClaimActivatePage() {
  const router = useRouter()
  // Guard against the effect running twice (React strict mode / re-renders)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    const supabase = createClient()

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
        // fall through to the default redirect below
      }

      // On failure, send them to the dashboard anyway — current_tier()
      // governs what they can actually access.
      router.replace("/premium-dashboard")
    }

    activate()
  }, [router])

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center px-6 relative">
      <div className="fixed inset-0 bg-brand-navy -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--brand-teal-deep-rgb)_/_0.4),transparent)] -z-10" />

      <img src="/cbiq-logo-lockup.svg" alt="CBIQ" className="h-8 w-auto mb-8" />
      <div className="flex items-center gap-3 text-slate-300">
        <span className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm">Setting up your access…</p>
      </div>
    </div>
  )
}
