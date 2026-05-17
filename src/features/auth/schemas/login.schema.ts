import { z } from 'zod';

import { VALIDATION_MESSAGES } from '@/messages/validation.messages';

export const loginSchema = z.object({
  email: z.string().min(1, VALIDATION_MESSAGES.REQUIRED).email(VALIDATION_MESSAGES.EMAIL),
  password: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .min(8, VALIDATION_MESSAGES.PASSWORD_MIN),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
