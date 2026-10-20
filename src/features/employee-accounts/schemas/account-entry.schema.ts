import { z } from 'zod';

const requiredDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date');
const amountText = z
  .string()
  .trim()
  .refine((v) => /^\d+(\.\d{1,2})?$/.test(v) && Number(v) > 0 && Number(v) <= 999999999.99, 'Enter an amount like 500.00');

/** Advance, return or adjustment. Form values are strings; converted on submit. */
export const accountEntryFormSchema = z
  .object({
    kind: z.enum(['advance', 'return', 'adjustment']),
    /** Picked in the dialog when it isn't opened for one employee. */
    employeeId: z.string(),
    /** Adjustments: whether it adds to or takes from the balance. */
    direction: z.enum(['add', 'deduct']),
    amount: amountText,
    entryDate: requiredDate,
    paymentMethodId: z.string(),
    reference: z.string().trim().max(100),
    notes: z.string().trim().max(2000),
  })
  .refine((v) => v.kind === 'adjustment' || v.paymentMethodId !== '', {
    message: 'Pick how the money was paid',
    path: ['paymentMethodId'],
  })
  .refine((v) => v.kind !== 'adjustment' || v.notes !== '', {
    message: 'Say why the balance is being adjusted',
    path: ['notes'],
  });
export type AccountEntryFormValues = z.infer<typeof accountEntryFormSchema>;
