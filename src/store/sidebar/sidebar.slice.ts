import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface SidebarState {
  isOpen: boolean;
  isMobileOpen: boolean;
}

const initialState: SidebarState = {
  isOpen: true,
  isMobileOpen: false,
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
    setMobileSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { setSidebarOpen, setMobileSidebarOpen, toggleSidebar } = sidebarSlice.actions;
export const sidebarReducer = sidebarSlice.reducer;
