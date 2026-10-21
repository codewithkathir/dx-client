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
  /** Saved picture path; load it through the authenticated PHOTO endpoint. */
  photo: string | null;
  createdAt: string;
  updatedAt: string;
  /** List rows only. */
  openBillCount?: number;
  draftBillCount?: number;
}

export interface SupplierOption {
  id: number;
  companyName: string;
}

export type SupplierPayload = Partial<
  Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'photo'>
> & { companyName: string };

/** Picture change submitted with a supplier / customer form. */
export interface PartyPhotoChange {
  /** Newly picked picture to upload. */
  file: File | null;
  /** Remove the saved picture (ignored when a new file is picked). */
  remove: boolean;
}

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

export interface BillAttachment {
  fileName: string;
  contentType: string;
  isImage: boolean;
  /** "bill" = uploaded on the bill; "expense" = the linked claim's receipt (read-only). */
  source: 'bill' | 'expense';
}

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
  attachment: BillAttachment | null;
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
  dueFrom?: string;
  dueTo?: string;
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

export interface CustomerOption extends SupplierOption {
  trn: string | null;
  paymentTerms: string | null;
}

export interface Customer extends Supplier {
  trn: string | null;
  creditLimit: number | null;
  paymentTerms: string | null;
  /** List rows only: unpaid balance of sent / part-paid invoices. */
  outstanding?: number;
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

/** One product line on an invoice; description and unit are snapshots of what was sold. */
export interface InvoiceLine {
  id: number;
  lineNo: number;
  /** null on lines converted from invoices raised before products existed. */
  productId: number | null;
  productCode: string | null;
  description: string;
  unit: string | null;
  quantity: number;
  unitPrice: number;
  amount: number;
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
  lines: InvoiceLine[];
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

export interface InvoiceLinePayload {
  productId: number;
  /** Defaults to the product's name. */
  description?: string | null;
  quantity: number;
  unitPrice: number;
}

export interface InvoicePayload {
  customerId: number;
  invoiceDate: string;
  dueDate: string;
  lines: InvoiceLinePayload[];
  vatRate: VatRate;
  /** Optional subject shown above the lines. */
  description?: string | null;
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
