export function ChartTooltip({ active, payload, label, format = (v) => v, labelFormat = (l) => l }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-lift">
      <div className="text-xs text-muted-foreground">{labelFormat(label, payload[0]?.payload)}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="mt-0.5 flex items-center gap-2 text-sm">
          <span className="size-2 rounded-full" style={{ background: p.color || p.stroke || p.fill }} />
          <span className="font-semibold tabular-nums">{format(p.value, p)}</span>
        </div>
      ))}
    </div>
  );
}
