import { z } from 'zod';

import { nullableText, requiredId, requiredText } from '@/lib/validation';

const catalogStatusSchema = z.enum(['active', 'inactive']);

export const subSubCategoryFormSchema = z.object({
  categoryId: requiredId('Category'),
  subCategoryId: requiredId('Sub category'),
  name: requiredText('Name', 200),
  description: nullableText('Description', 2000),
  status: catalogStatusSchema,
  /** Vehicle categories: service record created when a claim is approved. */
  serviceTypeId: z.number().nullable(),
});

export type SubSubCategoryFormValues = z.infer<typeof subSubCategoryFormSchema>;
