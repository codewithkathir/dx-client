import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface LoadingState {
  apiRequestCount: number;
  routeLoading: boolean;
  authLoading: boolean;
  suspenseCount: number;
}

const initialState: LoadingState = {
  apiRequestCount: 0,
  routeLoading: false,
  authLoading: false,
  suspenseCount: 0,
};

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    incrementApiLoading: (state) => {
      state.apiRequestCount += 1;
    },
    decrementApiLoading: (state) => {
      state.apiRequestCount = Math.max(0, state.apiRequestCount - 1);
    },
    setRouteLoading: (state, action: PayloadAction<boolean>) => {
      state.routeLoading = action.payload;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.authLoading = action.payload;
    },
    incrementSuspenseLoading: (state) => {
      state.suspenseCount += 1;
    },
    decrementSuspenseLoading: (state) => {
      state.suspenseCount = Math.max(0, state.suspenseCount - 1);
    },
  },
});

export const {
  incrementApiLoading,
  decrementApiLoading,
  setRouteLoading,
  setAuthLoading,
  incrementSuspenseLoading,
  decrementSuspenseLoading,
} = loadingSlice.actions;

export const loadingReducer = loadingSlice.reducer;
