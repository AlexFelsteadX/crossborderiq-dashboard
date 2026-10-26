"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { signupForCheckoutPath } from "@/lib/checkout-intent"

/**
 * Premium checkout CTA that mirrors the /pricing page's Premium "Get Started"
 * behaviour exactly:
 *   - logged-out  → signup carrying a checkout intent (tier=premium)
 *   - logged-in   → premium to /premium-dashboard, vendor to the vendor
 *                   dashboard, everyone else to Stripe Checkout via /api/checkout
 * The tier/plan key ("premium") and the /api/checkout + /login intent contract
 * are reused verbatim so Stripe logic and price IDs stay centralised.
 */
export function PremiumCheckoutButton({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const { user, tier, loading: authLoading } = useAuth()
  const [loadingCheckout, setLoadingCheckout] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startCheckout = async () => {
    setError(null)
    setLoadingCheckout(true)
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
      setLoadingCheckout(false)
    }
  }

  const handleClick = () => {
    if (!user) {
      // Logged-out self-serve visitors carry a checkout intent through signup so
      // they're sent straight to checkout once authenticated.
      window.location.href = signupForCheckoutPath("premium")
      return
    }
    // Existing customers never start a second corporate checkout.
    if (tier === "premium") {
      window.location.href = "/premium-dashboard"
      return
    }
    if (tier === "vendor") {
      window.location.href = "/vendor-premium-dashboard"
      return
    }
    // free, and contributor (30-day trial) via the trial banner's upgrade CTA.
    startCheckout()
  }

  return (
    <div className="w-full">
      <Button
        className={className}
        onClick={handleClick}
        disabled={authLoading || loadingCheckout}
      >
        {loadingCheckout ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
      </Button>
      {error && <p className="mt-2 text-[11px] text-red-400">{error}</p>}
    </div>
  )
}
