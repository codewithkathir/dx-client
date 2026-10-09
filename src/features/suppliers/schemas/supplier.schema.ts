import { z } from 'zod';

import { VALIDATION_MESSAGES } from '@/messages/validation.messages';

const optionalText = (max: number) =>
  z.string().trim().max(max, VALIDATION_MESSAGES.MAX_LENGTH(max));
const optionalPhone = z.union([
  z.string().trim().min(5, VALIDATION_MESSAGES.MIN_LENGTH(5)).max(30, VALIDATION_MESSAGES.MAX_LENGTH(30)),
  z.literal(''),
]);

export const supplierSchema = z.object({
  companyName: z.string().trim().min(1, VALIDATION_MESSAGES.REQUIRED).max(200, VALIDATION_MESSAGES.MAX_LENGTH(200)),
  contactName1: optionalText(150),
  email: z.union([z.email(VALIDATION_MESSAGES.EMAIL), z.literal('')]),
  phone1: optionalPhone,
  whatsappNo: optionalPhone,
  companyAddress: optionalText(1000),
  cityState: optionalText(150),
  country: optionalText(100),
  status: z.enum(['active', 'inactive']),
  comments: optionalText(2000),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
