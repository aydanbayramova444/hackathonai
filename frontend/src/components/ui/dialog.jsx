import { Dialog as P } from 'radix-ui';
import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const Dialog = (props) => <P.Root data-slot="dialog" {...props} />;
const DialogTrigger = (props) => <P.Trigger data-slot="dialog-trigger" {...props} />;
const DialogClose = (props) => <P.Close data-slot="dialog-close" {...props} />;

function DialogOverlay({ className, ...props }) {
  return (
    <P.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className
      )}
      {...props}
    />
  );
}

function DialogContent({ className, children, showClose = true, ...props }) {
  return (
    <P.Portal>
      <DialogOverlay />
      <P.Content
        className={cn(
          'fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-2xl border bg-card p-6 shadow-lift duration-200',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          className
        )}
        {...props}
      >
        {children}
        {showClose && (
          <P.Close className="absolute top-4 right-4 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 outline-none">
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </P.Close>
        )}
      </P.Content>
    </P.Portal>
  );
}

/** Side drawer built on the same primitive (shadcn "Sheet"). */
function SheetContent({ className, children, side = 'left', ...props }) {
  return (
    <P.Portal>
      <DialogOverlay />
      <P.Content
        className={cn(
          'fixed inset-y-0 z-50 flex h-full w-72 max-w-[85vw] flex-col bg-card shadow-lift duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out',
          side === 'left'
            ? 'left-0 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left'
            : 'right-0 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
          className
        )}
        {...props}
      >
        {children}
      </P.Content>
    </P.Portal>
  );
}

function DialogHeader({ className, ...props }) {
  return <div className={cn('flex flex-col gap-1.5 pr-6', className)} {...props} />;
}

function DialogFooter({ className, ...props }) {
  return <div className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />;
}

function DialogTitle({ className, ...props }) {
  return <P.Title className={cn('text-lg leading-none font-semibold tracking-tight', className)} {...props} />;
}

function DialogDescription({ className, ...props }) {
  return <P.Description className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  SheetContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
