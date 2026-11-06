import { cn } from '@/lib/utils';

export function LogoMark({ className }) {
  return (
    <span className={cn('relative flex size-8 items-center justify-center rounded-lg bg-brand-gradient shadow-soft', className)}>
      <svg viewBox="0 0 32 32" className="size-5" aria-hidden="true">
        <path d="M8 23c3-1 4.5-4.5 8-7s5-4 8-7" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" />
        <circle cx="8" cy="23" r="2.6" fill="#fff" />
        <circle cx="24" cy="9" r="2.6" fill="#fff" />
      </svg>
    </span>
  );
}

export function Logo({ className }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark />
      <div className="leading-none">
        <div className="text-[15px] font-semibold tracking-tight">HireFlow</div>
        <div className="mt-1 text-[11px] text-muted-foreground">HR Daily Workspace</div>
      </div>
    </div>
  );
}
