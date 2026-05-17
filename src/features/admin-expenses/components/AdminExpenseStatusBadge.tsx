import { Badge } from '@/components/ui/badge';
import {
  ADMIN_EXPENSE_STATUS_LABELS,
  ADMIN_EXPENSE_STATUS_VARIANT,
} from '@/features/admin-expenses/constants/admin-expense.constants';
import type { AdminExpenseStatus } from '@/types/expense.types';

interface AdminExpenseStatusBadgeProps {
  status: AdminExpenseStatus;
}

export function AdminExpenseStatusBadge({ status }: AdminExpenseStatusBadgeProps) {
  return (
    <Badge variant={ADMIN_EXPENSE_STATUS_VARIANT[status]}>
      {ADMIN_EXPENSE_STATUS_LABELS[status]}
    </Badge>
  );
}
