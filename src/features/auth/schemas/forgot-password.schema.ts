import { z } from 'zod';

import { VALIDATION_MESSAGES } from '@/messages/validation.messages';

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, VALIDATION_MESSAGES.REQUIRED).email(VALIDATION_MESSAGES.EMAIL),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
