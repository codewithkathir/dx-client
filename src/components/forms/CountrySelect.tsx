import * as React from 'react';

import { Select, type SelectProps } from '@/components/ui/select';
import { COUNTRIES, DEFAULT_COUNTRY, countryName } from '@/lib/countries';

interface CountrySelectProps extends Omit<SelectProps, 'children'> {
  /** Saved value not in the list (typed before the dropdown existed), kept as an option. */
  savedValue?: string | null;
  /** Adds an empty option, for optional fields and filters. */
  allowEmpty?: boolean;
  emptyLabel?: string;
}

/** Country dropdown storing the ISO code and showing the name; the UAE is pinned first. Works with RHF register(). */
export const CountrySelect = React.forwardRef<HTMLSelectElement, CountrySelectProps>(
  ({ savedValue, allowEmpty, emptyLabel = 'Select country…', ...props }, ref) => {
    const legacy = savedValue?.trim() && !COUNTRIES.some((c) => c.code === savedValue.trim()) ? savedValue.trim() : null;
    return (
      <Select ref={ref} autoComplete="country-name" {...props}>
        {allowEmpty ? <option value="">{emptyLabel}</option> : null}
        {legacy ? <option value={legacy}>{legacy}</option> : null}
        <option value={DEFAULT_COUNTRY}>{countryName(DEFAULT_COUNTRY)}</option>
        <option disabled>──────────</option>
        {COUNTRIES.filter((c) => c.code !== DEFAULT_COUNTRY).map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </Select>
    );
  },
);
CountrySelect.displayName = 'CountrySelect';
