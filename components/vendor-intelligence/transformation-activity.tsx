"use client"

const transformationData = [
  { label: "Optimizing selected areas of mobility program", value: 69 },
  { label: "Actively transforming parts of mobility function", value: 64 },
  { label: "Reviewing current processes and technology tools", value: 61 },
]

export function TransformationActivityIndex() {
  return (
    <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Transformation Activity Index™</h3>
          <p className="text-xs text-muted-foreground mt-1">Top transformation signals across organizations</p>
        </div>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Preview</span>
      </div>

      <div className="space-y-4">
        {transformationData.map((item, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-foreground">{item.label}</span>
              <span className="text-sm font-semibold text-primary">{item.value}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-chart-3 rounded-full transition-all duration-500"
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          + 3 more indicators available with Premium access
        </p>
      </div>
    </div>
  )
}
