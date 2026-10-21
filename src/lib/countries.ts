import { countries, getCountryCode } from 'countries-list';
import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';

/** Default for new records (ISO code); also pinned to the top of the country dropdown. */
export const DEFAULT_COUNTRY = 'AE';

/** Every country, A–Z by name. The ISO 3166-1 alpha-2 `code` is the value stored in the database. */
export const COUNTRIES: { code: string; name: string }[] = Object.entries(countries)
  .map(([code, c]) => ({ code, name: c.name }))
  .sort((a, b) => a.name.localeCompare(b.name));

/** Display name for a stored ISO code ("AE" → "United Arab Emirates"); unknown values pass through. */
export function countryName(country: string | null | undefined): string {
  const value = country?.trim() ?? '';
  return countries[value.toUpperCase() as keyof typeof countries]?.name ?? value;
}

/** Short names stored before the country dropdown. Mirrors the server's phone.util. */
const COUNTRY_ALIASES: Record<string, CountryCode> = {
  uae: 'AE',
  'u.a.e': 'AE',
  'u.a.e.': 'AE',
  ksa: 'SA',
  uk: 'GB',
  usa: 'US',
};

export function countryCodeFor(country: string | null | undefined): CountryCode | undefined {
  const name = country?.trim();
  if (!name) return undefined;
  const alias = COUNTRY_ALIASES[name.toLowerCase()];
  if (alias) return alias;
  if (/^[A-Za-z]{2}$/.test(name)) return name.toUpperCase() as CountryCode;
  const code = getCountryCode(name);
  return code ? (code as CountryCode) : undefined;
}

/**
 * Valid when the number is a real number of the country, written nationally
 * ("050 123 4567") or with its dialling code ("+971 50 123 4567").
 * With no known country it must be a full international number.
 */
export function isValidPhoneForCountry(phone: string, country: string | null | undefined): boolean {
  const code = countryCodeFor(country);
  const parsed = parsePhoneNumberFromString(phone, code);
  if (!parsed?.isValid()) return false;
  return !code || parsed.country === code || parsed.getPossibleCountries().includes(code);
}
