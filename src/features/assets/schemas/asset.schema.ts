import { z } from 'zod';

const optionalDate = z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, 'Use a valid date');
const requiredDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date');

/** Form values are strings (inputs); converted to the API payload on submit. */
export const assetFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(150),
  assetNo: z
    .string()
    .trim()
    .max(50)
    .regex(/^[A-Za-z0-9._/-]*$/, 'Use letters, numbers, dots, dashes or slashes'),
  category: z.string().min(1, 'Pick a category'),
  brand: z.string().trim().max(100),
  model: z.string().trim().max(100),
  serialNo: z.string().trim().max(100),
  purchaseDate: optionalDate,
  purchaseCost: z
    .string()
    .trim()
    .refine((v) => v === '' || (/^\d+(\.\d{1,2})?$/.test(v) && Number(v) <= 999999999.99), 'Enter an amount like 1250.00'),
  warrantyExpiry: optionalDate,
  condition: z.string().min(1),
  status: z.string().min(1),
  notes: z.string().trim().max(2000),
});
export type AssetFormValues = z.infer<typeof assetFormSchema>;

export const assignFormSchema = z
  .object({
    employeeId: z.string().min(1, 'Pick an employee'),
    assignedDate: requiredDate,
    expectedReturnDate: optionalDate,
    condition: z.string().min(1),
    notes: z.string().trim().max(2000),
  })
  .refine((v) => !v.expectedReturnDate || v.expectedReturnDate >= v.assignedDate, {
    message: "Return date can't be before the assigned date",
    path: ['expectedReturnDate'],
  });
export type AssignFormValues = z.infer<typeof assignFormSchema>;

export const returnFormSchema = z.object({
  returnedDate: requiredDate,
  condition: z.string().min(1, 'Pick the condition'),
  nextStatus: z.string().min(1),
  notes: z.string().trim().max(2000),
});
export type ReturnFormValues = z.infer<typeof returnFormSchema>;
