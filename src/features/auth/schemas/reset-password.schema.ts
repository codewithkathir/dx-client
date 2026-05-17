import { z } from 'zod';

import { VALIDATION_MESSAGES } from '@/messages/validation.messages';

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
    newPassword: z.string().min(8, VALIDATION_MESSAGES.PASSWORD_MIN),
    confirmPassword: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: VALIDATION_MESSAGES.PASSWORD_MATCH,
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
