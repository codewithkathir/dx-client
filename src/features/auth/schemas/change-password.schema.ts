import { z } from 'zod';

import { VALIDATION_MESSAGES } from '@/messages/validation.messages';

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
    newPassword: z.string().min(8, VALIDATION_MESSAGES.PASSWORD_MIN),
    confirmPassword: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: VALIDATION_MESSAGES.PASSWORD_MATCH,
    path: ['confirmPassword'],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
