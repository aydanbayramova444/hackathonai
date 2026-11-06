import { NavLink } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApi } from '@/lib/api';
import { NAV_ITEMS, SECONDARY_NAV } from './nav';
import { Logo } from './Logo';

function NavItem({ item, count, onNavigate }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-card text-foreground shadow-card ring-1 ring-border'
            : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'absolute top-1/2 -left-3 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-gradient transition-opacity',
              isActive ? 'opacity-100' : 'opacity-0'
            )}
          />
          <Icon
            className={cn(
              'size-[18px] transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground/80 group-hover:text-foreground'
            )}
          />
          <span className="flex-1">{item.label}</span>
          {count > 0 && (
            <span
              className={cn(
                'min-w-6 rounded-full px-1.5 py-px text-center text-[11px] font-semibold tabular-nums',
                isActive ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              {count}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export function SidebarContent({ onNavigate }) {
  const { data: stats } = useApi('/stats');
  const totals = stats?.totals || {};

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Logo />
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">Workspace</div>
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} item={item} count={item.countKey ? totals[item.countKey] : 0} onNavigate={onNavigate} />
          ))}
        </div>
        <div className="mt-6 mb-2 px-3 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">General</div>
        <div className="space-y-1">
          {SECONDARY_NAV.map((item) => (
            <NavItem key={item.to} item={item} onNavigate={onNavigate} />
          ))}
        </div>
      </nav>

      <div className="p-3">
        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-4">
          <div className="absolute -top-6 -right-6 size-20 rounded-full bg-violet-200/40 blur-2xl" />
          <Sparkles className="size-4 text-primary" />
          <p className="mt-2 text-[13px] font-semibold">Your HR workflow.</p>
          <p className="text-brand-gradient text-[13px] font-semibold">Simplified.</p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {totals.active_candidates ?? '–'} candidates in progress across {totals.active_vacancies ?? '–'} open roles.
          </p>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar lg:block">
      <SidebarContent />
    </aside>
  );
}
