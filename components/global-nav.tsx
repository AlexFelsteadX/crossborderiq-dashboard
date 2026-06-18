"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, Menu, X, LogOut, User, CreditCard } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useSiteData } from "@/lib/site-data-context"

export function GlobalNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const [dashboardOpen, setDashboardOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState(false)
  
  const { user, tier, loading, signOut } = useAuth()
  const { lastUpdated } = useSiteData()
  
  const isPaidTier = tier === "premium" || tier === "vendor"
  
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
  
  // Tier-aware dashboard destination (uses existing routes only)
  const dashboardHref =
    tier === "vendor"
      ? "/vendor-premium-dashboard"
      : tier === "premium"
        ? "/premium-dashboard"
        : "/workforce-intelligence" // free

  type NavItem = { href: string; label: string; highlight?: boolean }

  // Default / guest marketing links (also shown while auth is still resolving)
  const guestNavItems: NavItem[] = [
    { href: "/workforce-intelligence", label: "Global Workforce Intelligence" },
    { href: "/vendor-intelligence", label: "Vendor Intelligence" },
    { href: "/reports", label: "Reports" },
    { href: "/pricing", label: "Pricing" },
  ]

  let mainNavItems: NavItem[]
  if (loading || !user) {
    // Render guest/default nav until auth + tier resolve (avoids flicker)
    mainNavItems = guestNavItems
  } else if (tier === "vendor") {
    // Dashboard becomes a dropdown (rendered separately); keep Reports + Pricing here.
    mainNavItems = [
      { href: "/reports", label: "Reports" },
      { href: "/pricing", label: "Pricing" },
    ]
  } else if (tier === "premium") {
    // Replace Global Workforce Intelligence with Dashboard, keep Vendor Intelligence (upsell)
    mainNavItems = [
      { href: dashboardHref, label: "Dashboard", highlight: true },
      { href: "/vendor-intelligence", label: "Vendor Intelligence" },
      { href: "/reports", label: "Reports" },
      { href: "/pricing", label: "Pricing" },
    ]
  } else {
    // free: add a prominent Dashboard link, keep marketing/upsell links
    mainNavItems = [
      { href: dashboardHref, label: "Dashboard", highlight: true },
      ...guestNavItems,
    ]
  }

  // TODO: Move Premium Dashboard behind authenticated member access once Supabase authentication and role-based access are implemented.
  // Tier-aware dashboard links in the More dropdown (uses the same `tier` from useAuth):
  // - vendor: Premium + Vendor Premium dashboards (no Contributor Dashboard)
  // - premium: Premium dashboard only
  // - free / guest: premium + vendor dashboards only (Contributor Dashboard retired)
  let dashboardMoreItems: NavItem[]
  if (tier === "vendor") {
    // Premium Dashboard now lives in the Dashboard dropdown, so it's removed here
    // to avoid duplication. The rest of More is unchanged.
    dashboardMoreItems = [
      { href: "/vendor-premium-dashboard", label: "Vendor Premium Dashboard" },
    ]
  } else if (tier === "premium") {
    dashboardMoreItems = [
      { href: "/premium-dashboard", label: "Global Workforce Intelligence™ Premium Dashboard" },
    ]
  } else {
    // free + guest: surface the premium/vendor dashboards as upsell entry points.
    // The retired Contributor Dashboard is intentionally not linked here.
    dashboardMoreItems = [
      { href: "/premium-dashboard", label: "Global Workforce Intelligence™ Premium Dashboard" },
      { href: "/vendor-premium-dashboard", label: "Vendor Premium Dashboard" },
    ]
  }

  const moreNavItems: NavItem[] = [
    ...dashboardMoreItems,
    { href: "/methodology", label: "Methodology" },
    { href: "/faqs", label: "FAQs" },
    { href: "/contact", label: "Contact Us" },
  ]

  // Vendor-only "Dashboard" dropdown links. Empty for every other tier, so the
  // dropdown only renders for vendors and nothing else changes.
  const vendorDashboardItems: NavItem[] =
    tier === "vendor"
      ? [
          { href: "/vendor-premium-dashboard", label: "Vendor Dashboard" },
          { href: "/premium-dashboard", label: "Premium Dashboard" },
        ]
      : []
  const dashboardDropdownActive = vendorDashboardItems.some((item) => pathname === item.href)

  // Mobile flattens everything; surface the vendor dashboard links up front so
  // they're reachable just like the "More" items.
  const allNavItems = [...vendorDashboardItems, ...mainNavItems, ...moreNavItems]

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
            {/* Vendor-only Dashboard dropdown (same pattern as the More menu) */}
            {vendorDashboardItems.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setDashboardOpen(!dashboardOpen)}
                  onBlur={() => setTimeout(() => setDashboardOpen(false), 150)}
                  className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 font-semibold ${
                    dashboardDropdownActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/15 text-primary hover:bg-primary/25"
                  }`}
                >
                  Dashboard
                  <ChevronDown className={`h-4 w-4 transition-transform ${dashboardOpen ? "rotate-180" : ""}`} />
                </button>

                {dashboardOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-xl py-2 z-50">
                    {vendorDashboardItems.map((item) => (
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
            )}

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
          
          {/* Auth section */}
          {!loading && (
            <>
              {user ? (
                /* Logged in - show user info */
                <div className="hidden sm:flex items-center gap-3">
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card/50 hover:bg-card transition-colors text-sm"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground max-w-[150px] truncate">{user.email}</span>
                      {tier && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">
                          {tier}
                        </span>
                      )}
                      <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                    </button>
                    
                    {userMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 w-56 rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-xl py-2 z-50">
                        <div className="px-4 py-2 border-b border-border">
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          {tier && (
                            <p className="text-xs font-medium text-primary mt-0.5">{tier} member</p>
                          )}
                        </div>
                        {/* Subscription section */}
                        <div className="px-4 pt-2 pb-1">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Subscription</p>
                          <p className="text-xs text-foreground mt-0.5 capitalize">
                            {tier || "free"} plan
                          </p>
                        </div>
                        {isPaidTier ? (
                          <button
                            onClick={handleManageSubscription}
                            disabled={portalLoading}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-colors disabled:opacity-50"
                          >
                            <CreditCard className="h-4 w-4" />
                            {portalLoading ? "Loading..." : "Manage subscription"}
                          </button>
                        ) : (
                          <Link
                            href="/pricing"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                          >
                            <CreditCard className="h-4 w-4" />
                            Upgrade
                          </Link>
                        )}
                        {portalError && (
                          <p className="px-4 py-1 text-xs text-red-400">Couldn&apos;t open billing. Try again.</p>
                        )}
                        <div className="border-t border-border mt-1 pt-1">
                          <button
                            onClick={signOut}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
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
                /* Logged out - single prominent Log in button + quiet Contact link */
                <div className="hidden sm:flex items-center gap-4">
                  <a
                    href="mailto:crossborderiq@gemevents.co?subject=CBIQ%20enquiry"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contact
                  </a>
                  <Link href="/login?mode=signin">
                    <Button className="bg-primary hover:bg-primary/90 text-sm cursor-pointer">
                      Get Access
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-card/95 backdrop-blur-md">
          <nav className="px-6 py-4 flex flex-col gap-1">
            {allNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2.5 rounded-md transition-colors text-sm ${
                  "highlight" in item && item.highlight
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
              {user ? (
                <>
                  <div className="px-3 py-2">
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    {tier && (
                      <span className="inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">
                        {tier}
                      </span>
                    )}
                  </div>
                  <div className="px-3 pb-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Subscription</p>
                    <p className="text-xs text-foreground mt-0.5 capitalize">{tier || "free"} plan</p>
                  </div>
                  {isPaidTier ? (
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
                  ) : (
                    <Link
                      href="/pricing"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full"
                    >
                      <Button variant="outline" className="w-full text-sm">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Upgrade
                      </Button>
                    </Link>
                  )}
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
                <Link
                  href="/login?mode=signin"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full"
                >
                  <Button className="w-full bg-primary hover:bg-primary/90 text-sm cursor-pointer">
                    Get Access
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
