import Link from "next/link"

export function GlobalFooter() {
  return (
    <footer className="border-t border-border bg-card/30 mt-auto">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <img src="/cbiq-logo-lockup.svg" alt="CBIQ" className="h-6 w-auto mb-4 opacity-70" />
            <p className="text-xs text-muted-foreground">
              Executive intelligence for global workforce and mobility leaders.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Intelligence</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/workforce-intelligence" className="hover:text-foreground transition-colors">Global Workforce Intelligence</Link></li>
              <li><Link href="/vendor-intelligence" className="hover:text-foreground transition-colors">Vendor Intelligence</Link></li>
              <li><Link href="/reports" className="hover:text-foreground transition-colors">Reports</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Company</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="/faqs" className="hover:text-foreground transition-colors">FAQs</Link></li>
              <li><a href="mailto:crossborderiq@gemevents.co?subject=CBIQ%20enquiry" className="hover:text-foreground transition-colors">crossborderiq@gemevents.co</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Legal</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund" className="hover:text-foreground transition-colors">Refund &amp; Cancellation</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} CBIQ. All rights reserved.</span>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground/60">Powered by</span>
            <img 
              src="/images/GME_White_transparent.png" 
              alt="Global Mobility Executive" 
              className="h-[52px] w-auto opacity-70"
            />
          </div>
          <span>Aggregated intelligence only. No individual respondent data is sold or shared.</span>
        </div>
      </div>
    </footer>
  )
}
