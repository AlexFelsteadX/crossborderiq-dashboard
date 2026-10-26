import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const PRICING_FAQS = [
  {
    question: "How do I get the 30-day access?",
    answer:
      "Complete the Global Workforce Deployment survey, or register for any GME event. Either one unlocks the full Premium dashboard free for 30 days, with no card required.",
  },
  {
    question: "What happens when my 30 days end?",
    answer:
      "You keep your score and market view. Peer comparisons re-lock until you become a member or earn another 30 days.",
  },
  {
    question: "Can I get it again?",
    answer:
      "Yes. Every GME event you register for earns a fresh 30 days, and the survey unlocks access once every 12 months.",
  },
  {
    question: "We’re a team. Do we each need a membership?",
    answer:
      "A Global Workforce Intelligence membership covers one person. If several people on your team need access, CBIQ Advisory includes up to 5 team seats.",
  },
  {
    question: "Can I pay by invoice?",
    answer:
      "Yes. Email crossborderiq@gemevents.co and we will arrange an annual invoice for your membership or Advisory plan.",
  },
  {
    question: "Is my data identifiable?",
    answer:
      "Never. Results are only ever shown in aggregate, and no figure is shown for any group of fewer than 10 respondents.",
  },
]

export function PlanFaq({ className = "max-w-3xl mx-auto mt-16" }: { className?: string }) {
  return (
    <section aria-labelledby="pricing-faq-heading" className={className}>
      <h3 id="pricing-faq-heading" className="text-xl font-semibold text-slate-100 mb-6 text-center">
        Questions about plans
      </h3>
      <Accordion
        type="single"
        collapsible
        className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 px-6"
      >
        {PRICING_FAQS.map((faq, i) => (
          <AccordionItem key={faq.question} value={`faq-${i}`} className="border-primary/10">
            <AccordionTrigger className="text-left text-sm font-medium text-slate-100 hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-slate-300 leading-relaxed text-pretty">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
