import type { BillStatus } from '@/types/finance.types';

export const BILL_STATUS_LABELS: Record<BillStatus, string> = {
  draft: 'Draft',
  open: 'Open',
  partially_paid: 'Partially paid',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

export const BILL_STATUS_VARIANTS: Record<
  BillStatus,
  'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'muted'
> = {
  draft: 'muted',
  open: 'secondary',
  partially_paid: 'warning',
  paid: 'success',
  overdue: 'destructive',
  cancelled: 'muted',
};

export const BILL_STATUS_FILTER_OPTIONS: Array<{ value: BillStatus | ''; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'open', label: 'Open' },
  { value: 'partially_paid', label: 'Partially paid' },
  { value: 'paid', label: 'Paid' },
  { value: 'draft', label: 'Draft' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const PAYEE_TYPE_FILTER_OPTIONS = [
  { value: '', label: 'All payees' },
  { value: 'supplier', label: 'Suppliers' },
  { value: 'employee', label: 'Employee reimbursements' },
] as const;

export const VAT_RATE_OPTIONS = [
  { value: 5, label: '5% (standard)' },
  { value: 0, label: '0% (zero-rated / exempt)' },
] as const;
