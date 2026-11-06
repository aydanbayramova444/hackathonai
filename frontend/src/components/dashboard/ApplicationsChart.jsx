import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/misc';
import { ChartTooltip } from './ChartTooltip';
import { CHART } from './chartTheme';

const LINE = CHART.series;

export function ApplicationsChart({ weekly, totals, loading }) {
  const data = weekly || [];
  const total = data.reduce((s, w) => s + w.applications, 0);
  const last = data.at(-1)?.applications ?? 0;
  const prev = data.at(-2)?.applications ?? 0;
  const delta = last - prev;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div>
          <CardTitle>Applications over time</CardTitle>
          <CardDescription>New applications per week · last 8 weeks</CardDescription>
        </div>
        {!loading && (
          <div className="text-right">
            <div className="text-2xl font-semibold tracking-tight tabular-nums">{total}</div>
            <div className="mt-0.5 flex items-center justify-end gap-1 text-xs text-muted-foreground">
              <TrendingUp className="size-3.5 text-emerald-600" />
              <span>
                {totals?.new_this_week ?? last} this week{delta !== 0 && ` · ${delta > 0 ? '+' : ''}${delta} vs last`}
              </span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-2">
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="h-64" role="img" aria-label={`Weekly applications: ${data.map((w) => `${w.label} ${w.applications}`).join(', ')}`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="appsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={LINE} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={LINE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={CHART.grid} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: CHART.axis, fontSize: 12 }} dy={8} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: CHART.axis, fontSize: 12 }} width={44} />
                <Tooltip
                  cursor={{ stroke: CHART.axis, strokeDasharray: '3 3', strokeOpacity: 0.5 }}
                  content={<ChartTooltip format={(v) => `${v} application${v === 1 ? '' : 's'}`} labelFormat={(l) => `Week of ${l}`} />}
                />
                <Area
                  type="monotone"
                  dataKey="applications"
                  stroke={LINE}
                  strokeWidth={2}
                  fill="url(#appsFill)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: CHART.surface, fill: LINE }}
                  animationDuration={700}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
