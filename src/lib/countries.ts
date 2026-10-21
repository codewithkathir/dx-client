import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';

/** Default for new records (ISO code); also pinned to the top of the country dropdown. The list itself comes from the API (`useCountries`). */
export const DEFAULT_COUNTRY = 'AE';

/**
 * Valid when the number is a real number of the country (ISO code, e.g. "AE"), written
 * nationally ("050 123 4567") or with its dialling code ("+971 50 123 4567").
 * With no known country it must be a full international number.
 */
export function isValidPhoneForCountry(phone: string, countryCode: string | null | undefined): boolean {
  const code = (countryCode?.trim().toUpperCase() || undefined) as CountryCode | undefined;
  const parsed = parsePhoneNumberFromString(phone, code);
  if (!parsed?.isValid()) return false;
  return !code || parsed.country === code || parsed.getPossibleCountries().includes(code);
}
