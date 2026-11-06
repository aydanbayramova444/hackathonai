import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CornerDownLeft, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { STAGE_STYLES } from '@/lib/constants';
import { Avatar } from '@/components/ui/misc';
import { ALL_PAGES } from './nav';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

export function GlobalSearch({ className }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [active, setActive] = useState(0);

  // ⌘K / Ctrl+K focuses search
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Debounced candidate search
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setCandidates([]);
      return;
    }
    const t = setTimeout(() => {
      api.get(`/candidates?search=${encodeURIComponent(q)}`).then((rows) => setCandidates(rows.slice(0, 6))).catch(() => {});
    }, 150);
    return () => clearTimeout(t);
  }, [query]);

  const pages = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? ALL_PAGES.filter((p) => p.label.toLowerCase().includes(q)) : ALL_PAGES.slice(0, 6);
  }, [query]);

  const results = useMemo(
    () => [
      ...candidates.map((c) => ({ kind: 'candidate', key: `c${c.id}`, item: c, go: () => navigate(`/candidates?candidate=${c.id}`) })),
      ...pages.map((p) => ({ kind: 'page', key: p.to, item: p, go: () => navigate(p.to) })),
    ],
    [candidates, pages, navigate]
  );

  useEffect(() => {
    setActive(0);
  }, [query]);

  const choose = (r) => {
    r.go();
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  let index = -1;
  const row = (r, content) => {
    index += 1;
    const i = index;
    return (
      <button
        key={r.key}
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => choose(r)}
        onMouseEnter={() => setActive(i)}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
          active === i ? 'bg-muted' : ''
        )}
      >
        {content}
        {active === i && <CornerDownLeft className="ml-auto size-3.5 text-muted-foreground" />}
      </button>
    );
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
        placeholder="Search candidates, pages…"
        aria-label="Search"
        className="h-9 w-full rounded-lg border border-transparent bg-muted/70 pr-14 pl-9 text-sm transition-all outline-none placeholder:text-muted-foreground/80 hover:bg-muted focus:border-ring focus:bg-card focus:ring-[3px] focus:ring-ring/20"
      />
      <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border bg-card px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground sm:block">
        {isMac ? '⌘' : 'Ctrl'} K
      </kbd>

      {open && (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 animate-in fade-in-0 zoom-in-95 overflow-hidden rounded-xl border bg-popover p-1.5 shadow-lift">
          {candidates.length > 0 && (
            <>
              <div className="px-2.5 pt-1.5 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">Candidates</div>
              {results
                .filter((r) => r.kind === 'candidate')
                .map((r) =>
                  row(
                    r,
                    <>
                      <Avatar name={r.item.name} className="size-7" />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{r.item.name}</div>
                        <div className="truncate text-xs text-muted-foreground">{r.item.vacancy_title || 'Unassigned'}</div>
                      </div>
                      <span className={cn('ml-2 rounded px-1.5 py-px text-[11px] font-medium ring-1 ring-inset', STAGE_STYLES[r.item.stage]?.badge)}>
                        {r.item.stage}
                      </span>
                    </>
                  )
                )}
            </>
          )}
          {pages.length > 0 && (
            <>
              <div className="px-2.5 pt-1.5 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">Go to</div>
              {results
                .filter((r) => r.kind === 'page')
                .map((r) => {
                  const Icon = r.item.icon || FileText;
                  return row(
                    r,
                    <>
                      <span className="flex size-7 items-center justify-center rounded-md border bg-card">
                        <Icon className="size-3.5 text-muted-foreground" />
                      </span>
                      <span className="font-medium">{r.item.label}</span>
                    </>
                  );
                })}
            </>
          )}
          {results.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">No results for “{query}”</div>
          )}
        </div>
      )}
    </div>
  );
}
