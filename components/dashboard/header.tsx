"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface DashboardHeaderProps {
  variant?: "public" | "hr-intelligence"
}

export function DashboardHeader({ variant = "public" }: DashboardHeaderProps) {
  const pathname = usePathname()
  
  const navItems = [
    { href: "/", label: "Dashboard", active: pathname === "/" },
    { href: "/workforce-intelligence", label: "Global Workforce Intelligence", active: pathname === "/workforce-intelligence" },
    { href: "/vendor-intelligence", label: "Vendor Intelligence", active: pathname === "/vendor-intelligence" },
    { href: "#", label: "Reports", active: false },
    { href: "#", label: "Pricing", active: false },
  ]

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="px-6 py-4 flex items-center justify-between max-w-[1600px] mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/">
            <img 
              src="/logo.svg" 
              alt="CBIQ" 
              className="h-8 w-auto"
            />
          </Link>
          <div className="hidden md:flex items-center text-sm text-muted-foreground">
            <span className="text-foreground">Global Workforce Intelligence</span>
            <span className="mx-2 text-border">|</span>
            <span>Immigration</span>
            <span className="mx-2 text-border">|</span>
            <span>Compliance</span>
            <span className="mx-2 text-border">|</span>
            <span>Risk</span>
            <span className="mx-2 text-border">|</span>
            <span>Workforce Mobility</span>
          </div>
        </div>
        <nav className="hidden lg:flex items-center gap-1 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                item.active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Last updated: May 2026</span>
        </div>
      </div>
    </header>
  )
}
