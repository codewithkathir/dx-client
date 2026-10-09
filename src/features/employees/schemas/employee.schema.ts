import { z } from 'zod';

import {
  optionalDate,
  optionalPhone,
  optionalText,
  password,
  requiredDate,
  requiredEmail,
  requiredPhone,
  requiredText,
} from '@/lib/validation';
import { VALIDATION_MESSAGES } from '@/messages/validation.messages';
import { EMPLOYEE_STATUSES } from '@/types/employee.types';

export const employeeFormSchema = z.object({
  empName: requiredText('Full name', 150, 2),
  companyName: requiredText('Company', 200),
  dob: requiredDate('Date of birth'),
  homeAddress: requiredText('Home address', 500),
  cityState: requiredText('City / State', 150),
  country: requiredText('Country', 100),
  phoneNo: requiredPhone('Phone number'),
  whatsappNo: optionalPhone('WhatsApp number').optional(),
  emiratesIdNo: requiredText('Emirates ID', 50),
  emiratesIdExpiryDate: requiredDate('Emirates ID expiry'),
  visaExpiryDate: requiredDate('Visa expiry'),
  passportNo: requiredText('Passport number', 50),
  passportExpiryDate: requiredDate('Passport expiry'),
  drivingLicenseNo: optionalText('Driving license', 50).optional(),
  drivingLicenseExpiryDate: optionalDate('License expiry').optional(),
  email: requiredEmail('Email'),
  password: z
    .union([
      z.literal(''),
      z
        .string()
        .min(8, VALIDATION_MESSAGES.TOO_SHORT('Password', 8))
        .max(128, VALIDATION_MESSAGES.TOO_LONG('Password', 128)),
    ])
    .optional(),
  status: z.enum(EMPLOYEE_STATUSES),
  comments: optionalText('Comments', 2000).optional(),
  role: z.string().max(50).optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export const createEmployeeSchema = employeeFormSchema.extend({
  password: password('Password'),
});

export type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>;
