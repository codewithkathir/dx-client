import { z } from 'zod';

import { requiredEmail } from '@/lib/validation';

export const forgotPasswordSchema = z.object({
  email: requiredEmail('Email'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
