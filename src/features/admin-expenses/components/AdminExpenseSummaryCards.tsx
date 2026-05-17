import { CheckCircle2, Clock, Receipt, XCircle } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ADMIN_EXPENSE_STATUS_LABELS } from '@/features/admin-expenses/constants/admin-expense.constants';
import { formatExpenseAmount } from '@/features/expenses/utils/expense.utils';
import type { AdminExpenseSummary, AdminExpenseStatus } from '@/types/expense.types';
import { cn } from '@/lib/utils';

interface AdminExpenseSummaryCardsProps {
  summary: AdminExpenseSummary | undefined;
  isLoading: boolean;
}

const STATUS_ICONS: Record<AdminExpenseStatus, typeof Clock> = {
  pending: Clock,
  paid: CheckCircle2,
  rejected: XCircle,
};

const STATUS_ACCENT: Record<AdminExpenseStatus, string> = {
  pending: 'border-amber-500/30 bg-amber-500/5',
  paid: 'border-emerald-500/30 bg-emerald-500/5',
  rejected: 'border-destructive/30 bg-destructive/5',
};

function getStatusCount(summary: AdminExpenseSummary, status: AdminExpenseStatus): number {
  return summary.byStatus.find((s) => s.adminStatus === status)?.count ?? 0;
}

function getStatusAmount(summary: AdminExpenseSummary, status: AdminExpenseStatus): number {
  return summary.byStatus.find((s) => s.adminStatus === status)?.amount ?? 0;
}

export function AdminExpenseSummaryCards({
  summary,
  isLoading,
}: AdminExpenseSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const statuses: AdminExpenseStatus[] = ['pending', 'paid', 'rejected'];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="border-border bg-gradient-to-br from-card to-muted/30 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total claims</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{summary.totalCount}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatExpenseAmount(summary.totalAmount)}
            </p>
          </div>
          <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
            <Receipt className="size-5" />
          </div>
        </div>
      </Card>

      {statuses.map((status) => {
        const Icon = STATUS_ICONS[status];
        const count = getStatusCount(summary, status);
        const amount = getStatusAmount(summary, status);

        return (
          <Card
            key={status}
            className={cn('border-border p-5 shadow-sm', STATUS_ACCENT[status])}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {ADMIN_EXPENSE_STATUS_LABELS[status]}
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">{count}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatExpenseAmount(amount)}
                </p>
              </div>
              <div className="rounded-lg bg-background/80 p-2.5 shadow-sm">
                <Icon className="size-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
