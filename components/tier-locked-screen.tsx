import Link from "next/link"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"

interface TierLockedScreenProps {
  heading: string
  message: string
  buttonText: string
  buttonHref: string
  buttonNewTab?: boolean
}

export function TierLockedScreen({
  heading,
  message,
  buttonText,
  buttonHref,
  buttonNewTab,
}: TierLockedScreenProps) {
  return (
    <div className="min-h-screen bg-brand-navy flex flex-col relative">
      {/* Premium Dark Gradient Mesh Background - Same as homepage */}
      <div className="fixed inset-0 bg-brand-navy -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--brand-teal-deep-rgb)_/_0.4),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgb(var(--brand-teal-deep-rgb)_/_0.15),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_50%_30%_at_10%_80%,rgb(var(--brand-teal-deep-rgb)_/_0.1),transparent)] -z-10" />

      <GlobalNav />
      
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <Card className="w-full max-w-lg p-10 rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.25)] text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_-8px_rgb(var(--brand-teal-rgb)_/_0.5)]">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-100 mb-3">
            {heading}
          </h1>
          
          <p className="text-slate-400 mb-8">
            {message}
          </p>
          
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 transition-shadow hover:shadow-[0_0_24px_-4px_rgb(var(--brand-teal-rgb)_/_0.6)]">
            <Link 
              href={buttonHref}
              {...(buttonNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {buttonText}
            </Link>
          </Button>
        </Card>
      </main>
      
      <GlobalFooter />
    </div>
  )
}
