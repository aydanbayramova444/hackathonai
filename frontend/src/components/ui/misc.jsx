import { Avatar as AvatarP, Progress as ProgressP, Tooltip as TooltipP, Separator as SeparatorP } from 'radix-ui';
import { cn, initials, avatarTone } from '@/lib/utils';

/* Avatar — initials on a stable soft tone */
export function Avatar({ name, src, className }) {
  return (
    <AvatarP.Root className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}>
      {src && <AvatarP.Image src={src} alt={name} className="aspect-square size-full" />}
      <AvatarP.Fallback className={cn('flex size-full items-center justify-center text-[11px] font-semibold', avatarTone(name))}>
        {initials(name)}
      </AvatarP.Fallback>
    </AvatarP.Root>
  );
}

/* Progress */
export function Progress({ value = 0, className, indicatorClassName }) {
  return (
    <ProgressP.Root
      value={value}
      className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-muted', className)}
    >
      <ProgressP.Indicator
        className={cn('h-full rounded-full bg-brand-gradient transition-[width] duration-500 ease-out', indicatorClassName)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </ProgressP.Root>
  );
}

/* Tooltip */
export const TooltipProvider = ({ delayDuration = 200, ...props }) => (
  <TooltipP.Provider delayDuration={delayDuration} {...props} />
);

export function Tooltip({ content, children, side = 'top' }) {
  return (
    <TooltipP.Root>
      <TooltipP.Trigger asChild>{children}</TooltipP.Trigger>
      <TooltipP.Portal>
        <TooltipP.Content
          side={side}
          sideOffset={6}
          className="z-50 rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-lift animate-in fade-in-0 zoom-in-95"
        >
          {content}
        </TooltipP.Content>
      </TooltipP.Portal>
    </TooltipP.Root>
  );
}

/* Separator */
export function Separator({ className, orientation = 'horizontal', ...props }) {
  return (
    <SeparatorP.Root
      orientation={orientation}
      className={cn('shrink-0 bg-border', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)}
      {...props}
    />
  );
}

/* Skeleton */
export function Skeleton({ className, ...props }) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
}
