import { combineReducers } from '@reduxjs/toolkit';

import { authReducer } from '@/store/auth/auth.slice';
import { employeesReducer } from '@/store/employees/employees.slice';
import { errorReducer } from '@/store/error/error.slice';
import { loadingReducer } from '@/store/loading/loading.slice';
import { modalReducer } from '@/store/modal/modal.slice';
import { sidebarReducer } from '@/store/sidebar/sidebar.slice';
import { themeReducer } from '@/store/theme/theme.slice';

export const rootReducer = combineReducers({
  auth: authReducer,
  employees: employeesReducer,
  theme: themeReducer,
  sidebar: sidebarReducer,
  modal: modalReducer,
  error: errorReducer,
  loading: loadingReducer,
});
