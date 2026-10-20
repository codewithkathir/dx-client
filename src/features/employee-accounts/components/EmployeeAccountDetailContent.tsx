'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Ban, Banknote, Clock, HandCoins, Plus, Scale, Undo2, Wallet } from 'lucide-react';

import { DatePicker } from '@/components/forms/DatePicker';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { TableRowsSkeleton } from '@/components/feedback/PageSkeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatCard, StatCardsSkeleton } from '@/components/shared/MoneySummaryCards';
import { TablePagination } from '@/components/tables/TablePagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { ADMIN_ROUTES } from '@/constants/routes.constants';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { AccountEntryDialog, type AccountEntryKind } from '@/features/employee-accounts/components/AccountEntryDialog';
import { ENTRY_TYPE_LABELS } from '@/features/employee-accounts/constants/employee-account.constants';
import { useAccountEntries, useAccountMutations, useEmployeeAccount } from '@/features/employee-accounts/hooks/useEmployeeAccounts';
import { cn } from '@/lib/utils';
import type { AccountEntry, AccountEntryFilters } from '@/types/employee-account.types';
import { formatMoney } from '@/utils/money.utils';

/** One employee's advance account: balance, what's pending, and the statement. */
export function EmployeeAccountDetailContent({ employeeId }: { employeeId: number }) {
  const [filters, setFilters] = useState<AccountEntryFilters>({ page: 1, limit: 20 });
  const [dialog, setDialog] = useState<AccountEntryKind | null>(null);
  const [voiding, setVoiding] = useState<AccountEntry | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const { data: account, isLoading, isError, error, refetch } = useEmployeeAccount(employeeId);
  const entries = useAccountEntries(employeeId, filters);
  const { voidEntry } = useAccountMutations();
  const items = entries.data?.items ?? [];

  if (isError) {
    return (
      <section className="space-y-5">
        <BackLink />
        <ErrorPanel title="Couldn't load this account" message={error?.message ?? 'Something went wrong'} onRetry={() => refetch()} />
      </section>
    );
  }

  const closeVoid = () => {
    setVoiding(null);
    setVoidReason('');
  };

  return (
    <section className="space-y-5">
      <BackLink />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          {account ? (
            <h1 className="text-2xl font-semibold tracking-tight">{account.employeeName}</h1>
          ) : (
            <Skeleton className="h-8 w-56" />
          )}
          <p className="text-sm text-muted-foreground">
            {account?.employeeCode ? `${account.employeeCode} · ` : ''}Advance account statement
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="lg" onClick={() => setDialog('adjustment')} disabled={!account}>
            <Scale className="size-4" />
            Adjust
          </Button>
          <Button variant="outline" size="lg" onClick={() => setDialog('return')} disabled={!account || account.balance <= 0}>
            <Undo2 className="size-4" />
            Record return
          </Button>
          <Button size="lg" onClick={() => setDialog('advance')} disabled={!account || account.employeeStatus !== 'active'}>
            <Plus className="size-4" />
            Give advance
          </Button>
        </div>
      </div>

      {isLoading || !account ? (
        <StatCardsSkeleton />
      ) : (
        <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Advance balance"
            value={formatMoney(account.balance)}
            hint="Company money the employee holds"
            icon={Wallet}
            tone="outstanding"
            iconColor="blue"
            iconTile
          />
          <StatCard
            label="Pending claims"
            value={formatMoney(account.pendingClaims.amount)}
            hint={
              account.pendingClaims.count === 0
                ? 'Nothing waiting'
                : account.pendingClaims.amount > account.balance
                  ? `${account.pendingClaims.count} claims · ${formatMoney(account.pendingClaims.amount - Math.max(account.balance, 0))} above the balance`
                  : `${account.pendingClaims.count} claims · covered by the balance`
            }
            icon={Clock}
            tone={account.pendingClaims.count ? 'pending' : 'plain'}
            iconTile
          />
          <StatCard
            label="Owed to employee"
            value={formatMoney(account.owedToEmployee)}
            hint="Open reimbursement bills"
            icon={HandCoins}
            tone={account.owedToEmployee > 0 ? 'overdue' : 'plain'}
            iconTile
          />
          <StatCard label="Total advanced" value={formatMoney(account.totalAdvanced)} hint="All advances given" icon={Banknote} iconTile />
        </section>
      )}

      <Card className="gap-0 py-0" aria-label="Statement">
        <div className="flex flex-wrap items-end gap-3 p-4">
          <div className="space-y-1.5">
            <Label htmlFor="stmt-from" className="text-[13px] text-muted-foreground">
              From
            </Label>
            <DatePicker
              id="stmt-from"
              placeholder="Start"
              clearable
              value={filters.dateFrom ?? ''}
              onChange={(v) => setFilters((f) => ({ ...f, dateFrom: v || undefined, page: 1 }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stmt-to" className="text-[13px] text-muted-foreground">
              To
            </Label>
            <DatePicker
              id="stmt-to"
              placeholder="Today"
              clearable
              min={filters.dateFrom}
              value={filters.dateTo ?? ''}
              onChange={(v) => setFilters((f) => ({ ...f, dateTo: v || undefined, page: 1 }))}
            />
          </div>
          <label className="flex h-9 items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={Boolean(filters.includeVoided)}
              onChange={(e) => setFilters((f) => ({ ...f, includeVoided: e.target.checked, page: 1 }))}
            />
            Show voided entries
          </label>
        </div>

        <div className="border-t border-border">
          {entries.isError ? (
            <div className="p-6">
              <ErrorPanel title="Failed to load the statement" message={entries.error?.message ?? 'Something went wrong'} onRetry={() => entries.refetch()} />
            </div>
          ) : entries.isLoading ? (
            <TableRowsSkeleton rows={6} />
          ) : items.length === 0 ? (
            <div className="p-8">
              <EmptyState title="No entries" description="Advances, returns and claims paid from the advance appear here." />
            </div>
          ) : (
            <Table className="min-w-[900px] animate-in fade-in-0 duration-300">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">In</TableHead>
                  <TableHead className="text-right">Out</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((e) => {
                  const voided = Boolean(e.voidedAt);
                  return (
                    <TableRow key={e.id} className={voided ? 'text-muted-foreground' : undefined}>
                      <TableCell className="whitespace-nowrap">{formatExpenseDate(e.entryDate)}</TableCell>
                      <TableCell className="max-w-[360px]">
                        <div className={cn('flex flex-wrap items-center gap-2 font-medium', voided && 'line-through')}>
                          <Badge variant={e.type === 'advance' ? 'success' : e.type === 'expense' ? 'secondary' : 'muted'}>{ENTRY_TYPE_LABELS[e.type]}</Badge>
                          {e.expenseId ? (
                            <Link href={`${ADMIN_ROUTES.EXPENSES}?claim=${e.expenseId}`} className="hover:text-primary hover:underline">
                              Claim #{e.expenseId}
                              {e.expenseLabel ? ` · ${e.expenseLabel}` : ''}
                            </Link>
                          ) : null}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {[
                            e.expenseAmount !== null && e.expenseAmount !== Math.abs(e.amount)
                              ? `${formatMoney(Math.abs(e.amount))} of ${formatMoney(e.expenseAmount)} claim; rest reimbursed`
                              : null,
                            e.paymentMethodName,
                            e.reference,
                            e.notes,
                            e.createdByName ? `by ${e.createdByName}` : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </div>
                        {voided ? (
                          <div className="mt-0.5 text-xs text-destructive">
                            Voided{e.voidedByName ? ` by ${e.voidedByName}` : ''}: {e.voidReason}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap tabular-nums text-status-success-ink">
                        {e.amount > 0 ? formatMoney(e.amount) : ''}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap tabular-nums">{e.amount < 0 ? formatMoney(-e.amount) : ''}</TableCell>
                      <TableCell className="text-right font-medium whitespace-nowrap tabular-nums">
                        {voided ? '—' : formatMoney(e.runningBalance)}
                      </TableCell>
                      <TableCell className="text-right">
                        {!voided && e.type !== 'expense' ? (
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setVoiding(e)}>
                            <Ban className="size-4" />
                            Void
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
        {entries.data?.meta && items.length > 0 ? (
          <TablePagination meta={entries.data.meta} onPageChange={(page) => setFilters((f) => ({ ...f, page }))} />
        ) : null}
      </Card>

      {account ? (
        <AccountEntryDialog
          key={dialog ?? 'none'}
          kind={dialog}
          account={{ employeeId: account.employeeId, employeeName: account.employeeName, balance: account.balance }}
          onClose={() => setDialog(null)}
        />
      ) : null}

      <ConfirmDialog
        open={voiding !== null}
        onOpenChange={(open) => !open && closeVoid()}
        variant="destructive"
        icon={Ban}
        title="Void entry"
        description={
          voiding
            ? `Void the ${ENTRY_TYPE_LABELS[voiding.type].toLowerCase()} of ${formatMoney(Math.abs(voiding.amount))} from ${formatExpenseDate(voiding.entryDate)}? It stays on the statement, crossed out.`
            : ''
        }
        confirmText="Void"
        confirmDisabled={voidReason.trim().length === 0}
        loading={voidEntry.isPending}
        onConfirm={() => voiding && voidEntry.mutate({ entryId: voiding.id, reason: voidReason.trim() }, { onSuccess: closeVoid })}
        onCancel={closeVoid}
      >
        <Label htmlFor="void-reason" className="mb-2">
          Reason
        </Label>
        <Textarea
          id="void-reason"
          value={voidReason}
          onChange={(e) => setVoidReason(e.target.value)}
          maxLength={255}
          placeholder="e.g. Entered twice"
          className="min-h-16"
          autoFocus
        />
      </ConfirmDialog>
    </section>
  );
}

function BackLink() {
  return (
    <Link
      href={ADMIN_ROUTES.EMPLOYEE_ACCOUNTS}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" aria-hidden />
      Employee Accounts
    </Link>
  );
}
