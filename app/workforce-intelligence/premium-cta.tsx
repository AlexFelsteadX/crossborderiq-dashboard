"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

// Reuses the EXACT Premium checkout mechanism from the pricing page
// (app/pricing/page.tsx handlePrimaryCta("premium")):
//   logged-out            → signup-then-checkout carrying intent + tier=premium
//   logged-in, lower tier → POST /api/checkout { plan: "premium" } → Stripe
//   logged-in, same tier  → no-op (already Premium)
//   logged-in, higher     → Stripe customer portal
// No price IDs or tier metadata are defined here; the server route owns them.
const TIER_ORDER = ["free", "contributor", "premium", "vendor"] as const

export function PremiumUpgradeButton() {
  const { user, tier } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startCheckout = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "premium" }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
      throw new Error(data.error || "Unable to start checkout")
    } catch (err) {
      console.error("Checkout error:", err)
      setError("Something went wrong starting checkout. Please try again.")
      setLoading(false)
    }
  }

  const openPortal = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/portal", { method: "POST" })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
      throw new Error(data.error || "Unable to open the billing portal")
    } catch (err) {
      console.error("Portal error:", err)
      setError("Something went wrong opening the billing portal. Please try again.")
      setLoading(false)
    }
  }

  const handleClick = () => {
    if (!user) {
      window.location.href = "/login?mode=signup&intent=checkout&tier=premium"
      return
    }
    const userTier = tier ?? "free"
    if (userTier === "premium") return
    const userIdx = TIER_ORDER.indexOf(userTier as (typeof TIER_ORDER)[number])
    const planIdx = TIER_ORDER.indexOf("premium")
    if (userIdx < planIdx) {
      startCheckout()
    } else {
      openPortal()
    }
  }

  return (
    <div className="mt-auto">
      <Button
        onClick={handleClick}
        disabled={loading}
        size="lg"
        className="w-full h-12 font-semibold text-primary-foreground bg-gradient-to-b from-primary to-[#0f8e80] border border-primary/60 shadow-[0_8px_28px_-8px_rgb(var(--brand-teal-rgb)_/_0.6)] transition-all hover:-translate-y-0.5 hover:from-primary hover:to-primary hover:shadow-[0_14px_36px_-8px_rgb(var(--brand-teal-rgb)_/_0.8)]"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upgrade to Premium — £995 / $1,295"}
      </Button>
      {error && <p className="mt-2 text-xs text-red-400 text-center">{error}</p>}
    </div>
  )
}
