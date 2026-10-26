import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PrimaryCta({ href }: { href: string }) {
  return (
    <Button size="lg" className="h-12 gap-2 px-7 text-base bg-primary hover:bg-primary/90" asChild>
      <Link href={href}>
        Get my free score
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Button>
  )
}

export function SecondaryCta() {
  return (
    <Button
      size="lg"
      variant="ghost"
      className="h-12 px-6 text-base text-slate-200 hover:bg-white/5 hover:text-slate-50"
      asChild
    >
      <Link href="/pricing">See membership</Link>
    </Button>
  )
}
