import { z } from 'zod';

import { password } from '@/lib/validation';
import { VALIDATION_MESSAGES } from '@/messages/validation.messages';

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, VALIDATION_MESSAGES.BLANK('Reset code')),
    newPassword: password('New password'),
    confirmPassword: z.string().min(1, VALIDATION_MESSAGES.BLANK('Confirm new password')),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: VALIDATION_MESSAGES.SAME_AS('Confirm new password', 'New password'),
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
