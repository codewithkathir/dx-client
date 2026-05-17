import { z } from 'zod';

import { VALIDATION_MESSAGES } from '@/messages/validation.messages';

const catalogStatusSchema = z.enum(['active', 'inactive']);

export const subSubCategoryFormSchema = z.object({
  categoryId: z.number().min(1, VALIDATION_MESSAGES.REQUIRED),
  subCategoryId: z.number().min(1, VALIDATION_MESSAGES.REQUIRED),
  name: z.string().min(1, VALIDATION_MESSAGES.REQUIRED).max(200),
  description: z.string().max(2000).optional().nullable(),
  status: catalogStatusSchema,
});

export type SubSubCategoryFormValues = z.infer<typeof subSubCategoryFormSchema>;
