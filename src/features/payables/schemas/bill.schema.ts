import { z } from 'zod';

import { moneyString, optionalText, requiredDate, requiredIdString, requiredText } from '@/lib/validation';
import { VALIDATION_MESSAGES } from '@/messages/validation.messages';

/** Positive amount with at most 2 decimals (mirrors the server's moneySchema). */
export const moneySchema = moneyString('Amount');

export const billSchema = z
  .object({
    supplierId: requiredIdString('Supplier'),
    billNo: requiredText('Bill number', 50),
    billDate: requiredDate('Bill date'),
    dueDate: requiredDate('Due date'),
    subtotalAmount: moneyString('Amount before VAT'),
    vatRate: z.enum(['0', '5']),
    categoryId: z.string(),
    description: optionalText('Description', 2000),
    notes: optionalText('Notes', 2000),
  })
  .refine((data) => data.dueDate >= data.billDate, {
    message: VALIDATION_MESSAGES.DATE_NOT_BEFORE('Due date', 'Bill date'),
    path: ['dueDate'],
  });

export type BillFormInput = z.input<typeof billSchema>;
export type BillFormValues = z.output<typeof billSchema>;

export const paymentSchema = z.object({
  paymentDate: requiredDate('Date'),
  amount: moneyString('Amount'),
  paymentMethodId: requiredIdString('Method'),
  reference: optionalText('Reference', 100),
  notes: optionalText('Notes', 2000),
});

export type PaymentFormInput = z.input<typeof paymentSchema>;
export type PaymentFormValues = z.output<typeof paymentSchema>;
