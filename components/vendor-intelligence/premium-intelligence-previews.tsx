"use client"

import { Lock, Check } from "lucide-react"
import Link from "next/link"

function PreviewCard({ 
  title, 
  children, 
  footer,
  buttonText = "Vendor Membership Required",
  buttonHref = "/pricing#vendor-access",
  isStrategicPartner = false 
}: { 
  title: string
  children: React.ReactNode
  footer: string
  buttonText?: string
  buttonHref?: string
  isStrategicPartner?: boolean
}) {
  return (
    <div className={`rounded-xl border ${isStrategicPartner ? "border-amber-500/30" : "border-border"} bg-card/50 backdrop-blur-sm p-6 flex flex-col h-full`}>
      <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
        {title}
        <span className={`text-[10px] font-medium ${isStrategicPartner ? "text-amber-400" : "text-primary"}`}>™</span>
      </h3>
      
      <div className="flex-1 mb-4">
        {children}
      </div>

      <div className="pt-3 mt-auto border-t border-border mb-4">
        <p className={`text-xs ${isStrategicPartner ? "text-amber-400/80" : "text-primary/80"}`}>{footer}</p>
      </div>
      
      <Link 
        href={buttonHref}
        className={`w-full py-2.5 px-4 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
          isStrategicPartner 
            ? "bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
            : "bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20"
        }`}
      >
        <Lock className="w-3.5 h-3.5" />
        {buttonText}
      </Link>
    </div>
  )
}

function RankedItem({ rank, label }: { rank: number; label: string }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-5 h-5 rounded bg-primary/10 text-primary text-xs font-medium flex items-center justify-center flex-shrink-0">
        {rank}
      </span>
      <span className="text-sm text-foreground">{label}</span>
    </div>
  )
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="py-1.5">
      <span className="text-lg font-semibold text-primary">{value}</span>
      <span className="text-sm text-muted-foreground ml-2">{label}</span>
    </div>
  )
}

function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
      <span className="text-sm text-muted-foreground">{children}</span>
    </div>
  )
}

function GoldBulletItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
      <span className="text-sm text-muted-foreground">{children}</span>
    </div>
  )
}

export function PremiumIntelligencePreviews() {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Premium Vendor Intelligence</h2>
          <p className="text-sm text-muted-foreground">Market demand signals and transformation intelligence</p>
        </div>
      </div>

      {/* 5 Vendor Intelligence Cards + 1 Strategic Partner Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* 1. Investment Priorities Index */}
        <PreviewCard 
          title="Investment Priorities Index"
          footer="+ additional investment priorities available with membership"
        >
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Preview</p>
            <RankedItem rank={1} label="AI-enabled workflows" />
            <RankedItem rank={2} label="Mobility technology" />
            <RankedItem rank={3} label="Risk & compliance" />
          </div>
        </PreviewCard>

        {/* 2. Transformation Activity Index */}
        <PreviewCard 
          title="Transformation Activity Index"
          footer="+ additional transformation intelligence available with membership"
        >
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Preview</p>
            <StatItem value="64%" label="Actively transforming mobility functions" />
            <StatItem value="61%" label="Reviewing technology tools" />
            <StatItem value="58%" label="Reviewing vendor ecosystem" />
          </div>
        </PreviewCard>

        {/* 3. Market Demand Intelligence */}
        <PreviewCard 
          title="Market Demand Intelligence"
          footer="+ regional demand analysis available with membership"
        >
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Preview</p>
            <BulletItem>North America</BulletItem>
            <BulletItem>Middle East</BulletItem>
            <BulletItem>Europe</BulletItem>
          </div>
        </PreviewCard>

        {/* 4. Vendor Opportunity Intelligence */}
        <PreviewCard 
          title="Vendor Opportunity Intelligence"
          footer="+ additional opportunity intelligence available with membership"
        >
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Preview</p>
            <BulletItem>Technology platforms</BulletItem>
            <BulletItem>Immigration providers</BulletItem>
            <BulletItem>Compliance solutions</BulletItem>
          </div>
        </PreviewCard>

        {/* 5. Bi-Annual Executive Summary */}
        <PreviewCard 
          title="Bi-Annual Executive Summary"
          footer="Quarterly executive intelligence summaries"
        >
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Preview</p>
            <BulletItem>Market demand trends</BulletItem>
            <BulletItem>Investment priorities</BulletItem>
            <BulletItem>Transformation activity</BulletItem>
          </div>
        </PreviewCard>

        {/* 6. Strategic Intelligence Partner - Strategic Partner */}
        <PreviewCard 
          title="Strategic Intelligence Partner"
          footer="Exclusive engagement with senior HR, Mobility and Workforce leaders"
          buttonText="Strategic Partner Access"
          buttonHref="/pricing#strategic-intelligence-partner"
          isStrategicPartner={true}
        >
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Preview</p>
            <GoldBulletItem>1 Bespoke Executive Event</GoldBulletItem>
            <GoldBulletItem>2 Virtual Executive Roundtables</GoldBulletItem>
            <GoldBulletItem>Quarterly Executive Intelligence Reviews</GoldBulletItem>
          </div>
        </PreviewCard>

      </div>

      {/* Premium CTA Panel */}
      <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-8">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-foreground mb-2">Unlock Vendor Intelligence™</h3>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Access market demand signals, investment priorities, transformation activity and vendor opportunity intelligence from global workforce leaders.
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8 text-left max-w-2xl mx-auto">
            {[
              "Investment Priorities Index™",
              "Transformation Activity Index™",
              "Market Demand Intelligence™",
              "Vendor Opportunity Intelligence™",
              "Bi-Annual Executive Summary™",
              "Regional Demand Analysis",
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Link 
            href="/pricing#vendor-access"
            className="inline-flex px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors"
          >
            Request Vendor Intelligence Access
          </Link>
        </div>
      </div>
    </div>
  )
}
