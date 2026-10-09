import { z } from 'zod';

import { password } from '@/lib/validation';
import { VALIDATION_MESSAGES } from '@/messages/validation.messages';

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, VALIDATION_MESSAGES.BLANK('Current password')),
    newPassword: password('New password'),
    confirmPassword: z.string().min(1, VALIDATION_MESSAGES.BLANK('Confirm new password')),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: VALIDATION_MESSAGES.SAME_AS('Confirm new password', 'New password'),
    path: ['confirmPassword'],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: VALIDATION_MESSAGES.MUST_DIFFER('New password', 'Current password'),
    path: ['newPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
