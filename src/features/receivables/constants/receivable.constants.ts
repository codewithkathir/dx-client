import type { InvoiceStatus } from '@/types/finance.types';

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  partially_paid: 'Partially paid',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

export const INVOICE_STATUS_VARIANTS: Record<
  InvoiceStatus,
  'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'muted'
> = {
  draft: 'muted',
  sent: 'secondary',
  partially_paid: 'warning',
  paid: 'success',
  overdue: 'destructive',
  cancelled: 'muted',
};

export const INVOICE_STATUS_FILTER_OPTIONS: Array<{ value: InvoiceStatus | ''; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'sent', label: 'Sent' },
  { value: 'partially_paid', label: 'Partially paid' },
  { value: 'paid', label: 'Paid' },
  { value: 'draft', label: 'Draft' },
  { value: 'cancelled', label: 'Cancelled' },
];

/** Default days between invoice date and due date for new invoices. */
export const DEFAULT_INVOICE_DUE_DAYS = 30;
