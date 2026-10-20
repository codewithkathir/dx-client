'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Banknote, FileText, HandCoins, Plus, Search, Undo2, Wallet } from 'lucide-react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { TableRowsSkeleton } from '@/components/feedback/PageSkeleton';
import { StatCard, StatCardsSkeleton } from '@/components/shared/MoneySummaryCards';
import { PageHeader } from '@/components/shared/PageHeader';
import { TablePagination } from '@/components/tables/TablePagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ADMIN_ROUTES } from '@/constants/routes.constants';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { AccountEntryDialog, type AccountEntryKind } from '@/features/employee-accounts/components/AccountEntryDialog';
import { useEmployeeAccounts, useEmployeeAccountsSummary } from '@/features/employee-accounts/hooks/useEmployeeAccounts';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import type { AccountListFilters, AccountListShow, EmployeeAccount } from '@/types/employee-account.types';
import { formatMoney } from '@/utils/money.utils';

const SHOW_OPTIONS: Array<{ value: AccountListShow; label: string }> = [
  { value: 'active', label: 'With a balance or owed' },
  { value: 'holding', label: 'Holding an advance' },
  { value: 'owed', label: 'Owed reimbursement' },
  { value: 'all', label: 'All employees' },
];

/** Advances given to employees, what they still hold, and what the company owes them. */
export function EmployeeAccountsPageContent() {
  const [filters, setFilters] = useState<AccountListFilters>({ page: 1, limit: 10, show: 'active', sortBy: 'balance', order: 'desc' });
  const [searchInput, setSearchInput] = useState('');
  const [dialog, setDialog] = useState<{ kind: AccountEntryKind; account?: EmployeeAccount } | null>(null);

  const debouncedSearch = useDebounce(searchInput);
  const [pagedSearch, setPagedSearch] = useState(debouncedSearch);
  if (debouncedSearch !== pagedSearch) {
    setPagedSearch(debouncedSearch);
    setFilters((f) => ({ ...f, page: 1 }));
  }

  const { data, isLoading, isError, error, refetch } = useEmployeeAccounts({ ...filters, search: debouncedSearch || undefined });
  const { data: summary, isLoading: summaryLoading } = useEmployeeAccountsSummary();
  const items = data?.items ?? [];

  return (
    <section className="space-y-5">
      <PageHeader
        title="Employee Accounts"
        description="Advances given to employees. Approved claims are paid from them first; only the rest is reimbursed."
        actions={
          <Button size="lg" onClick={() => setDialog({ kind: 'advance' })}>
            <Plus className="size-4" />
            Give advance
          </Button>
        }
      />

      {summaryLoading || !summary ? (
        <StatCardsSkeleton />
      ) : (
        <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Advances outstanding"
            value={formatMoney(summary.totalOutstanding)}
            hint={`Held by ${summary.employeesHolding} employee${summary.employeesHolding === 1 ? '' : 's'}`}
            icon={Wallet}
            tone="outstanding"
            iconColor="blue"
            iconTile
          />
          <StatCard label="Given this month" value={formatMoney(summary.advancedThisMonth)} hint="New advances and top-ups" icon={Banknote} iconTile />
          <StatCard
            label="Returned this month"
            value={formatMoney(summary.returnedThisMonth)}
            hint="Unused cash handed back"
            icon={Undo2}
            tone="settled"
            iconTile
          />
          <StatCard
            label="Owed to employees"
            value={formatMoney(summary.owedToEmployees)}
            hint="Open reimbursement bills"
            icon={HandCoins}
            tone={summary.owedToEmployees > 0 ? 'pending' : 'plain'}
            iconTile
          />
        </section>
      )}

      <Card className="gap-0 py-0" aria-label="Employee accounts">
        <div className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-0 flex-[2_1_260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              type="search"
              className="pl-9"
              placeholder="Search employee name or code…"
              aria-label="Search employees"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Select
            className="w-auto flex-[0_1_220px]"
            aria-label="Show"
            value={filters.show}
            onChange={(e) => setFilters((f) => ({ ...f, show: e.target.value as AccountListShow, page: 1 }))}
          >
            {SHOW_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="border-t border-border">
          {isError ? (
            <div className="p-6">
              <ErrorPanel title="Failed to load accounts" message={error?.message ?? 'Something went wrong'} onRetry={() => refetch()} />
            </div>
          ) : isLoading ? (
            <TableRowsSkeleton rows={6} />
          ) : items.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title={filters.show === 'all' ? 'No employees' : 'No open balances'}
                description="Give an advance to an employee and it shows here, with their claims drawing it down."
              />
            </div>
          ) : (
            <Table className="min-w-[900px] animate-in fade-in-0 duration-300">
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead className="text-right">Advance balance</TableHead>
                  <TableHead className="text-right">Pending claims</TableHead>
                  <TableHead className="text-right">Owed to them</TableHead>
                  <TableHead>Last activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((a) => (
                  <TableRow key={a.employeeId}>
                    <TableCell>
                      <Link href={ADMIN_ROUTES.EMPLOYEE_ACCOUNT_DETAIL(a.employeeId)} className="font-medium hover:text-primary hover:underline">
                        {a.employeeName}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {a.employeeCode ?? '—'}
                        {a.employeeStatus !== 'active' ? ` · ${a.employeeStatus}` : ''}
                      </div>
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-semibold whitespace-nowrap tabular-nums',
                        a.balance > 0 ? 'text-status-success-ink' : 'text-muted-foreground',
                      )}
                    >
                      {formatMoney(a.balance)}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap tabular-nums">
                      {a.pendingClaims.count > 0 ? (
                        <>
                          {formatMoney(a.pendingClaims.amount)}
                          <div className="text-xs text-muted-foreground">
                            {a.pendingClaims.count} claim{a.pendingClaims.count === 1 ? '' : 's'}
                          </div>
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell
                      className={cn('text-right whitespace-nowrap tabular-nums', a.owedToEmployee > 0 ? 'font-medium text-destructive' : 'text-muted-foreground')}
                    >
                      {a.owedToEmployee > 0 ? formatMoney(a.owedToEmployee) : '—'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{a.lastActivity ? formatExpenseDate(a.lastActivity) : '—'}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="outline" size="sm" onClick={() => setDialog({ kind: 'advance', account: a })} disabled={a.employeeStatus !== 'active'}>
                          Give advance
                        </Button>
                        {a.balance > 0 ? (
                          <Button variant="outline" size="sm" onClick={() => setDialog({ kind: 'return', account: a })}>
                            Return
                          </Button>
                        ) : null}
                        <Button variant="ghost" size="sm" render={<Link href={ADMIN_ROUTES.EMPLOYEE_ACCOUNT_DETAIL(a.employeeId)} />}>
                          <FileText className="size-4" />
                          Statement
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        {data?.meta && items.length > 0 ? (
          <TablePagination meta={data.meta} onPageChange={(page) => setFilters((f) => ({ ...f, page }))} />
        ) : null}
      </Card>

      <AccountEntryDialog
        key={dialog ? `${dialog.kind}-${dialog.account?.employeeId ?? 'pick'}` : 'none'}
        kind={dialog?.kind ?? null}
        account={dialog?.account}
        onClose={() => setDialog(null)}
      />
    </section>
  );
}
