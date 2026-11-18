import { isReportable, topicPanel, type PeopleTopic, type PipelineRow } from "@/lib/people-vendor-sample"
import { PanelCard, RankedBars, ThinDataState } from "./panel"

export function TopicPanels({ rows, topic }: { rows: PipelineRow[]; topic: PeopleTopic }) {
  const data = topicPanel(rows, topic)
  const show = data && isReportable(data.base)
  const cards = [
    { title: "Current approach", bars: data?.approach },
    { title: "Where improvement is needed", bars: data?.improvement },
    { title: "Capabilities being considered, next 12 to 24 months", bars: data?.capabilities },
  ]
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {cards.map((c) => (
        <PanelCard key={c.title} title={c.title} base={show ? data.base : undefined}>
          {show && c.bars ? <RankedBars bars={c.bars} label={`${c.title}, ${topic}`} /> : <ThinDataState />}
        </PanelCard>
      ))}
    </div>
  )
}
