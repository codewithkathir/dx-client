import { z } from 'zod';

import { optionalEmail, optionalPhone, optionalText, requiredText } from '@/lib/validation';
import { VALIDATION_MESSAGES } from '@/messages/validation.messages';

export const customerSchema = z.object({
  companyName: requiredText('Company name', 200),
  contactName1: optionalText('Contact name', 150),
  email: optionalEmail('Email'),
  phone1: optionalPhone('Phone number'),
  whatsappNo: optionalPhone('WhatsApp number'),
  companyAddress: optionalText('Company address', 1000),
  cityState: optionalText('City / State', 150),
  country: optionalText('Country', 100),
  trn: z.union([z.string().trim().regex(/^\d{15}$/, VALIDATION_MESSAGES.EXACT_DIGITS('TRN', 15)), z.literal('')]),
  creditLimit: z.union([
    z.string().trim().regex(/^\d+(\.\d{1,2})?$/, VALIDATION_MESSAGES.AMOUNT_DECIMALS('Credit limit')),
    z.literal(''),
  ]),
  paymentTerms: optionalText('Payment terms', 100),
  status: z.enum(['active', 'inactive']),
  comments: optionalText('Comments', 2000),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
