import type { PaginationMeta } from '@/types/common.types';

export type PartyStatus = 'active' | 'inactive';

export interface Supplier {
  id: number;
  companyName: string;
  contactName1: string | null;
  contactName2: string | null;
  companyAddress: string | null;
  cityState: string | null;
  country: string | null;
  phone1: string | null;
  phone2: string | null;
  email: string | null;
  whatsappNo: string | null;
  status: PartyStatus;
  comments: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierOption {
  id: number;
  companyName: string;
}

export type SupplierPayload = Partial<
  Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>
> & { companyName: string };

export interface PartyListFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: PartyStatus | '';
  order?: 'asc' | 'desc';
}

export const BILL_STATUSES = ['draft', 'open', 'partially_paid', 'paid', 'overdue', 'cancelled'] as const;
export type BillStatus = (typeof BILL_STATUSES)[number];
export type PayeeType = 'supplier' | 'employee';
export type VatRate = 0 | 5;

export interface Bill {
  id: number;
  billNo: string;
  payeeType: PayeeType;
  supplierId: number | null;
  employeeId: number | null;
  payeeName: string | null;
  employeeCode: string | null;
  billDate: string;
  dueDate: string;
  subtotalAmount: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  currency: string;
  categoryId: number | null;
  categoryName: string | null;
  description: string | null;
  expenseId: number | null;
  source: 'manual' | 'expense';
  notes: string | null;
  status: BillStatus;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  billId: number;
  paymentDate: string;
  amount: number;
  paymentMethodId: number;
  paymentMethodName: string | null;
  reference: string | null;
  notes: string | null;
  createdAt: string;
}

export interface BillDetail extends Bill {
  payments: Payment[];
}

export interface BillListFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: BillStatus | '';
  payeeType?: PayeeType | '';
  supplierId?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface BillPayload {
  supplierId: number;
  billNo: string;
  billDate: string;
  dueDate: string;
  subtotalAmount: number;
  vatRate: VatRate;
  categoryId?: number | null;
  description?: string | null;
  notes?: string | null;
  status?: 'draft' | 'open';
}

export interface PaymentPayload {
  paymentDate: string;
  amount: number;
  paymentMethodId: number;
  reference?: string | null;
  notes?: string | null;
}

export interface PayablesSummary {
  outstandingAmount: number;
  outstandingCount: number;
  overdueAmount: number;
  overdueCount: number;
  paidThisMonth: number;
  draftCount: number;
}

export interface ExpenseReimbursement {
  billId: number;
  billNo: string;
  status: BillStatus;
  totalAmount: number;
  amountPaid: number;
  lastPaymentDate: string | null;
}

export interface ListResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export type CustomerOption = SupplierOption;

export interface Customer extends Supplier {
  trn: string | null;
  creditLimit: number | null;
  paymentTerms: string | null;
}

export type CustomerPayload = SupplierPayload & {
  trn?: string | null;
  creditLimit?: number | null;
  paymentTerms?: string | null;
};

export const INVOICE_STATUSES = ['draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled'] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export interface Invoice {
  id: number;
  invoiceNo: string;
  customerId: number;
  customerName: string;
  customerTrn: string | null;
  invoiceDate: string;
  dueDate: string;
  subtotalAmount: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  amountReceived: number;
  balance: number;
  currency: string;
  description: string | null;
  poReference: string | null;
  notes: string | null;
  status: InvoiceStatus;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  id: number;
  invoiceId: number;
  receiptDate: string;
  amount: number;
  paymentMethodId: number;
  paymentMethodName: string | null;
  reference: string | null;
  notes: string | null;
  createdAt: string;
}

export interface InvoiceDetail extends Invoice {
  receipts: Receipt[];
}

export interface InvoiceListFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: InvoiceStatus | '';
  customerId?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface InvoicePayload {
  customerId: number;
  invoiceDate: string;
  dueDate: string;
  subtotalAmount: number;
  vatRate: VatRate;
  description: string;
  poReference?: string | null;
  notes?: string | null;
  status?: 'draft' | 'sent';
}

export interface ReceiptPayload {
  receiptDate: string;
  amount: number;
  paymentMethodId: number;
  reference?: string | null;
  notes?: string | null;
}

export interface ReceivablesSummary {
  outstandingAmount: number;
  outstandingCount: number;
  overdueAmount: number;
  overdueCount: number;
  receivedThisMonth: number;
  draftCount: number;
}
