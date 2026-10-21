'use client';

import * as React from 'react';

import { Select, type SelectProps } from '@/components/ui/select';
import { AUTH_PORTAL, type AuthPortal } from '@/constants/auth.constants';
import { useCountries } from '@/features/countries/hooks/useCountries';
import { DEFAULT_COUNTRY } from '@/lib/countries';

interface CountrySelectProps extends Omit<SelectProps, 'children'> {
  /** The record's saved country code; pinned first so the form keeps it while the list loads. */
  savedValue?: string | null;
  /** Adds an empty option, for optional fields and filters. */
  allowEmpty?: boolean;
  emptyLabel?: string;
  /** Which portal's dropdown API to load the countries from. */
  portal?: AuthPortal;
}

/**
 * Country dropdown loaded from the database, storing the ISO code and showing the name.
 * The saved country and the UAE are pinned first. Works with RHF register().
 */
export const CountrySelect = React.forwardRef<HTMLSelectElement, CountrySelectProps>(
  ({ savedValue, allowEmpty, emptyLabel = 'Select country…', portal = AUTH_PORTAL.ADMIN, ...props }, ref) => {
    const { countries, nameOf } = useCountries(portal);
    const pinned = [...new Set([savedValue?.trim().toUpperCase(), DEFAULT_COUNTRY].filter((c): c is string => !!c))];
    return (
      <Select ref={ref} autoComplete="country" {...props}>
        {allowEmpty ? <option value="">{emptyLabel}</option> : null}
        {pinned.map((code) => (
          <option key={code} value={code}>
            {nameOf(code)}
          </option>
        ))}
        <option disabled>──────────</option>
        {countries
          .filter((c) => !pinned.includes(c.code))
          .map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
      </Select>
    );
  },
);
CountrySelect.displayName = 'CountrySelect';
