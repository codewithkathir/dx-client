import type { RootState } from '@/store';

export const selectAuthState = (state: RootState) => state.auth;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthPortal = (state: RootState) => state.auth.portal;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectUserPermissions = (state: RootState) => state.auth.user?.permissions ?? [];
