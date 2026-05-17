import { z } from 'zod';

import { VALIDATION_MESSAGES } from '@/messages/validation.messages';

const catalogStatusSchema = z.enum(['active', 'inactive']);

export const categoryFormSchema = z.object({
  name: z.string().min(1, VALIDATION_MESSAGES.REQUIRED).max(200),
  description: z.string().max(2000).optional().nullable(),
  status: catalogStatusSchema,
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
