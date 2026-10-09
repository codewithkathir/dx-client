import { z } from 'zod';

import { optionalEmail, optionalPhone, optionalText, requiredText } from '@/lib/validation';

export const supplierSchema = z.object({
  companyName: requiredText('Company name', 200),
  contactName1: optionalText('Contact name', 150),
  email: optionalEmail('Email'),
  phone1: optionalPhone('Phone number'),
  whatsappNo: optionalPhone('WhatsApp number'),
  companyAddress: optionalText('Company address', 1000),
  cityState: optionalText('City / State', 150),
  country: optionalText('Country', 100),
  status: z.enum(['active', 'inactive']),
  comments: optionalText('Comments', 2000),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
