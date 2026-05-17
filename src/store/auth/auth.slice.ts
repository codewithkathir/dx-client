import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { AuthPortal } from '@/constants/auth.constants';
import { initialAuthState } from '@/store/auth/auth.constants';
import type { AuthState } from '@/store/auth/auth.types';
import type { AuthUser } from '@/types/auth.types';

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuthSession: (
      state,
      action: PayloadAction<{ user: AuthUser; portal: AuthPortal }>,
    ) => {
      state.user = action.payload.user;
      state.portal = action.payload.portal;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    clearAuthSession: (state) => {
      Object.assign(state, initialAuthState);
    },
  },
});

export const { setAuthLoading, setAuthSession, clearAuthSession } = authSlice.actions;
export const authReducer = authSlice.reducer;
export type { AuthState };
