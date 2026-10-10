import { z } from 'zod';

import { nullableText, requiredId, requiredText } from '@/lib/validation';

const catalogStatusSchema = z.enum(['active', 'inactive']);

export const subCategoryFormSchema = z.object({
  categoryId: requiredId('Category'),
  name: requiredText('Name', 200),
  description: nullableText('Description', 2000),
  status: catalogStatusSchema,
});

export type SubCategoryFormValues = z.infer<typeof subCategoryFormSchema>;
