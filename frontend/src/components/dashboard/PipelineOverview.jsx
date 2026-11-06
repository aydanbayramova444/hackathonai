import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton, Tooltip } from '@/components/ui/misc';
import { STAGE_STYLES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function PipelineOverview({ pipeline, totals, loading }) {
  const rows = pipeline || [];
  const max = Math.max(1, ...rows.map((r) => r.count));
  const total = rows.reduce((s, r) => s + r.count, 0);
  const hired = rows.find((r) => r.stage === 'Hired')?.count ?? 0;
  const rejected = rows.find((r) => r.stage === 'Rejected')?.count ?? 0;
  const decided = hired + rejected;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Recruitment pipeline</CardTitle>
          <CardDescription>{loading ? 'Loading…' : `${totals?.active_candidates ?? 0} active · ${total} total candidates`}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3.5 pt-3">
        {loading
          ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-7 w-full" />)
          : rows.map((r) => {
              const pct = total ? Math.round((r.count / total) * 100) : 0;
              return (
                <Tooltip key={r.stage} content={`${r.count} candidate${r.count === 1 ? '' : 's'} · ${pct}% of pipeline`} side="left">
                  <Link to={`/candidates?stage=${r.stage}`} className="group block rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40">
                    <div className="mb-1.5 flex items-center justify-between text-[13px]">
                      <span className="flex items-center gap-2 font-medium">
                        <span className={cn('size-2 rounded-full', STAGE_STYLES[r.stage].dot)} />
                        {r.stage}
                      </span>
                      <span className="font-semibold tabular-nums text-foreground">{r.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-700 ease-out group-hover:brightness-110',
                          r.stage === 'Rejected' ? 'bg-slate-300' : 'bg-brand-gradient'
                        )}
                        style={{ width: `${(r.count / max) * 100}%` }}
                      />
                    </div>
                  </Link>
                </Tooltip>
              );
            })}
      </CardContent>
      <CardFooter className="justify-between text-[13px]">
        <span className="text-muted-foreground">
          Hire rate{' '}
          <span className="font-semibold text-foreground">{decided ? `${Math.round((hired / decided) * 100)}%` : '–'}</span>{' '}
          of closed candidates
        </span>
        <Link to="/candidates" className="flex items-center gap-1 font-medium text-primary hover:underline">
          Board <ArrowRight className="size-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
