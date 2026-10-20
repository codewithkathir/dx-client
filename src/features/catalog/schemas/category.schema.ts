import { z } from 'zod';

import { nullableText, requiredText } from '@/lib/validation';

const catalogStatusSchema = z.enum(['active', 'inactive']);

export const categoryFormSchema = z.object({
  name: requiredText('Name', 200),
  description: nullableText('Description', 2000),
  status: catalogStatusSchema,
  /** Claims ask for the vehicle and its km. */
  isVehicleExpense: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
