'use client';

import Link from 'next/link';
import { Banknote } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { ADMIN_ROUTES } from '@/constants/routes.constants';
import { useApprovalPreview } from '@/features/admin-expenses/hooks/useAdminExpenseQueries';
import { cn } from '@/lib/utils';
import type { Expense } from '@/types/expense.types';
import { formatMoney } from '@/utils/money.utils';

interface AdvanceSplitPreviewProps {
  expense: Expense;
  reimburseInFull: boolean;
  onReimburseInFullChange: (value: boolean) => void;
  className?: string;
}

/**
 * Before approving: how much of the claim the employee's advance covers and
 * what will be reimbursed via Payables. Hidden when the employee holds no advance.
 */
export function AdvanceSplitPreview({ expense, reimburseInFull, onReimburseInFullChange, className }: AdvanceSplitPreviewProps) {
  const { data: preview, isLoading } = useApprovalPreview(expense.id);
  if (isLoading) return <Skeleton className={cn('h-16 w-full rounded-xl', className)} />;
  if (!preview || preview.balanceBefore <= 0) return null;

  const fromAdvance = reimburseInFull ? 0 : preview.fromAdvance;
  const reimbursable = preview.amount - fromAdvance;

  return (
    <div className={cn('flex flex-col gap-2 rounded-xl border border-border bg-background p-3.5 text-[13px]', className)}>
      <div className="flex items-center gap-2 font-medium">
        <Banknote className="size-4 text-primary" aria-hidden />
        Advance balance {formatMoney(preview.balanceBefore)}
        <Link href={ADMIN_ROUTES.EMPLOYEE_ACCOUNT_DETAIL(expense.employeeId)} className="ml-auto font-normal text-primary hover:underline">
          Statement
        </Link>
      </div>
      <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
        <dt className="text-muted-foreground">From advance</dt>
        <dd className="text-right font-medium tabular-nums">{formatMoney(fromAdvance)}</dd>
        <dt className="text-muted-foreground">To reimburse (bill in Payables)</dt>
        <dd className="text-right font-medium tabular-nums">{formatMoney(reimbursable)}</dd>
        <dt className="text-muted-foreground">Balance after</dt>
        <dd className="text-right tabular-nums">{formatMoney(preview.balanceBefore - fromAdvance)}</dd>
      </dl>
      {!reimburseInFull && reimbursable === 0 ? (
        <p className="text-status-success-ink">Fully covered: the claim is settled on approval, no bill is created.</p>
      ) : null}
      <label className="flex items-start gap-2 text-muted-foreground">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={reimburseInFull}
          onChange={(e) => onReimburseInFullChange(e.target.checked)}
        />
        Reimburse in full instead (e.g. paid with their own card)
      </label>
    </div>
  );
}
