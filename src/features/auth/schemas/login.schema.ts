import { z } from 'zod';

import { password, requiredEmail } from '@/lib/validation';

export const loginSchema = z.object({
  email: requiredEmail('Email'),
  password: password('Password'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
