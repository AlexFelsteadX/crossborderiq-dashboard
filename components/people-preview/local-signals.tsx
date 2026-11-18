"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LOCAL_SIGNALS, isReportable } from "@/lib/people-vendor-sample"
import { BaseNote, CARD_CLASS, RankedBars, ThinDataState } from "./panel"

export function LocalSignals() {
  return (
    <div className={CARD_CLASS}>
      <Tabs defaultValue={LOCAL_SIGNALS[0].id} className="gap-5">
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <TabsList className="h-auto w-max gap-1 bg-brand-navy-3/60 p-1">
            {LOCAL_SIGNALS.map((t) => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                className="px-3 py-1.5 text-xs text-slate-300 focus-visible:ring-2 focus-visible:ring-primary data-[state=active]:bg-primary/15 data-[state=active]:text-primary dark:data-[state=active]:bg-primary/15"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {LOCAL_SIGNALS.map((t) => (
          <TabsContent key={t.id} value={t.id} className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-100">{t.question}</h3>
            {t.data && isReportable(t.data.base) ? (
              <>
                <div className="max-w-2xl">
                  <RankedBars bars={t.data.bars} label={t.question} />
                </div>
                <BaseNote base={t.data.base} suffix={`HQ or major operations in ${t.label.split(" (")[0]}`} />
              </>
            ) : (
              <ThinDataState />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
