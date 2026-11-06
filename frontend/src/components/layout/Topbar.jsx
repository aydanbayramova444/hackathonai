import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Bell,
  Menu,
  ChevronsUpDown,
  Check,
  Plus,
  Settings,
  LifeBuoy,
  RotateCcw,
  LogOut,
  CheckCheck,
} from 'lucide-react';
import { api, useApi } from '@/lib/api';
import { ACTIVITY_ICONS } from '@/lib/activity';
import { cn, timeAgo } from '@/lib/utils';
import { COMPANY } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/misc';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Dialog, SheetContent, DialogTitle } from '@/components/ui/dialog';
import { SidebarContent } from './Sidebar';
import { GlobalSearch } from './GlobalSearch';

const SEEN_KEY = 'hireflow:notifications-seen';
const readSeen = () => {
  try {
    return localStorage.getItem(SEEN_KEY) || '';
  } catch {
    return '';
  }
};

function WorkspaceSelector() {
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/40">
          <span className="flex size-7 items-center justify-center rounded-md bg-slate-900 text-[11px] font-bold text-white">BW</span>
          <span className="hidden leading-tight md:block">
            <span className="block text-[13px] font-semibold">{COMPANY}</span>
            <span className="block text-[11px] text-muted-foreground">Pro plan · 12 members</span>
          </span>
          <ChevronsUpDown className="size-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuItem>
          <span className="flex size-6 items-center justify-center rounded bg-slate-900 text-[10px] font-bold text-white">BW</span>
          <span className="flex-1 font-medium">{COMPANY}</span>
          <Check className="size-4 text-primary!" />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate('/settings')}>
          <Settings /> Workspace settings
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Plus /> Create workspace
          <span className="ml-auto rounded bg-muted px-1.5 text-[10px] font-medium">Soon</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Notifications() {
  const { data: activity } = useApi('/activity?limit=8');
  const [seen, setSeen] = useState(readSeen);
  const unread = (activity || []).filter((a) => a.created_at > seen).length;

  const markAllRead = () => {
    const latest = activity?.[0]?.created_at || new Date().toISOString();
    setSeen(latest);
    try {
      localStorage.setItem(SEEN_KEY, latest);
    } catch {
      /* storage unavailable */
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground" aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}>
          <Bell className="size-[18px]" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-brand-gradient text-[9px] font-bold text-white ring-2 ring-card">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <div className="text-sm font-semibold">Notifications</div>
            <div className="text-xs text-muted-foreground">{unread ? `${unread} unread` : 'You’re all caught up'}</div>
          </div>
          <Button variant="ghost" size="sm" onClick={markAllRead} disabled={!unread}>
            <CheckCheck /> Mark all read
          </Button>
        </div>
        <div className="scrollbar-thin max-h-96 overflow-y-auto p-1.5">
          {(activity || []).map((a) => {
            const meta = ACTIVITY_ICONS[a.type] || ACTIVITY_ICONS.candidate;
            const Icon = meta.icon;
            const isUnread = a.created_at > seen;
            return (
              <DropdownMenuItem key={a.id} className="items-start gap-3 px-2.5 py-2.5">
                <span className={cn('mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md', meta.tone)}>
                  <Icon className="size-3.5 text-current!" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-[13px] leading-snug', isUnread ? 'font-medium text-foreground' : 'text-muted-foreground')}>{a.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(a.created_at)}</p>
                </div>
                {isUnread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu() {
  const navigate = useNavigate();
  const resetDemo = async () => {
    try {
      await api.post('/reset');
      toast.success('Demo data restored', { description: 'The workspace is back to its original sample data.' });
    } catch (e) {
      toast.error('Could not reset demo data', { description: e.message });
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2.5 rounded-lg p-1 transition-colors outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/40 sm:pr-2.5">
          <Avatar name="HR Team" className="size-8 ring-2 ring-card" />
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-[13px] font-semibold">HR Team</span>
            <span className="block text-[11px] text-muted-foreground">People Operations</span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="text-sm font-semibold text-foreground">HR Team</div>
          <div className="text-xs">hr@brightwave.example</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate('/settings')}>
          <Settings /> Settings
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={resetDemo}>
          <RotateCcw /> Reset demo data
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast('Help center', { description: 'Documentation is coming soon.' })}>
          <LifeBuoy /> Help & support
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Topbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md sm:gap-3 sm:px-6">
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <Button variant="ghost" size="icon" className="-ml-1 lg:hidden" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
          <Menu className="size-5" />
        </Button>
        <SheetContent side="left" aria-describedby={undefined}>
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Dialog>

      <WorkspaceSelector />
      <div className="hidden h-6 w-px bg-border md:block" />
      <GlobalSearch className="max-w-md flex-1" />

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <Notifications />
        <UserMenu />
      </div>
    </header>
  );
}
