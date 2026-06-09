import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GlobalNav />
      
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-3">Payment Received</h1>
          
          <p className="text-muted-foreground mb-6">
            Thank you for your purchase. Your access is being activated and may take a moment to reflect in your account.
          </p>
          
          <div className="space-y-3">
            <Button className="w-full bg-primary hover:bg-primary/90" asChild>
              <Link href="/premium-dashboard">Go to Premium Dashboard</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">Return to Homepage</Link>
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-6">
            If your access doesn&apos;t appear within a few minutes, please refresh the page or contact{" "}
            <a href="mailto:crossborderiq@gemevents.co" className="text-primary hover:underline">
              crossborderiq@gemevents.co
            </a>
          </p>
        </div>
      </main>
      
      <GlobalFooter />
    </div>
  )
}
