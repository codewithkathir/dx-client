import type { RootState } from '@/store';

export const selectSidebarOpen = (state: RootState) => state.sidebar.isOpen;
export const selectMobileSidebarOpen = (state: RootState) => state.sidebar.isMobileOpen;
