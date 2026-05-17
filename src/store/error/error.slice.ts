import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { NormalizedApiError } from '@/types/api.types';

interface ErrorState {
  globalError: NormalizedApiError | null;
}

const initialState: ErrorState = {
  globalError: null,
};

const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    setGlobalError: (state, action: PayloadAction<NormalizedApiError | null>) => {
      state.globalError = action.payload;
    },
    clearGlobalError: (state) => {
      state.globalError = null;
    },
  },
});

export const { setGlobalError, clearGlobalError } = errorSlice.actions;
export const errorReducer = errorSlice.reducer;
