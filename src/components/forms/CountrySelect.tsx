import * as React from 'react';

import { Select, type SelectProps } from '@/components/ui/select';
import { COUNTRY_NAMES, DEFAULT_COUNTRY } from '@/lib/countries';

interface CountrySelectProps extends Omit<SelectProps, 'children'> {
  /** Saved value not in the list (typed before the dropdown existed), kept as an option. */
  savedValue?: string | null;
  /** Adds an empty option, for optional fields and filters. */
  allowEmpty?: boolean;
  emptyLabel?: string;
}

/** Country dropdown storing the country name; the UAE is pinned first. Works with RHF register(). */
export const CountrySelect = React.forwardRef<HTMLSelectElement, CountrySelectProps>(
  ({ savedValue, allowEmpty, emptyLabel = 'Select country…', ...props }, ref) => {
    const legacy = savedValue?.trim() && !COUNTRY_NAMES.includes(savedValue.trim()) ? savedValue.trim() : null;
    return (
      <Select ref={ref} autoComplete="country-name" {...props}>
        {allowEmpty ? <option value="">{emptyLabel}</option> : null}
        {legacy ? <option value={legacy}>{legacy}</option> : null}
        <option value={DEFAULT_COUNTRY}>{DEFAULT_COUNTRY}</option>
        <option disabled>──────────</option>
        {COUNTRY_NAMES.filter((name) => name !== DEFAULT_COUNTRY).map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </Select>
    );
  },
);
CountrySelect.displayName = 'CountrySelect';
