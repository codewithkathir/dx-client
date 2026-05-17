import type { RootState } from '@/store';

export const selectGlobalError = (state: RootState) => state.error.globalError;
