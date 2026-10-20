import { z } from 'zod';

const optionalDate = z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, 'Use a valid date');
const requiredDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date');
const optionalKm = z
  .string()
  .trim()
  .refine((v) => v === '' || (/^\d+$/.test(v) && Number(v) <= 9999999), 'Enter whole km, e.g. 45200');
const requiredKm = z
  .string()
  .trim()
  .min(1, 'Enter the odometer reading')
  .refine((v) => /^\d+$/.test(v) && Number(v) <= 9999999, 'Enter whole km, e.g. 45200');
const optionalDays = z
  .string()
  .trim()
  .refine((v) => v === '' || (/^\d+$/.test(v) && Number(v) > 0 && Number(v) <= 100000), 'Enter a whole number');

/** Form values are strings (inputs); converted to the API payload on submit. */
export const serviceRecordFormSchema = z
  .object({
    serviceTypeId: z.string().min(1, 'Pick what was done'),
    startDate: requiredDate,
    endDate: optionalDate,
    odometerKm: optionalKm,
    nextDueKm: optionalKm,
    employeeId: z.string(),
    cost: z
      .string()
      .trim()
      .refine((v) => v === '' || (/^\d+(\.\d{1,2})?$/.test(v) && Number(v) <= 999999999.99), 'Enter an amount like 250.00'),
    referenceNo: z.string().trim().max(100),
    notes: z.string().trim().max(2000),
    allowOdometerDecrease: z.boolean(),
  })
  .refine((v) => !v.endDate || v.endDate >= v.startDate, {
    message: "Can't be before the date done",
    path: ['endDate'],
  })
  .refine((v) => v.nextDueKm === '' || v.odometerKm !== '', {
    message: 'Enter the odometer first',
    path: ['nextDueKm'],
  })
  .refine((v) => v.nextDueKm === '' || v.odometerKm === '' || Number(v.nextDueKm) > Number(v.odometerKm), {
    message: 'Must be more than the odometer',
    path: ['nextDueKm'],
  });
export type ServiceRecordFormValues = z.infer<typeof serviceRecordFormSchema>;

export const odometerFormSchema = z.object({
  readingKm: requiredKm,
  readingDate: requiredDate,
  employeeId: z.string(),
  notes: z.string().trim().max(255),
  allowDecrease: z.boolean(),
});
export type OdometerFormValues = z.infer<typeof odometerFormSchema>;

export const myOdometerFormSchema = z.object({
  readingKm: requiredKm,
  notes: z.string().trim().max(255),
});
export type MyOdometerFormValues = z.infer<typeof myOdometerFormSchema>;

export const serviceTypeFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  code: z
    .string()
    .trim()
    .min(1, 'Code is required')
    .max(30)
    .regex(/^[A-Za-z0-9_]+$/, 'Use letters, numbers or underscores'),
  category: z.string(),
  intervalDays: optionalDays,
  intervalKm: optionalDays,
  status: z.string().min(1),
});
export type ServiceTypeFormValues = z.infer<typeof serviceTypeFormSchema>;
