import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'bg-accent text-accent-foreground ring-indigo-200/70',
        secondary: 'bg-muted text-muted-foreground ring-border',
        outline: 'bg-card text-foreground ring-border',
        success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        warning: 'bg-amber-50 text-amber-800 ring-amber-200',
        danger: 'bg-rose-50 text-rose-700 ring-rose-200',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

function Badge({ className, variant, ...props }) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
