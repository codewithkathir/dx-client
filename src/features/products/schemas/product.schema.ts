import { z } from 'zod';

import { moneyString, optionalText, requiredText } from '@/lib/validation';

export const productSchema = z.object({
  code: optionalText('Code', 50),
  name: requiredText('Product name', 200),
  unit: requiredText('Unit', 20),
  unitPrice: moneyString('Unit price'),
  description: optionalText('Description', 2000),
  status: z.enum(['active', 'inactive']),
});

export type ProductFormInput = z.input<typeof productSchema>;
export type ProductFormValues = z.output<typeof productSchema>;
