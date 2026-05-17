import { z } from 'zod';

import { EMPLOYEE_STATUSES } from '@/types/employee.types';

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format');
const phoneSchema = z.string().min(5, 'Phone is required').max(30);

export const employeeFormSchema = z.object({
  empName: z.string().min(2, 'Name is required').max(150),
  companyName: z.string().min(1, 'Company is required').max(200),
  dob: dateSchema,
  homeAddress: z.string().min(1, 'Address is required').max(500),
  cityState: z.string().min(1, 'City/State is required').max(150),
  country: z.string().min(1, 'Country is required').max(100),
  phoneNo: phoneSchema,
  whatsappNo: z.string().max(30).optional().or(z.literal('')),
  emiratesIdNo: z.string().min(1, 'Emirates ID is required').max(50),
  emiratesIdExpiryDate: dateSchema,
  visaExpiryDate: dateSchema,
  passportNo: z.string().min(1, 'Passport is required').max(50),
  passportExpiryDate: dateSchema,
  drivingLicenseNo: z.string().max(50).optional().or(z.literal('')),
  drivingLicenseExpiryDate: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters').max(128).optional().or(z.literal('')),
  status: z.enum(EMPLOYEE_STATUSES),
  comments: z.string().max(2000).optional().or(z.literal('')),
  role: z.string().max(50).optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export const createEmployeeSchema = employeeFormSchema.extend({
  password: z.string().min(8, 'Password is required').max(128),
});

export type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>;
