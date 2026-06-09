"use client"

import { FileText, BarChart3, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function MemberActions() {
  const actions = [
    {
      icon: FileText,
      title: "Reports Library",
      description: "Access historical benchmark reports, industry research and CBIQ intelligence publications.",
      buttonText: "View Reports",
      href: "/reports",
    },
    {
      icon: BarChart3,
      title: "Benchmark My Organisation",
      description: "Compare your organisation against peer groups using regional, industry and workforce-size intelligence.",
      buttonText: "Unlock Global Workforce Intelligence™",
      href: "/pricing#global-workforce-intelligence",
    },
    {
      icon: MessageSquare,
      title: "Request Access",
      description: "Speak with the CBIQ team about membership options and intelligence access.",
      buttonText: "Request Access",
      href: "/pricing#corporate-access",
    },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Next Steps</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action) => (
          <div
            key={action.title}
            className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 flex flex-col items-center text-center hover:border-primary/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <action.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-base font-medium text-foreground mb-2">{action.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
            <Button variant="outline" size="sm" className="mt-auto" asChild>
              <Link href={action.href}>
                {action.buttonText}
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
