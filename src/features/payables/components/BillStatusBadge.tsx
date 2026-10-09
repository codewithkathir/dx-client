import { Badge } from '@/components/ui/badge';
import {
  BILL_STATUS_LABELS,
  BILL_STATUS_VARIANTS,
} from '@/features/payables/constants/payable.constants';
import type { Bill } from '@/types/finance.types';

/** Shows "Overdue" in place of open / partially paid once the due date has passed. */
export function BillStatusBadge({ bill }: { bill: Pick<Bill, 'status' | 'isOverdue'> }) {
  const status = bill.isOverdue ? 'overdue' : bill.status;
  return <Badge variant={BILL_STATUS_VARIANTS[status]} dot>{BILL_STATUS_LABELS[status]}</Badge>;
}
