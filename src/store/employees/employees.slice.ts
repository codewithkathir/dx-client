import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { EmployeeListFilters } from '@/types/employee.types';

export interface EmployeesUiState {
  filters: EmployeeListFilters;
  selectedIds: number[];
}

const defaultFilters: EmployeeListFilters = {
  page: 1,
  limit: 10,
  search: '',
  status: '',
  country: '',
  cityState: '',
  companyName: '',
  order: 'desc',
  sortBy: 'created_at',
};

const initialState: EmployeesUiState = {
  filters: defaultFilters,
  selectedIds: [],
};

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setEmployeeFilters: (state, action: PayloadAction<Partial<EmployeeListFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetEmployeeFilters: (state) => {
      state.filters = { ...defaultFilters };
      state.selectedIds = [];
    },
    setSelectedEmployeeIds: (state, action: PayloadAction<number[]>) => {
      state.selectedIds = action.payload;
    },
    toggleEmployeeSelection: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter((x) => x !== id);
      } else {
        state.selectedIds.push(id);
      }
    },
    clearEmployeeSelection: (state) => {
      state.selectedIds = [];
    },
  },
});

export const {
  setEmployeeFilters,
  resetEmployeeFilters,
  setSelectedEmployeeIds,
  toggleEmployeeSelection,
  clearEmployeeSelection,
} = employeesSlice.actions;

export const employeesReducer = employeesSlice.reducer;
