"use client"

import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { Mail, MessageSquare, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-brand-navy flex flex-col relative">
      {/* Premium Dark Gradient Mesh Background - Same as homepage hero */}
      <div className="fixed inset-0 bg-brand-navy -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--brand-teal-deep-rgb)_/_0.4),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgb(var(--brand-teal-deep-rgb)_/_0.15),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_50%_30%_at_10%_80%,rgb(var(--brand-teal-deep-rgb)_/_0.1),transparent)] -z-10" />

      <GlobalNav />
      
      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-semibold text-slate-100 mb-3">Contact Us</h1>
          <p className="text-slate-300">
            Get in touch with the CBIQ team.
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-8 text-center shadow-[0_0_40px_-12px_rgb(var(--brand-teal-rgb)_/_0.25)] hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.4)] transition-all duration-200">
            <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_-8px_rgb(var(--brand-teal-rgb)_/_0.5)]">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-slate-100 mb-2">Email Us</h3>
            <p className="text-sm text-slate-400 mb-4">
              For general inquiries and membership questions.
            </p>
            <a 
              href="mailto:crossborderiq@gemevents.co"
              className="text-primary hover:text-primary/80 hover:underline text-sm font-medium"
            >
              crossborderiq@gemevents.co
            </a>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-8 text-center shadow-[0_0_40px_-12px_rgb(var(--brand-teal-rgb)_/_0.25)] hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.4)] transition-all duration-200">
            <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_-8px_rgb(var(--brand-teal-rgb)_/_0.5)]">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-slate-100 mb-2">Request Access</h3>
            <p className="text-sm text-slate-400 mb-4">
              Interested in CBIQ intelligence products?
            </p>
            <Button className="bg-primary hover:bg-primary/90 transition-shadow hover:shadow-[0_0_24px_-4px_rgb(var(--brand-teal-rgb)_/_0.6)]" asChild>
              <a href="/pricing">View all membership options</a>
            </Button>
          </div>
        </div>

        {/* Registered Company */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-8 text-center shadow-[0_0_40px_-12px_rgb(var(--brand-teal-rgb)_/_0.25)] mb-12">
          <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_-8px_rgb(var(--brand-teal-rgb)_/_0.5)]">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium text-slate-100 mb-2">Registered Company</h3>
          <div className="text-sm text-slate-400 leading-relaxed">
            <p>GEM Events &amp; Consultancy FZCO</p>
            <p>DSO-IFZA, IFZA Properties, Dubai Silicon Oasis</p>
            <p>Dubai, United Arab Emirates</p>
            <p>Trade licence no. 39377, issued by the Dubai Integrated Economic Zones Authority (IFZA)</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="rounded-xl border border-primary/20 bg-brand-navy-2/60 p-6 text-center">
          <p className="text-sm text-slate-300">
            CBIQ is a workforce intelligence platform providing benchmarking, market intelligence and strategic insights for HR, Mobility, Talent and Workforce leaders.
          </p>
        </div>
      </main>

      <GlobalFooter />
    </div>
  )
}
