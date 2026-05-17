import { Badge } from '@/components/ui/badge';
import {
  EXPENSE_STATUS_LABELS,
  EXPENSE_STATUS_VARIANT,
} from '@/features/expenses/constants/expense.constants';
import type { EmployeeExpenseStatus } from '@/types/expense.types';

interface ExpenseStatusBadgeProps {
  status: EmployeeExpenseStatus;
}

export function ExpenseStatusBadge({ status }: ExpenseStatusBadgeProps) {
  return (
    <Badge variant={EXPENSE_STATUS_VARIANT[status]}>{EXPENSE_STATUS_LABELS[status]}</Badge>
  );
}
