'use client';

import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { AUTH_PORTAL, type AuthPortal } from '@/constants/auth.constants';
import { countryService } from '@/features/countries/services/country.service';
import { queryKeys } from '@/lib/query-keys';

/**
 * Countries from the database, plus `nameOf` to show a stored ISO code ("AE") as its name.
 * The list rarely changes, so it is cached for the session.
 */
export function useCountries(portal: AuthPortal = AUTH_PORTAL.ADMIN) {
  const query = useQuery({
    queryKey: portal === AUTH_PORTAL.ADMIN ? queryKeys.adminDropdowns.countries : queryKeys.dropdowns.countries,
    queryFn: () => countryService.list(portal),
    staleTime: 60 * 60_000,
  });
  const countries = useMemo(() => query.data ?? [], [query.data]);
  const names = useMemo(() => new Map(countries.map((c) => [c.code, c.name])), [countries]);
  /** Unknown codes (or the list still loading) fall back to the code itself. */
  const nameOf = useCallback(
    (code: string | null | undefined) => (code ? (names.get(code.toUpperCase()) ?? code) : ''),
    [names],
  );
  return { ...query, countries, nameOf };
}
