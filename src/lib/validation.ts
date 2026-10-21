import { z } from 'zod';

import { isValidPhoneForCountry } from '@/lib/countries';
import { VALIDATION_MESSAGES as M } from '@/messages/validation.messages';

/**
 * Zod field builders whose messages name the field:
 * "Phone number can't be blank", "Phone number is too long (maximum is 30 characters)".
 * Pass the label the user sees on the form.
 */

const PHONE_PATTERN = /^\+?[\d\s\-()]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function requiredText(label: string, max: number, min = 1) {
  const base = z.string({ error: M.BLANK(label) }).trim().min(1, M.BLANK(label));
  return (min > 1 ? base.min(min, M.TOO_SHORT(label, min)) : base).max(max, M.TOO_LONG(label, max));
}

export function optionalText(label: string, max: number) {
  return z.string().trim().max(max, M.TOO_LONG(label, max));
}

/** Optional text that may also be null/undefined (nullable form fields). */
export function nullableText(label: string, max: number) {
  return z.string().trim().max(max, M.TOO_LONG(label, max)).optional().nullable();
}

function phoneRules(label: string) {
  return z
    .string()
    .trim()
    .min(5, M.TOO_SHORT(label, 5))
    .max(30, M.TOO_LONG(label, 30))
    .regex(PHONE_PATTERN, M.INVALID_PHONE(label));
}

export function requiredPhone(label: string) {
  return z.string({ error: M.BLANK(label) }).trim().min(1, M.BLANK(label)).pipe(phoneRules(label));
}

export function optionalPhone(label: string) {
  return z.union([z.literal(''), phoneRules(label)]);
}

/**
 * superRefine for a form with a country: each listed phone field must be a valid number
 * of that country. Empty fields are left to their own required / optional rules.
 *   schema.superRefine(phonesMatchCountry({ phoneNo: 'Phone number' }))
 */
export function phonesMatchCountry(fields: Record<string, string>) {
  return (data: { country?: string | null }, ctx: z.RefinementCtx) => {
    for (const [field, label] of Object.entries(fields)) {
      const value = (data as Record<string, unknown>)[field];
      if (typeof value !== 'string' || !value.trim() || isValidPhoneForCountry(value, data.country)) continue;
      ctx.addIssue({
        code: 'custom',
        path: [field],
        message: data.country?.trim() ? M.PHONE_NOT_IN_COUNTRY(label) : M.PHONE_NEEDS_CODE(label),
      });
    }
  };
}

export function requiredEmail(label = 'Email') {
  return z
    .string({ error: M.BLANK(label) })
    .trim()
    .min(1, M.BLANK(label))
    .max(255, M.TOO_LONG(label, 255))
    .pipe(z.email(M.INVALID_EMAIL(label)));
}

export function optionalEmail(label = 'Email') {
  return z.union([z.literal(''), z.email(M.INVALID_EMAIL(label)).max(255, M.TOO_LONG(label, 255))]);
}

/** YYYY-MM-DD from a date input. */
export function requiredDate(label: string) {
  return z
    .string({ error: M.BLANK(label) })
    .min(1, M.BLANK(label))
    .regex(DATE_PATTERN, M.INVALID_DATE(label));
}

export function optionalDate(label: string) {
  return z.union([z.literal(''), z.string().regex(DATE_PATTERN, M.INVALID_DATE(label))]);
}

/** Numeric id picked from a select (0 / NaN means nothing picked). */
export function requiredId(label: string) {
  return z.number({ error: M.NOT_SELECTED(label) }).int().min(1, M.NOT_SELECTED(label));
}

/** Numeric id held as a string by a native select; coerces to number. */
export function requiredIdString(label: string) {
  return z.coerce.number<string>({ error: M.NOT_SELECTED(label) }).int().positive(M.NOT_SELECTED(label));
}

/** Positive amount with at most 2 decimals, typed as a string (mirrors the server's moneySchema). */
export function moneyString(label: string, max = 9_999_999_999.99) {
  return z
    .string({ error: M.BLANK(label) })
    .trim()
    .min(1, M.BLANK(label))
    .pipe(
      z.coerce
        .number<string>({ error: M.INVALID(label) })
        .positive(M.AMOUNT_POSITIVE(label))
        .max(max, M.AMOUNT_TOO_LARGE(label))
        .refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, M.AMOUNT_DECIMALS(label)),
    );
}

/** Positive quantity with at most 3 decimals (e.g. 1.25 kg), typed as a string. */
export function quantityString(label: string, max = 9_999_999) {
  return z
    .string({ error: M.BLANK(label) })
    .trim()
    .min(1, M.BLANK(label))
    .pipe(
      z.coerce
        .number<string>({ error: M.INVALID(label) })
        .positive(M.AMOUNT_POSITIVE(label))
        .max(max, M.AMOUNT_TOO_LARGE(label))
        .refine((v) => Math.abs(v * 1000 - Math.round(v * 1000)) < 1e-6, M.QUANTITY_DECIMALS(label)),
    );
}

export function password(label: string, min = 8, max = 128) {
  return z
    .string({ error: M.BLANK(label) })
    .min(1, M.BLANK(label))
    .min(min, M.TOO_SHORT(label, min))
    .max(max, M.TOO_LONG(label, max));
}
