import { z } from 'zod';

import { VALIDATION_MESSAGES } from '@/messages/validation.messages';

// Mirrors the server's employeeUpdateProfileSchema / adminUpdateProfileSchema.

const requiredText = (max: number) =>
  z.string().trim().min(1, VALIDATION_MESSAGES.REQUIRED).max(max, VALIDATION_MESSAGES.MAX_LENGTH(max));

const phoneSchema = z
  .string()
  .trim()
  .min(5, VALIDATION_MESSAGES.MIN_LENGTH(5))
  .max(30, VALIDATION_MESSAGES.MAX_LENGTH(30));

export const employeeProfileSchema = z.object({
  empName: z
    .string()
    .trim()
    .min(2, VALIDATION_MESSAGES.MIN_LENGTH(2))
    .max(150, VALIDATION_MESSAGES.MAX_LENGTH(150)),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, VALIDATION_MESSAGES.DATE),
  phoneNo: phoneSchema,
  whatsappNo: z.union([phoneSchema, z.literal('')]),
  homeAddress: requiredText(500),
  cityState: requiredText(150),
  country: requiredText(100),
});

export type EmployeeProfileFormValues = z.infer<typeof employeeProfileSchema>;

export const adminProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, VALIDATION_MESSAGES.MIN_LENGTH(2))
    .max(150, VALIDATION_MESSAGES.MAX_LENGTH(150)),
});

export type AdminProfileFormValues = z.infer<typeof adminProfileSchema>;
