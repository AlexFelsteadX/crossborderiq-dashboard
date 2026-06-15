"use client"

import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const faqs = [
  {
    question: "What is CBIQ?",
    answer: "CBIQ (Cross-Border Workforce Intelligence) is the workforce intelligence platform from Global Mobility Executive (GME), providing benchmarking, market intelligence and strategic insights across Global Mobility, Immigration, Compliance, Risk and Workforce Strategy.\n\nOur intelligence products help organizations benchmark performance, understand market trends and make more informed workforce decisions.",
  },
  {
    question: "Who is behind CBIQ?",
    answer: "CBIQ is powered by Global Mobility Executive (GME). It draws on GME's global community of HR, Mobility and Talent leaders, its industry events and its research programs to turn collective insight into the peer benchmarks the industry has long lacked.",
  },
  {
    question: "Where does the data come from?",
    answer: "CBIQ intelligence is built from three primary sources:\n\n• 1,500+ HR, Mobility, Talent and Workforce leaders participating in Global Mobility Executive (GME) industry events annually\n• The annual Global Workforce Deployment Survey™\n• Ongoing intelligence surveys completed by CBIQ members throughout the year\n\nAll reporting is anonymized and presented in aggregate form.",
  },
  {
    question: "How many organizations participate?",
    answer: "CBIQ intelligence is informed by participants across 35+ countries and 4 global regions, representing organizations ranging from fewer than 250 employees to global enterprises employing more than 50,000 employees.",
  },
  {
    question: "How often is intelligence updated?",
    answer: "CBIQ continuously refreshes benchmark data throughout the year through event participation, member surveying and annual flagship research programs.\n\nNew intelligence findings and reports are released regularly.",
  },
  {
    question: "How do I get free Premium access?",
    answer: "Complete the Global Workforce Deployment Survey™ and you'll unlock 14 days of full Premium access — free.\n\nIt's the free on-ramp to Global Workforce Intelligence™: contribute your perspective to the benchmarks and get complete dashboard access for 14 days in return.",
  },
  {
    question: "What's included in the 14-day free Premium access?",
    answer: "For 14 days you get the complete Global Workforce Intelligence™ feature set, including:\n\n• Full dashboard access (pillar deep-dives)\n• Regional, industry and workforce-size benchmarking\n• Mobility Maturity Index™ findings\n• AI Adoption Index™ findings\n• Future of Mobility Index™\n• Executive benchmark reports\n• Quarterly intelligence updates\n• Industry trend analysis",
  },
  {
    question: "What happens after the 14-day free Premium access ends?",
    answer: "After 14 days, full Premium features become locked unless you subscribe to Global Workforce Intelligence™.\n\nPremium-only capabilities include:\n\n• Year-on-Year Trends\n• Regional filtering\n• Industry filtering\n• Workforce size filtering\n• Peer / advanced benchmarking\n• Branded / exportable benchmark reports\n\nYou can continue exploring the free public dashboard at any time.",
  },
  {
    question: "What is Global Workforce Intelligence™?",
    answer: "Global Workforce Intelligence™ is CBIQ's premium benchmarking and intelligence membership designed for HR, Mobility, Talent and Workforce leaders.",
  },
  {
    question: "What does Global Workforce Intelligence™ include?",
    answer: "• Full dashboard access\n• Regional benchmarking\n• Industry benchmarking\n• Workforce size benchmarking\n• Mobility Maturity Index™ analysis\n• AI Adoption benchmarking\n• Executive intelligence reports\n• Quarterly intelligence releases\n• Peer comparison capabilities",
  },
  {
    question: "Can I benchmark my organization?",
    answer: "Yes.\n\nGlobal Workforce Intelligence™ members can benchmark against peer organizations using:\n\n• Region\n• Industry\n• Workforce Size\n\nBenchmarking is based on aggregated CBIQ intelligence data.",
  },
  {
    question: "Why is Global Workforce Intelligence™ a paid membership?",
    answer: "The membership provides access to continuously updated intelligence, advanced benchmarking tools, peer comparison capabilities and premium research content beyond the 14-day free Premium access unlocked by completing the Global Workforce Deployment Survey™.",
  },
  {
    question: "What is Vendor Intelligence™?",
    answer: "Vendor Intelligence™ is designed for service providers operating within workforce mobility, immigration, compliance, tax, relocation and workforce technology markets.",
  },
  {
    question: "What insights are included in Vendor Intelligence™?",
    answer: "Vendor Intelligence™ provides aggregated market intelligence including:\n\n• Transformation activity\n• Operational pressures\n• Investment priorities\n• AI adoption trends\n• Workforce strategy priorities\n• Market demand indicators\n• Future industry direction",
  },
  {
    question: "Can vendors see participant names or company data?",
    answer: "No.\n\nCBIQ does not disclose individual participant names, company names or organization-level responses.\n\nVendor Intelligence™ is designed to provide aggregated market intelligence rather than lead lists.\n\nThe value comes from understanding where demand is emerging, what organizations are investing in, which challenges are increasing and how buying priorities are evolving across regions, industries and workforce segments.\n\nVendor Intelligence™ helps providers identify:\n\n• Regions experiencing the highest transformation activity\n• Areas attracting the greatest investment focus\n• Emerging compliance, immigration and workforce challenges\n• AI adoption priorities\n• Operational pressures influencing buying behavior\n• Future workforce and mobility trends\n\nThis enables providers to focus sales, marketing, product development and go-to-market strategy where market opportunity is strongest, while protecting participant confidentiality and maintaining the integrity of the benchmark data.",
  },
  {
    question: "What do 'Emerging', 'Opening' and 'Saturated' mean?",
    answer: "Each service is compared on two measures: demand — the share of buyers expressing interest in it — and provision — the share of organizations that report already having it in place.\n\n• Emerging: a service buyers are actively seeking that doesn't yet have an established provision benchmark — newer territory with little measured supply, so an early-mover opportunity.\n• Opening: demand is higher than current provision — more buyers want the service than organizations currently have it — a clear, measurable gap to move into.\n• Saturated: provision already meets or exceeds demand — the need is well-served, so it's more competitive to enter.",
  },
  {
    question: "Can anyone see my organization's data?",
    answer: "No.\n\nCBIQ only reports anonymized and aggregated benchmark findings.\n\nIndividual organizations and respondents are never identified in reports, dashboards or intelligence products.",
  },
  {
    question: "How is participant confidentiality protected?",
    answer: "All responses are anonymized before analysis.\n\nCBIQ does not sell, share or disclose individual participant data.\n\nOnly aggregated benchmark results are published.",
  },
  {
    question: "How do I get access?",
    answer: "There are a few ways to access CBIQ intelligence:\n\n• Free public dashboard — explore headline workforce intelligence at /workforce-intelligence. No account required.\n• 14 days of free Premium — complete the Global Workforce Deployment Survey™ to unlock full Premium access for 14 days, free.\n• Global Workforce Intelligence™ — full Premium membership is £995/year via secure checkout.\n• Vendor Intelligence™ — for service providers, see the pricing page for options.",
  },
  {
    question: "Which membership option is right for me?",
    answer: "For HR, Mobility, Talent and Workforce leaders:\n• Free public dashboard\n• 14 days of free Premium via the Global Workforce Deployment Survey™\n• Global Workforce Intelligence™\n\nFor service providers:\n• Vendor Intelligence™\n• Strategic Intelligence Partner",
  },
]

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-primary/5 transition-colors"
      >
        <span className="text-sm font-medium text-slate-100 pr-4">{question}</span>
        <ChevronDown 
          className={`h-5 w-5 text-primary shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`} 
        />
      </button>
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-5">
          <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">{answer}</p>
        </div>
      </div>
    </div>
  )
}

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col relative">
      {/* Premium Dark Gradient Mesh Background - Same as homepage */}
      <div className="fixed inset-0 bg-brand-navy -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--brand-teal-deep-rgb)_/_0.4),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgb(var(--brand-teal-deep-rgb)_/_0.15),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_50%_30%_at_10%_80%,rgb(var(--brand-teal-deep-rgb)_/_0.1),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30 -z-10" />
      
      <GlobalNav />
      
      <main className="flex-1 px-6 py-12 max-w-[1200px] mx-auto w-full">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-100 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Everything you need to know about CBIQ intelligence.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3 mb-12">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        {/* CTA Section */}
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-8 text-center shadow-[0_0_40px_-10px_rgb(var(--brand-teal-rgb)_/_0.25)]">
          <h2 className="text-xl font-semibold text-slate-100 mb-3">Ready to Unlock Workforce Intelligence?</h2>
          <p className="text-sm text-slate-400 mb-6 max-w-xl mx-auto">
            Join the organizations helping shape the future of workforce intelligence.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button className="bg-primary hover:bg-primary/90" asChild>
              <Link href="/contributor-dashboard">Contribute to the Survey</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/pricing">View all membership options</Link>
            </Button>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">
            {"Still have questions? "}
            <a href="mailto:crossborderiq@gemevents.co" className="text-primary hover:underline">
              Contact our team
            </a>
          </p>
        </div>
      </main>

      <GlobalFooter />
    </div>
  )
}
