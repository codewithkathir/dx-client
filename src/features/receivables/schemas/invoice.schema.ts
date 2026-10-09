import { z } from 'zod';

import { moneyString, optionalText, requiredDate, requiredIdString, requiredText } from '@/lib/validation';
import { VALIDATION_MESSAGES } from '@/messages/validation.messages';

export const invoiceSchema = z
  .object({
    customerId: requiredIdString('Customer'),
    invoiceDate: requiredDate('Invoice date'),
    dueDate: requiredDate('Due date'),
    subtotalAmount: moneyString('Amount before VAT'),
    vatRate: z.enum(['0', '5']),
    description: requiredText('Description', 2000),
    poReference: optionalText('PO reference', 100),
    notes: optionalText('Notes', 2000),
  })
  .refine((data) => data.dueDate >= data.invoiceDate, {
    message: VALIDATION_MESSAGES.DATE_NOT_BEFORE('Due date', 'Invoice date'),
    path: ['dueDate'],
  });

export type InvoiceFormInput = z.input<typeof invoiceSchema>;
export type InvoiceFormValues = z.output<typeof invoiceSchema>;
