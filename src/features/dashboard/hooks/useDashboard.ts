'use client';

import { useQuery } from '@tanstack/react-query';

import { dashboardService } from '@/features/dashboard/services/dashboard.service';
import { queryKeys } from '@/lib/query-keys';

export function useDashboardOverview() {
  return useQuery({
    queryKey: queryKeys.dashboard.overview,
    queryFn: () => dashboardService.overview(),
  });
}

/** Counts for the sidebar badge and notification bell; refreshed every minute. */
export function useDashboardAlerts() {
  return useQuery({
    queryKey: queryKeys.dashboard.alerts,
    queryFn: () => dashboardService.alerts(),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useGlobalSearch(term: string) {
  const q = term.trim();
  return useQuery({
    queryKey: queryKeys.dashboard.search(q),
    queryFn: () => dashboardService.search(q),
    enabled: q.length >= 2,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}
