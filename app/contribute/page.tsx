import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { Users, FileText, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: "Contribute to the Global Workforce Deployment Survey",
  description:
    "Add your voice to the annual Global Workforce Deployment Survey and unlock complimentary Contributor Access to CBIQ dashboards and reports.",
}

export default function ContributePage() {
  const benefits = [
    {
      icon: Users,
      title: "Contribute to Industry Indices",
      description: "Help shape the Strategic Mobility Index™, AI Adoption Index™ and Future of Workforce Intelligence.",
    },
    {
      icon: FileText,
      title: "Receive Contributor Access",
      description: "Participating organisations receive selected intelligence findings, executive reports and quarterly updates.",
    },
    {
      icon: Shield,
      title: "Confidential & Aggregated",
      description: "All responses are anonymised and reported only in aggregate form.",
    },
  ]

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col relative">
      {/* Premium Dark Gradient Mesh Background - Same as homepage hero */}
      <div className="fixed inset-0 bg-brand-navy -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--brand-teal-deep-rgb)_/_0.4),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgb(var(--brand-teal-deep-rgb)_/_0.15),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_50%_30%_at_10%_80%,rgb(var(--brand-teal-deep-rgb)_/_0.1),transparent)] -z-10" />

      <GlobalNav />
      
      <main className="flex-1 px-6 py-10 max-w-[1200px] mx-auto w-full">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-100 mb-4">
            Intelligence Contributor Access<span className="text-primary text-lg align-top">™</span>
          </h1>
          <p className="text-lg text-slate-300 mb-4 max-w-3xl mx-auto">
            Contribute to CBIQ Intelligence Indices and help shape the future of workforce, mobility, immigration and compliance intelligence.
          </p>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Complete the CBIQ Intelligence Contributor survey and receive access to selected benchmark findings, executive reports and quarterly intelligence updates.
          </p>
        </div>

        {/* Benefit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-8 text-center shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.25)] hover:shadow-[0_0_80px_-10px_rgb(var(--brand-teal-rgb)_/_0.4)] hover:-translate-y-1 transition-all duration-200"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_-8px_rgb(var(--brand-teal-rgb)_/_0.5)]">
                <benefit.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-slate-100 mb-2">{benefit.title}</h3>
              <p className="text-sm text-slate-400">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <div className="text-center mb-8">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 px-8 transition-shadow hover:shadow-[0_0_24px_-4px_rgb(var(--brand-teal-rgb)_/_0.6)]">
            <Link href="/contributor-dashboard">Get Contributor Access</Link>
          </Button>
        </div>

        {/* Privacy Note */}
        <div className="rounded-xl bg-brand-navy-2/60 border border-primary/20 p-4 mb-10">
          <p className="text-xs text-slate-400 text-center">
            CBIQ does not disclose participant names, company names or individual survey responses. Data is used solely for benchmarking, intelligence reporting and industry trend analysis.
          </p>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 hover:text-primary bg-transparent" asChild>
            <Link href="/pricing">View Membership Options</Link>
          </Button>
          <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 hover:text-primary bg-transparent" asChild>
            <Link href="/reports">Explore Reports</Link>
          </Button>
        </div>
      </main>

      <GlobalFooter />
    </div>
  )
}
