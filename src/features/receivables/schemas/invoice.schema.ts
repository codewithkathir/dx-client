import { z } from 'zod';

import { moneySchema } from '@/features/payables/schemas/bill.schema';
import { VALIDATION_MESSAGES } from '@/messages/validation.messages';

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, VALIDATION_MESSAGES.DATE);

export const invoiceSchema = z
  .object({
    customerId: z.coerce.number<string>().int().positive(VALIDATION_MESSAGES.REQUIRED),
    invoiceDate: dateSchema,
    dueDate: dateSchema,
    subtotalAmount: moneySchema,
    vatRate: z.enum(['0', '5']),
    description: z.string().trim().min(1, VALIDATION_MESSAGES.REQUIRED).max(2000, VALIDATION_MESSAGES.MAX_LENGTH(2000)),
    poReference: z.string().trim().max(100, VALIDATION_MESSAGES.MAX_LENGTH(100)),
    notes: z.string().trim().max(2000, VALIDATION_MESSAGES.MAX_LENGTH(2000)),
  })
  .refine((data) => data.dueDate >= data.invoiceDate, {
    message: VALIDATION_MESSAGES.INVOICE_DUE_DATE_ORDER,
    path: ['dueDate'],
  });

export type InvoiceFormInput = z.input<typeof invoiceSchema>;
export type InvoiceFormValues = z.output<typeof invoiceSchema>;
