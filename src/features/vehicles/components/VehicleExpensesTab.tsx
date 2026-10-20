'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Paperclip } from 'lucide-react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorPanel } from '@/components/feedback/ErrorPanel';
import { TableRowsSkeleton } from '@/components/feedback/PageSkeleton';
import { TablePagination } from '@/components/tables/TablePagination';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ADMIN_ROUTES } from '@/constants/routes.constants';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { formatKm } from '@/features/vehicles/constants/vehicle.constants';
import { useVehicleExpenseSummary, useVehicleExpenses } from '@/features/vehicles/hooks/useVehicles';
import type { ExpenseStage } from '@/types/expense.types';
import type { VehicleExpenseFilters } from '@/types/vehicle.types';
import { formatMoney } from '@/utils/money.utils';

const STAGES: Record<ExpenseStage, { label: string; variant: 'warning' | 'secondary' | 'success' | 'destructive' }> = {
  pending: { label: 'Awaiting approval', variant: 'warning' },
  approved: { label: 'Approved', variant: 'secondary' },
  paid: { label: 'Paid', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'destructive' },
};

function Figure({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-border p-3.5">
      <div className="text-[13px] text-muted-foreground">{label}</div>
      <div className="mt-1 truncate text-lg font-semibold tabular-nums">{value}</div>
      {hint ? <div className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

/** Expense claims made for this vehicle, with what it has cost. */
export function VehicleExpensesTab({ vehicleId }: { vehicleId: number }) {
  const [filters, setFilters] = useState<VehicleExpenseFilters>({ page: 1, limit: 10 });
  const { data: summary, isLoading: summaryLoading } = useVehicleExpenseSummary(vehicleId);
  const { data, isLoading, isError, error, refetch } = useVehicleExpenses(vehicleId, filters);
  const items = data?.items ?? [];
  const yearTotal = summary ? summary.thisYear.amount + summary.manualServiceCostThisYear : 0;

  return (
    <>
      <div className="flex flex-col gap-4 p-4">
        {summaryLoading || !summary ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[84px] rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Figure label="This month" value={formatMoney(summary.thisMonth.amount)} hint={`${summary.thisMonth.count} approved claims`} />
              <Figure
                label="This year"
                value={formatMoney(yearTotal)}
                hint={
                  summary.manualServiceCostThisYear > 0
                    ? `${formatMoney(summary.thisYear.amount)} claims + ${formatMoney(summary.manualServiceCostThisYear)} services`
                    : `${summary.thisYear.count} approved claims`
                }
              />
              <Figure
                label="Cost per km"
                value={summary.costPerKm !== null ? formatMoney(summary.costPerKm) : '—'}
                hint={summary.kmThisYear ? `${formatKm(summary.kmThisYear)} driven this year` : 'Needs odometer readings'}
              />
              <Figure
                label="Awaiting approval"
                value={formatMoney(summary.pending.amount)}
                hint={`${summary.pending.count} claim${summary.pending.count === 1 ? '' : 's'} · all time ${formatMoney(summary.allTime.amount)}`}
              />
            </div>
            {summary.byCategory.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2 text-[13px]">
                <span className="text-muted-foreground">This year by category:</span>
                {summary.byCategory.map((c) => (
                  <Badge key={c.categoryName} variant="muted">
                    {c.categoryName} · {formatMoney(c.amount)}
                  </Badge>
                ))}
              </div>
            ) : null}
          </>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Select
            className="w-auto flex-[0_1_200px]"
            aria-label="Status"
            value={filters.stage ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, stage: e.target.value as ExpenseStage | '', page: 1 }))}
          >
            <option value="">All claims</option>
            {(Object.keys(STAGES) as ExpenseStage[]).map((s) => (
              <option key={s} value={s}>
                {STAGES[s].label}
              </option>
            ))}
          </Select>
          <p className="min-w-0 flex-1 text-[13px] text-muted-foreground">
            Employees pick the vehicle when they claim fuel or maintenance. Totals count approved and paid claims only.
          </p>
        </div>
      </div>

      <div className="border-t border-border">
        {isError ? (
          <div className="p-6">
            <ErrorPanel title="Failed to load expenses" message={error?.message ?? 'Something went wrong'} onRetry={() => refetch()} />
          </div>
        ) : isLoading ? (
          <TableRowsSkeleton rows={5} />
        ) : items.length === 0 ? (
          <div className="p-8">
            <EmptyState title="No expenses for this vehicle" description="Fuel and maintenance claims for this vehicle will show here." />
          </div>
        ) : (
          <Table className="min-w-[940px] animate-in fade-in-0 duration-300">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead className="text-right">Odometer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recorded as</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((x) => (
                <TableRow key={x.id}>
                  <TableCell className="whitespace-nowrap">{formatExpenseDate(x.date)}</TableCell>
                  <TableCell>
                    <Link href={`${ADMIN_ROUTES.EXPENSES}?claim=${x.id}`} className="font-medium hover:text-primary hover:underline">
                      {x.categoryName} › {x.subSubCategoryName ?? x.subCategoryName}
                    </Link>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      Claim #{x.id}
                      {x.hasReceipt ? <Paperclip className="size-3" aria-label="Receipt attached" /> : null}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{x.employeeName ?? '—'}</TableCell>
                  <TableCell className="text-right whitespace-nowrap tabular-nums">
                    {x.odometerKm !== null ? formatKm(x.odometerKm) : '—'}
                  </TableCell>
                  <TableCell className="text-right font-medium whitespace-nowrap tabular-nums">{formatMoney(x.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={STAGES[x.stage].variant}>{STAGES[x.stage].label}</Badge>
                  </TableCell>
                  <TableCell className="text-[13px] whitespace-nowrap text-muted-foreground">
                    {x.serviceTypeName
                      ? `${x.serviceTypeName} record`
                      : x.stage === 'approved' || x.stage === 'paid'
                        ? x.odometerKm !== null
                          ? 'Odometer reading'
                          : '—'
                        : 'On approval'}
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
    </>
  );
}
