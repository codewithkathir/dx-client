import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@/store';

const selectLoadingState = (state: RootState) => state.loading;

export const selectIsGlobalLoading = createSelector(
  [selectLoadingState],
  (loading) =>
    loading.apiRequestCount > 0 ||
    loading.routeLoading ||
    loading.authLoading ||
    loading.suspenseCount > 0,
);
