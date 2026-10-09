import { z } from 'zod';

import { VALIDATION_MESSAGES } from '@/messages/validation.messages';

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, VALIDATION_MESSAGES.DATE);

/** Positive amount with at most 2 decimals (mirrors the server's moneySchema). */
export const moneySchema = z.coerce
  .number<string>({ error: VALIDATION_MESSAGES.AMOUNT })
  .positive(VALIDATION_MESSAGES.AMOUNT)
  .max(9_999_999_999.99, VALIDATION_MESSAGES.AMOUNT)
  .refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, VALIDATION_MESSAGES.MONEY_DECIMALS);

export const billSchema = z
  .object({
    supplierId: z.coerce.number<string>().int().positive(VALIDATION_MESSAGES.REQUIRED),
    billNo: z.string().trim().min(1, VALIDATION_MESSAGES.REQUIRED).max(50, VALIDATION_MESSAGES.MAX_LENGTH(50)),
    billDate: dateSchema,
    dueDate: dateSchema,
    subtotalAmount: moneySchema,
    vatRate: z.enum(['0', '5']),
    categoryId: z.string(),
    description: z.string().trim().max(2000, VALIDATION_MESSAGES.MAX_LENGTH(2000)),
    notes: z.string().trim().max(2000, VALIDATION_MESSAGES.MAX_LENGTH(2000)),
  })
  .refine((data) => data.dueDate >= data.billDate, {
    message: VALIDATION_MESSAGES.DUE_DATE_ORDER,
    path: ['dueDate'],
  });

export type BillFormInput = z.input<typeof billSchema>;
export type BillFormValues = z.output<typeof billSchema>;

export const paymentSchema = z.object({
  paymentDate: dateSchema,
  amount: moneySchema,
  paymentMethodId: z.coerce.number<string>().int().positive(VALIDATION_MESSAGES.REQUIRED),
  reference: z.string().trim().max(100, VALIDATION_MESSAGES.MAX_LENGTH(100)),
  notes: z.string().trim().max(2000, VALIDATION_MESSAGES.MAX_LENGTH(2000)),
});

export type PaymentFormInput = z.input<typeof paymentSchema>;
export type PaymentFormValues = z.output<typeof paymentSchema>;
