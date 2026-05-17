export const ADMIN_ROUTES = {
  DASHBOARD: '/admin/dashboard',
  EMPLOYEES: '/admin/employees',
  CATEGORIES: '/admin/categories',
  USERS: '/admin/users',
  EXPENSES: '/admin/expenses',
  SETTINGS: '/admin/settings',
  LOGIN: '/admin/login',
  FORGOT_PASSWORD: '/admin/forgot-password',
  RESET_PASSWORD: '/admin/reset-password',
} as const;

export const USER_ROUTES = {
  HOME: '/app/home',
  EXPENSES: '/app/expenses',
  PROFILE: '/app/profile',
  ORDERS: '/app/orders',
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
} as const;

export const PUBLIC_ROUTES = [
  USER_ROUTES.LOGIN,
  USER_ROUTES.FORGOT_PASSWORD,
  USER_ROUTES.RESET_PASSWORD,
  ADMIN_ROUTES.LOGIN,
  ADMIN_ROUTES.FORGOT_PASSWORD,
  ADMIN_ROUTES.RESET_PASSWORD,
] as const;

export const ADMIN_PROTECTED_PREFIX = '/admin';
export const USER_PROTECTED_PREFIX = '/app';
