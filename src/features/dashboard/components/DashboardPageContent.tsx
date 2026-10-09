'use client';

import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, Download, HandCoins, Plus, TriangleAlert } from 'lucide-react';

import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { StatCard, StatCardsSkeleton } from '@/components/shared/MoneySummaryCards';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ADMIN_ROUTES } from '@/constants/routes.constants';
import { CashFlowChart } from '@/features/dashboard/components/CashFlowChart';
import { useDashboardOverview } from '@/features/dashboard/hooks/useDashboard';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { BillStatusBadge } from '@/features/payables/components/BillStatusBadge';
import { InvoiceStatusBadge } from '@/features/receivables/components/InvoiceStatusBadge';
import type { BillStatus, InvoiceStatus } from '@/types/finance.types';
import type { DashboardOverview, SettledFigure } from '@/types/dashboard.types';
import { downloadCsv } from '@/utils/csv.utils';
import { formatMoney } from '@/utils/money.utils';

const monthName = (month: string, opts: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' }) =>
  new Date(`${month}-01T00:00:00`).toLocaleDateString('en-US', opts);

const previousMonth = (month: string) => {
  const d = new Date(`${month}-01T00:00:00`);
  d.setMonth(d.getMonth() - 1);
  return d.toLocaleDateString('en-US', { month: 'long' });
};

/** "up 12% on September" — omitted when there is nothing to compare with. */
function changeHint(figure: SettledFigure, month: string): string | null {
  if (figure.previousAmount <= 0) return null;
  const pct = Math.round(((figure.amount - figure.previousAmount) / figure.previousAmount) * 100);
  if (pct === 0) return `same as ${previousMonth(month)}`;
  return `${pct > 0 ? 'up' : 'down'} ${Math.abs(pct)}% on ${previousMonth(month)}`;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

function exportDashboard(data: DashboardOverview) {
  const rows: Array<Array<string | number | null>> = [['DX dashboard', monthName(data.month)], []];
  if (data.received) rows.push(['Received this month (AED)', data.received.amount]);
  if (data.paid) rows.push(['Paid this month (AED)', data.paid.amount]);
  if (data.owedToUs) rows.push(['Owed to us (AED)', data.owedToUs.amount]);
  if (data.overdueBills) rows.push(['Overdue bills (AED)', data.overdueBills.amount]);
  if (data.cashFlow.length > 0) {
    rows.push([], ['Month', 'Money in (AED)', 'Money out (AED)']);
    for (const m of data.cashFlow) rows.push([m.month, m.moneyIn, m.moneyOut]);
  }
  if (data.dueSoon.length > 0) {
    rows.push([], ['Document', 'Party', 'Type', 'Due date', 'Status', 'Balance (AED)']);
    for (const d of data.dueSoon) {
      rows.push([d.number, d.partyName, d.type, d.dueDate, d.isOverdue ? 'overdue' : d.status, d.balance]);
    }
  }
  downloadCsv(`dx-dashboard-${data.month}.csv`, rows);
}

export function DashboardPageContent() {
  const { data, isLoading, isError, error, refetch } = useDashboardOverview();
  const month = data?.month ?? new Date().toISOString().slice(0, 7);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Cash position for ${monthName(month)}, what is due soon and what needs your approval.`}
        actions={
          <>
            <Button variant="outline" size="lg" disabled={!data} onClick={() => data && exportDashboard(data)}>
              <Download className="size-4" />
              Export
            </Button>
            <Button size="lg" render={<Link href={`${ADMIN_ROUTES.PAYABLES}?new=1`} />}>
              <Plus className="size-4" />
              New bill
            </Button>
          </>
        }
      />

      {isError ? (
        <ErrorPanel title="Failed to load the dashboard" message={error?.message ?? 'Something went wrong'} onRetry={() => refetch()} />
      ) : null}

      {isLoading || !data ? (
        <StatCardsSkeleton />
      ) : (
        <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.received ? (
            <StatCard
              label="Received this month"
              value={formatMoney(data.received.amount)}
              hint={[plural(data.received.count, 'invoice') + ' paid', changeHint(data.received, month)].filter(Boolean).join(' · ')}
              icon={ArrowDownLeft}
              tone="settled"
              toneValue
            />
          ) : null}
          {data.paid ? (
            <StatCard
              label="Paid this month"
              value={formatMoney(data.paid.amount)}
              hint={`${plural(data.paid.count, 'bill')} and reimbursements`}
              icon={ArrowUpRight}
              tone="outstanding"
              iconColor="blue"
            />
          ) : null}
          {data.owedToUs ? (
            <StatCard
              label="Owed to us"
              value={formatMoney(data.owedToUs.amount)}
              hint={plural(data.owedToUs.count, 'open invoice')}
              icon={HandCoins}
            />
          ) : null}
          {data.overdueBills ? (
            <StatCard
              label="Overdue bills"
              value={formatMoney(data.overdueBills.amount)}
              hint={`${data.overdueBills.count} past due date`}
              icon={TriangleAlert}
              tone={data.overdueBills.count > 0 ? 'overdue' : 'plain'}
              toneValue={data.overdueBills.count > 0}
            />
          ) : null}
        </section>
      )}

      <div className="flex flex-wrap items-stretch gap-4">
        {isLoading || (data && data.cashFlow.length > 0) ? (
          <Card className="min-w-0 flex-[2_1_520px] gap-4 py-5">
            <div className="px-5">
              <h2 className="text-base font-semibold">Cash flow</h2>
              <p className="mt-0.5 text-[13px] text-muted-foreground">Money in and out, last 6 months</p>
            </div>
            <div className="px-5">
              {data ? <CashFlowChart months={data.cashFlow} /> : <Skeleton className="h-[240px] w-full" />}
            </div>
          </Card>
        ) : null}

        {isLoading || data?.pendingApprovals ? (
          <Card className="min-w-0 flex-[1_1_320px] gap-3 py-5">
            <div className="flex items-center justify-between px-5">
              <h2 className="text-base font-semibold">Waiting for your approval</h2>
              {data?.pendingApprovals && data.pendingApprovals.count > 0 ? (
                <Link href={ADMIN_ROUTES.EXPENSES_REVIEW} className="text-[13px] font-medium text-primary hover:underline">
                  View all {data.pendingApprovals.count}
                </Link>
              ) : null}
            </div>
            {!data?.pendingApprovals ? (
              <div className="space-y-2 px-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : data.pendingApprovals.items.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-muted-foreground">No claims are waiting. You&apos;re all caught up.</p>
            ) : (
              <ul className="flex-1">
                {data.pendingApprovals.items.map((claim) => (
                  <li key={claim.id} className="border-t border-border">
                    <Link
                      href={`${ADMIN_ROUTES.EXPENSES_REVIEW}?claim=${claim.id}`}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-[13px] font-semibold text-sidebar-foreground">
                        {initials(claim.employeeName)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{claim.description ?? 'Expense claim'}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {[claim.employeeName, claim.categoryName, formatExpenseDate(claim.date)].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                      <span className="text-sm font-semibold tabular-nums">{formatMoney(claim.amount)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {data?.pendingApprovals && data.pendingApprovals.count > 0 ? (
              <div className="px-5">
                <Button variant="secondary" className="h-10 w-full" render={<Link href={ADMIN_ROUTES.EXPENSES_REVIEW} />}>
                  Review claims
                </Button>
              </div>
            ) : null}
          </Card>
        ) : null}
      </div>

      {data && (data.dueSoon.length > 0 || data.overdueBills || data.owedToUs) ? (
        <Card className="gap-3 pt-5 pb-0">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5">
            <div>
              <h2 className="text-base font-semibold">Due in the next 14 days</h2>
              <p className="mt-0.5 text-[13px] text-muted-foreground">Bills to pay and invoices to collect, including overdue ones</p>
            </div>
            <Link href={ADMIN_ROUTES.PAYABLES} className="text-[13px] font-medium text-primary hover:underline">
              Open payables
            </Link>
          </div>
          {data.dueSoon.length === 0 ? (
            <p className="border-t border-border px-5 py-8 text-center text-sm text-muted-foreground">Nothing is due in the next 14 days.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-y border-border bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="h-11 px-3 first:pl-5">Document</th>
                    <th className="px-3">Party</th>
                    <th className="px-3">Type</th>
                    <th className="px-3">Due</th>
                    <th className="px-3">Status</th>
                    <th className="px-3 pr-5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dueSoon.map((doc) => {
                    const href =
                      doc.type === 'bill' ? `${ADMIN_ROUTES.PAYABLES}?bill=${doc.id}` : `${ADMIN_ROUTES.RECEIVABLES}?invoice=${doc.id}`;
                    return (
                      <tr key={`${doc.type}-${doc.id}`} className="border-b border-border transition-colors last:border-0 hover:bg-muted/50">
                        <td className="px-3 py-3 pl-5 font-medium">
                          <Link href={href} className="hover:text-primary hover:underline">
                            {doc.number}
                          </Link>
                        </td>
                        <td className="px-3 py-3">{doc.partyName ?? '—'}</td>
                        <td className="px-3 py-3">{doc.type === 'bill' ? 'Bill' : 'Invoice'}</td>
                        <td className={`px-3 py-3 whitespace-nowrap ${doc.isOverdue ? 'font-medium text-destructive' : ''}`}>
                          {formatExpenseDate(doc.dueDate)}
                        </td>
                        <td className="px-3 py-3">
                          {doc.type === 'bill' ? (
                            <BillStatusBadge bill={{ status: doc.status as BillStatus, isOverdue: doc.isOverdue }} />
                          ) : (
                            <InvoiceStatusBadge invoice={{ status: doc.status as InvoiceStatus, isOverdue: doc.isOverdue }} />
                          )}
                        </td>
                        <td
                          className={`px-3 py-3 pr-5 text-right tabular-nums ${doc.type === 'invoice' ? 'text-status-success-ink' : ''}`}
                        >
                          {doc.type === 'invoice' ? `+ ${formatMoney(doc.balance)}` : formatMoney(doc.balance)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : null}
    </section>
  );
}
