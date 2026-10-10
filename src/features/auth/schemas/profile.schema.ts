import { z } from 'zod';

import { optionalPhone, requiredDate, requiredPhone, requiredText } from '@/lib/validation';

// Mirrors the server's employeeUpdateProfileSchema / adminUpdateProfileSchema.
export const employeeProfileSchema = z.object({
  empName: requiredText('Full name', 150, 2),
  dob: requiredDate('Date of birth'),
  phoneNo: requiredPhone('Phone number'),
  whatsappNo: optionalPhone('WhatsApp number'),
  homeAddress: requiredText('Home address', 500),
  cityState: requiredText('City / State', 150),
  country: requiredText('Country', 100),
});

export type EmployeeProfileFormValues = z.infer<typeof employeeProfileSchema>;

export const adminProfileSchema = z.object({
  name: requiredText('Full name', 150, 2),
});

export type AdminProfileFormValues = z.infer<typeof adminProfileSchema>;
