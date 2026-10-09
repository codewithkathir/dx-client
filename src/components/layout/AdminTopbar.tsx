'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Building, ClipboardCheck, FileText, Landmark, Menu, Receipt, Search, TriangleAlert, User, Users, type LucideIcon } from 'lucide-react';

import { ADMIN_NAV } from '@/components/layout/AdminSidebar';
import { ADMIN_ROUTES } from '@/constants/routes.constants';
import { useDashboardAlerts, useGlobalSearch } from '@/features/dashboard/hooks/useDashboard';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import type { SearchResult, SearchResultType } from '@/types/dashboard.types';

const RESULT_META: Record<SearchResultType, { label: string; icon: LucideIcon; href: (r: SearchResult) => string }> = {
  employee: { label: 'Employees', icon: User, href: (r) => `${ADMIN_ROUTES.EMPLOYEES}?search=${encodeURIComponent(r.title)}` },
  expense: { label: 'Expense claims', icon: Receipt, href: (r) => `${ADMIN_ROUTES.EXPENSES}?search=${encodeURIComponent(r.title)}` },
  bill: { label: 'Bills', icon: FileText, href: (r) => `${ADMIN_ROUTES.PAYABLES}?bill=${r.id}` },
  invoice: { label: 'Invoices', icon: Landmark, href: (r) => `${ADMIN_ROUTES.RECEIVABLES}?invoice=${r.id}` },
  supplier: { label: 'Suppliers', icon: Building, href: (r) => `${ADMIN_ROUTES.SUPPLIERS}?search=${encodeURIComponent(r.title)}` },
  customer: { label: 'Customers', icon: Users, href: (r) => `${ADMIN_ROUTES.CUSTOMERS}?search=${encodeURIComponent(r.title)}` },
};

/** Closes a popover on outside click or Escape. */
function useDismiss(open: boolean, onClose: () => void, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, ref]);
}

function GlobalSearch() {
  const router = useRouter();
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const debounced = useDebounce(term);
  const { data: results = [], isFetching } = useGlobalSearch(debounced);
  useDismiss(open, () => setOpen(false), containerRef);

  const go = (result: SearchResult) => {
    setOpen(false);
    setTerm('');
    router.push(RESULT_META[result.type].href(result));
  };

  const groups = (Object.keys(RESULT_META) as SearchResultType[])
    .map((type) => ({ type, items: results.filter((r) => r.type === type) }))
    .filter((g) => g.items.length > 0);
  const showPanel = open && debounced.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative ml-auto w-full max-w-[360px] min-w-0">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <input
        type="search"
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results[0]) go(results[0]);
        }}
        placeholder="Search bills, invoices, people…"
        aria-label="Search"
        aria-expanded={showPanel}
        aria-controls={listId}
        className="h-9 w-full rounded-[10px] border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
      />
      {showPanel ? (
        <div
          id={listId}
          className="absolute right-0 left-0 top-11 z-40 max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-md"
        >
          {groups.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {isFetching ? 'Searching…' : `No results for “${debounced.trim()}”`}
            </p>
          ) : (
            groups.map(({ type, items }) => {
              const { label, icon: Icon } = RESULT_META[type];
              return (
                <div key={type} className="py-1">
                  <p className="px-3 pb-1 pt-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
                  {items.map((r) => (
                    <button
                      key={`${type}-${r.id}`}
                      type="button"
                      onClick={() => go(r)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                    >
                      <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{r.title}</span>
                        {r.subtitle ? <span className="block truncate text-xs text-muted-foreground">{r.subtitle}</span> : null}
                      </span>
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}

function Notifications() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: alerts } = useDashboardAlerts();
  useDismiss(open, () => setOpen(false), ref);

  const items = [
    {
      count: alerts?.pendingClaims ?? 0,
      label: 'expense claims awaiting approval',
      href: ADMIN_ROUTES.EXPENSES_REVIEW,
      icon: ClipboardCheck,
      tone: 'text-status-warning-ink',
    },
    {
      count: alerts?.overdueBills ?? 0,
      label: 'overdue bills to pay',
      href: `${ADMIN_ROUTES.PAYABLES}?status=overdue`,
      icon: TriangleAlert,
      tone: 'text-destructive',
    },
    {
      count: alerts?.overdueInvoices ?? 0,
      label: 'overdue invoices to collect',
      href: `${ADMIN_ROUTES.RECEIVABLES}?status=overdue`,
      icon: TriangleAlert,
      tone: 'text-destructive',
    },
  ].filter((i) => i.count > 0);
  const total = items.reduce((sum, i) => sum + i.count, 0);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={total > 0 ? `Notifications, ${total} need attention` : 'Notifications'}
        aria-expanded={open}
        className="relative flex size-10 items-center justify-center rounded-[10px] text-sidebar-foreground transition-colors hover:bg-muted"
      >
        <Bell className="size-5" aria-hidden />
        {total > 0 ? (
          <span className="absolute right-[9px] top-2 size-2 rounded-full border-2 border-card bg-destructive" aria-hidden />
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-40 w-80 rounded-xl border border-border bg-popover p-1.5 shadow-md">
          <p className="px-3 pb-1 pt-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Needs attention</p>
          {items.length === 0 ? (
            <p className="px-3 py-5 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
          ) : (
            items.map(({ count, label, href, icon: Icon, tone }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-muted"
              >
                <Icon className={cn('size-4 shrink-0', tone)} aria-hidden />
                <span>
                  <span className="font-semibold tabular-nums">{count}</span> {label}
                </span>
              </Link>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

interface AdminTopbarProps {
  onOpenMenu: () => void;
}

export function AdminTopbar({ onOpenMenu }: AdminTopbarProps) {
  const pathname = usePathname();
  const section = ADMIN_NAV.find((item) => pathname.startsWith(item.href));
  const crumb =
    pathname.startsWith(ADMIN_ROUTES.EXPENSES_REVIEW) ? 'Expenses · Review' : section?.label ?? 'Admin';

  return (
    <header className="flex h-[72px] shrink-0 items-center gap-4 border-b border-sidebar-border bg-card px-4 text-foreground sm:px-8">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open menu"
        className="flex size-10 items-center justify-center rounded-[10px] text-sidebar-foreground hover:bg-muted lg:hidden"
      >
        <Menu className="size-5" aria-hidden />
      </button>
      <nav aria-label="Breadcrumb" className="hidden items-center gap-2 text-sm whitespace-nowrap text-muted-foreground sm:flex">
        <Link href={ADMIN_ROUTES.DASHBOARD} className="hover:text-brand-blue-hover hover:underline">
          Admin
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-foreground" aria-current="page">
          {crumb}
        </span>
      </nav>
      <GlobalSearch />
      <Notifications />
    </header>
  );
}
