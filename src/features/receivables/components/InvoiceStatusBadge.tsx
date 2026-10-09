import { Badge } from '@/components/ui/badge';
import {
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_VARIANTS,
} from '@/features/receivables/constants/receivable.constants';
import type { Invoice } from '@/types/finance.types';

/** Shows "Overdue" in place of sent / partially paid once the due date has passed. */
export function InvoiceStatusBadge({ invoice }: { invoice: Pick<Invoice, 'status' | 'isOverdue'> }) {
  const status = invoice.isOverdue ? 'overdue' : invoice.status;
  return <Badge variant={INVOICE_STATUS_VARIANTS[status]} dot>{INVOICE_STATUS_LABELS[status]}</Badge>;
}
