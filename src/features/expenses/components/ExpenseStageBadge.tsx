import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { ADMIN_ROUTES } from '@/constants/routes.constants';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import type { Expense } from '@/types/expense.types';

type Stage = { label: string; variant: 'muted' | 'warning' | 'secondary' | 'success' | 'destructive' };

/** Where a claim stands: awaiting approval → approved (awaiting payment) → paid, or rejected. */
export function getExpenseStage(expense: Pick<Expense, 'employeeStatus' | 'adminStatus' | 'reimbursement'>): Stage {
  if (expense.adminStatus === 'rejected' || expense.employeeStatus === 'rejected') {
    return { label: 'Rejected', variant: 'destructive' };
  }
  if (expense.adminStatus === 'paid') return { label: 'Paid', variant: 'success' };
  if (expense.employeeStatus === 'approved') {
    return expense.reimbursement?.status === 'partially_paid'
      ? { label: 'Partly paid', variant: 'warning' }
      : { label: 'Approved · awaiting payment', variant: 'secondary' };
  }
  return { label: 'Awaiting approval', variant: 'warning' };
}

/**
 * `showBillLink` links the bill number to Payables (admin only);
 * otherwise a paid claim shows the date it was paid.
 */
export function ExpenseStageBadge({
  expense,
  showBillLink = false,
}: {
  expense: Pick<Expense, 'employeeStatus' | 'adminStatus' | 'reimbursement'>;
  showBillLink?: boolean;
}) {
  const stage = getExpenseStage(expense);
  const bill = expense.reimbursement;
  return (
    <div className="flex flex-col items-start gap-1">
      <Badge variant={stage.variant}>{stage.label}</Badge>
      {!showBillLink && expense.adminStatus === 'paid' && bill?.lastPaymentDate ? (
        <span className="text-xs text-muted-foreground">
          on {formatExpenseDate(bill.lastPaymentDate)}
        </span>
      ) : null}
      {showBillLink && bill && bill.status !== 'cancelled' ? (
        <Link
          href={`${ADMIN_ROUTES.PAYABLES}?bill=${bill.billId}`}
          className="text-xs text-primary underline-offset-4 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {bill.billNo}
        </Link>
      ) : null}
    </div>
  );
}
