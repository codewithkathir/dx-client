import { z } from 'zod';

import { VALIDATION_MESSAGES } from '@/messages/validation.messages';

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format');

export const expenseFormSchema = z.object({
  date: dateSchema,
  amount: z.number().positive('Amount must be greater than zero').max(999999999.99),
  whom: z.number().min(1, VALIDATION_MESSAGES.REQUIRED),
  categoryId: z.number().min(1, VALIDATION_MESSAGES.REQUIRED),
  subCategoryId: z.number().min(1, VALIDATION_MESSAGES.REQUIRED),
  subSubCategoryId: z.number().min(1).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  paymentMethodId: z.number().min(1, VALIDATION_MESSAGES.REQUIRED),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
