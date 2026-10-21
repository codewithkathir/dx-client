import { z } from 'zod';

import { moneyString, optionalText, quantityString, requiredDate, requiredIdString } from '@/lib/validation';
import { VALIDATION_MESSAGES } from '@/messages/validation.messages';

/** Mirrors the server's MAX_INVOICE_LINES. */
export const MAX_INVOICE_LINES = 100;

export const invoiceLineSchema = z.object({
  productId: requiredIdString('Product'),
  /** Blank = the product's name. */
  description: optionalText('Description', 500),
  quantity: quantityString('Qty'),
  unitPrice: moneyString('Price'),
});

export const invoiceSchema = z
  .object({
    customerId: requiredIdString('Customer'),
    invoiceDate: requiredDate('Invoice date'),
    dueDate: requiredDate('Due date'),
    lines: z
      .array(invoiceLineSchema)
      .min(1, 'Add at least one product')
      .max(MAX_INVOICE_LINES, `An invoice can have up to ${MAX_INVOICE_LINES} lines`),
    vatRate: z.enum(['0', '5']),
    description: optionalText('Subject', 2000),
    poReference: optionalText('PO reference', 100),
    notes: optionalText('Notes', 2000),
  })
  .refine((data) => data.dueDate >= data.invoiceDate, {
    message: VALIDATION_MESSAGES.DATE_NOT_BEFORE('Due date', 'Invoice date'),
    path: ['dueDate'],
  });

export type InvoiceFormInput = z.input<typeof invoiceSchema>;
export type InvoiceFormValues = z.output<typeof invoiceSchema>;
