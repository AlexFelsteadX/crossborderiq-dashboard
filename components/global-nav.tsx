"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { ChevronDown, Menu, X, LogOut, User, CreditCard, Mail } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useSiteData } from "@/lib/site-data-context"

const BILLING_MAILTO = "mailto:crossborderiq@gemevents.co?subject=Billing"

// Internal tier values are never rendered; every visible tier label goes through this map.
const TIER_LABELS: Record<string, { badge: string; plan: string }> = {
  free: { badge: "Free", plan: "Free plan" },
  contributor: { badge: "Free", plan: "Free plan" },
  premium: { badge: "Member", plan: "Membership" },
  vendor: { badge: "Vendor Partner", plan: "Vendor Intelligence Partner" },
}

function tierLabels(tier: string | null) {
  return TIER_LABELS[tier ?? "free"] ?? TIER_LABELS.free
}

type BillingStatus = { hasStripeSubscription: boolean }

const fetchBillingStatus = async (url: string): Promise<BillingStatus> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Billing status unavailable")
  return res.json()
}

export function GlobalNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState(false)

  const { user, tier, loading, signOut } = useAuth()
  const { lastUpdated } = useSiteData()

  const isPaidTier = tier === "premium" || tier === "vendor"
  const labels = tierLabels(tier)

  const { data: billingStatus, error: billingError } = useSWR<BillingStatus>(
    user && isPaidTier ? ["/api/portal", user.id] : null,
    ([url]: [string]) => fetchBillingStatus(url),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  )
  const billingResolved = billingStatus !== undefined || billingError !== undefined
  const hasStripeSubscription = billingStatus?.hasStripeSubscription === true

  const handleManageSubscription = async () => {
    setPortalError(false)
    setPortalLoading(true)
    try {
      const res = await fetch("/api/portal", { method: "POST" })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
      throw new Error(data.error || "No portal URL returned")
    } catch (error) {
      console.error("Failed to open portal:", error)
      setPortalError(true)
      setPortalLoading(false)
    }
  }

  // /workforce-intelligence is a marketing overview, not a dashboard destination.
  const dashboardHref =
    tier === "vendor" ? "/vendor-premium-dashboard" : "/premium-dashboard"

  type NavItem = { href: string; label: string; highlight?: boolean }

  // Guest links are also shown while auth is still resolving, to avoid flicker.
  const guestNavItems: NavItem[] = [
    { href: "/workforce-intelligence", label: "Global Workforce Intelligence" },
    { href: "/vendor-intelligence", label: "Vendor Intelligence" },
    { href: "/reports", label: "Reports" },
    { href: "/pricing", label: "Pricing" },
  ]

  const signedIn = Boolean(user) && !loading
  const isVendor = signedIn && tier === "vendor"

  let mainNavItems: NavItem[]
  if (!signedIn) {
    mainNavItems = guestNavItems
  } else if (isVendor) {
    mainNavItems = [
      { href: dashboardHref, label: "Dashboard", highlight: true },
      { href: "/reports", label: "Reports" },
      { href: "/pricing", label: "Pricing" },
    ]
  } else if (tier === "premium") {
    mainNavItems = [
      { href: dashboardHref, label: "Dashboard", highlight: true },
      { href: "/vendor-intelligence", label: "Vendor Intelligence" },
      { href: "/reports", label: "Reports" },
      { href: "/pricing", label: "Pricing" },
    ]
  } else {
    mainNavItems = [
      { href: dashboardHref, label: "Dashboard", highlight: true },
      ...guestNavItems,
    ]
  }

  const moreNavItems: NavItem[] = [
    ...(isVendor
      ? [{ href: "/vendor-premium-dashboard?tab=explore", label: "Explore the Benchmark" }]
      : []),
    { href: "/methodology", label: "Methodology" },
    { href: "/faqs", label: "FAQs" },
    { href: "/contact", label: "Contact Us" },
  ]

  const allNavItems = [...mainNavItems, ...moreNavItems]

  const billingLinkClass =
    "w-full flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-colors"

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="px-6 py-4 flex items-center justify-between max-w-[1600px] mx-auto">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            aria-label="CBIQ Home"
            title="CBIQ Home"
            className="transition-opacity duration-200 hover:opacity-80 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background rounded-sm"
          >
            <img
              src="/cbiq-logo-lockup.svg"
              alt="CBIQ"
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 text-sm">
            {mainNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  item.highlight
                    ? pathname === item.href
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-primary/15 text-primary font-semibold hover:bg-primary/25"
                    : pathname === item.href
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* More Dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                onBlur={() => setTimeout(() => setMoreOpen(false), 150)}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
                  moreNavItems.some(item => pathname === item.href)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                More
                <ChevronDown className={`h-4 w-4 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
              </button>

              {moreOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-xl py-2 z-50">
                  {moreNavItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`block px-4 py-2 text-sm transition-colors ${
                        pathname === item.href
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-card"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="hidden md:inline text-xs text-muted-foreground">Last updated: {lastUpdated}</span>
          )}

          {/* Auth section: signed-out set is the default (SSR + while the session
              check is pending or has failed); swap only once a user is confirmed. */}
          {user && signedIn ? (
            <div className="hidden lg:flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card/50 hover:bg-card transition-colors text-sm"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground max-w-[150px] truncate">{user.email}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">
                    {labels.badge}
                  </span>
                  <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      <p className="text-xs font-medium text-primary mt-0.5">{labels.badge}</p>
                    </div>
                    <div className="px-4 pt-2 pb-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Subscription</p>
                      <p className="text-xs text-foreground mt-0.5">{labels.plan}</p>
                    </div>
                    {!isPaidTier ? (
                      <Link
                        href="/pricing"
                        onClick={() => setUserMenuOpen(false)}
                        className={billingLinkClass}
                      >
                        <CreditCard className="h-4 w-4" />
                        Upgrade
                      </Link>
                    ) : hasStripeSubscription ? (
                      <button
                        onClick={handleManageSubscription}
                        disabled={portalLoading}
                        className={`${billingLinkClass} disabled:opacity-50`}
                      >
                        <CreditCard className="h-4 w-4" />
                        {portalLoading ? "Loading..." : "Manage subscription"}
                      </button>
                    ) : billingResolved ? (
                      <a href={BILLING_MAILTO} className={billingLinkClass}>
                        <Mail className="h-4 w-4" />
                        Billing: contact us
                      </a>
                    ) : null}
                    {portalError && (
                      <p className="px-4 py-1 text-xs text-red-400">Couldn&apos;t open billing. Try again.</p>
                    )}
                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={signOut}
                        className={billingLinkClass}
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-4">
              <a
                href="mailto:crossborderiq@gemevents.co?subject=CBIQ%20enquiry"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </a>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" className="text-sm cursor-pointer">
                  <Link href="/login?mode=signin">Login</Link>
                </Button>
                <Button asChild className="bg-primary hover:bg-primary/90 text-sm cursor-pointer">
                  <Link href="/pricing">Get Access</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div id="mobile-nav" className="lg:hidden border-t border-border bg-card/95 backdrop-blur-md">
          <nav className="px-6 py-4 flex flex-col gap-1">
            {allNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2.5 rounded-md transition-colors text-sm ${
                  item.highlight
                    ? pathname === item.href
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-primary/15 text-primary font-semibold hover:bg-primary/25"
                    : pathname === item.href
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 mt-2 border-t border-border space-y-2">
              {user && signedIn ? (
                <>
                  <div className="px-3 py-2">
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">
                      {labels.badge}
                    </span>
                  </div>
                  <div className="px-3 pb-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Subscription</p>
                    <p className="text-xs text-foreground mt-0.5">{labels.plan}</p>
                  </div>
                  {!isPaidTier ? (
                    <Button asChild variant="outline" className="w-full text-sm">
                      <Link href="/pricing" onClick={() => setMobileOpen(false)}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Upgrade
                      </Link>
                    </Button>
                  ) : hasStripeSubscription ? (
                    <Button
                      onClick={() => {
                        setMobileOpen(false)
                        handleManageSubscription()
                      }}
                      disabled={portalLoading}
                      variant="outline"
                      className="w-full text-sm"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {portalLoading ? "Loading..." : "Manage subscription"}
                    </Button>
                  ) : billingResolved ? (
                    <Button asChild variant="outline" className="w-full text-sm">
                      <a href={BILLING_MAILTO}>
                        <Mail className="h-4 w-4 mr-2" />
                        Billing: contact us
                      </a>
                    </Button>
                  ) : null}
                  {portalError && (
                    <p className="px-3 text-xs text-red-400">Couldn&apos;t open billing. Try again.</p>
                  )}
                  <Button
                    onClick={() => {
                      setMobileOpen(false)
                      signOut()
                    }}
                    variant="outline"
                    className="w-full text-sm"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild className="w-full bg-primary hover:bg-primary/90 text-sm cursor-pointer">
                    <Link href="/pricing" onClick={() => setMobileOpen(false)}>
                      Get Access
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full text-sm cursor-pointer">
                    <Link href="/login?mode=signin" onClick={() => setMobileOpen(false)}>
                      Login
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
