import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/misc';

export function StatCard({ label, value, icon: Icon, tone, hint, to, loading }) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-xl border bg-card p-4 shadow-card sm:p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lift focus-visible:ring-[3px] focus-visible:ring-ring/40 outline-none"
    >
      <div className="flex items-start justify-between">
        <span className={cn('flex size-10 items-center justify-center rounded-lg', tone)}>
          <Icon className="size-5" />
        </span>
        <ArrowUpRight className="size-4 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
      </div>
      <div className="mt-4 text-[13px] font-medium text-muted-foreground">{label}</div>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-16" />
      ) : (
        <div className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
      )}
      <div className="mt-2 text-xs text-muted-foreground">{loading ? <Skeleton className="h-3 w-28" /> : hint}</div>
    </Link>
  );
}
