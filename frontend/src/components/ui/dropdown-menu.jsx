import { DropdownMenu as P } from 'radix-ui';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const DropdownMenu = (props) => <P.Root data-slot="dropdown-menu" {...props} />;
const DropdownMenuTrigger = (props) => <P.Trigger data-slot="dropdown-menu-trigger" {...props} />;
const DropdownMenuGroup = (props) => <P.Group {...props} />;

function DropdownMenuContent({ className, sideOffset = 6, ...props }) {
  return (
    <P.Portal>
      <P.Content
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-[12rem] overflow-hidden rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-lift',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
          className
        )}
        {...props}
      />
    </P.Portal>
  );
}

function DropdownMenuItem({ className, inset, ...props }) {
  return (
    <P.Item
      className={cn(
        "relative flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm outline-none select-none transition-colors focus:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:text-muted-foreground",
        inset && 'pl-8',
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({ className, children, checked, ...props }) {
  return (
    <P.CheckboxItem
      checked={checked}
      className={cn('relative flex cursor-pointer items-center gap-2 rounded-md py-1.5 pr-2 pl-8 text-sm outline-none select-none focus:bg-muted', className)}
      {...props}
    >
      <span className="absolute left-2 flex size-4 items-center justify-center">
        <P.ItemIndicator>
          <CheckIcon className="size-4 text-primary" />
        </P.ItemIndicator>
      </span>
      {children}
    </P.CheckboxItem>
  );
}

function DropdownMenuLabel({ className, ...props }) {
  return <P.Label className={cn('px-2 py-1.5 text-xs font-medium text-muted-foreground', className)} {...props} />;
}

function DropdownMenuSeparator({ className, ...props }) {
  return <P.Separator className={cn('-mx-1.5 my-1.5 h-px bg-border', className)} {...props} />;
}

function DropdownMenuShortcut({ className, ...props }) {
  return <span className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)} {...props} />;
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
};
