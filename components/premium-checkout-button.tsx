"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

/**
 * Premium checkout CTA that mirrors the /pricing page's Premium "Get Started"
 * behaviour exactly:
 *   - logged-out  → signup carrying a checkout intent (tier=premium)
 *   - logged-in   → straight to the Stripe Checkout session via /api/checkout
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
  const { user, loading: authLoading } = useAuth()
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
      window.location.href = "/login?mode=signup&intent=checkout&tier=premium"
      return
    }
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
