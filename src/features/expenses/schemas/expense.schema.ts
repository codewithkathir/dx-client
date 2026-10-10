import { z } from 'zod';

import { nullableText, requiredDate, requiredId } from '@/lib/validation';
import { VALIDATION_MESSAGES } from '@/messages/validation.messages';

export const expenseFormSchema = z.object({
  date: requiredDate('Date'),
  amount: z
    .number({ error: VALIDATION_MESSAGES.BLANK('Amount') })
    .positive(VALIDATION_MESSAGES.AMOUNT_POSITIVE('Amount'))
    .max(999999999.99, VALIDATION_MESSAGES.AMOUNT_TOO_LARGE('Amount')),
  whom: requiredId('Whom'),
  categoryId: requiredId('Category'),
  subCategoryId: requiredId('Sub category'),
  subSubCategoryId: z.number().min(1).optional().nullable(),
  description: nullableText('Description', 5000),
  paymentMethodId: requiredId('Paid with'),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
