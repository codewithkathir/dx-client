const V1 = '/v1';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${V1}/auth/login`,
    LOGOUT: `${V1}/auth/logout`,
    REFRESH: `${V1}/auth/refresh`,
    ME: `${V1}/auth/me`,
    REGISTER: `${V1}/auth/register`,
    FORGOT_PASSWORD: `${V1}/auth/forgot-password`,
    RESET_PASSWORD: `${V1}/auth/reset-password`,
    ADMIN_LOGIN: `${V1}/auth/admin/login`,
    ADMIN_LOGOUT: `${V1}/auth/admin/logout`,
    ADMIN_REFRESH: `${V1}/auth/admin/refresh-token`,
    ADMIN_ME: `${V1}/auth/admin/me`,
    ADMIN_PROFILE_PHOTO: `${V1}/auth/admin/me/profile-photo`,
    ADMIN_FORGOT_PASSWORD: `${V1}/auth/admin/forgot-password`,
    ADMIN_RESET_PASSWORD: `${V1}/auth/admin/reset-password`,
    ADMIN_CHANGE_PASSWORD: `${V1}/auth/admin/change-password`,
    EMPLOYEE_LOGIN: `${V1}/auth/employee/login`,
    EMPLOYEE_LOGOUT: `${V1}/auth/employee/logout`,
    EMPLOYEE_REFRESH: `${V1}/auth/employee/refresh-token`,
    EMPLOYEE_ME: `${V1}/auth/employee/me`,
    EMPLOYEE_PROFILE_PHOTO: `${V1}/auth/employee/me/profile-photo`,
    EMPLOYEE_FORGOT_PASSWORD: `${V1}/auth/employee/forgot-password`,
    EMPLOYEE_RESET_PASSWORD: `${V1}/auth/employee/reset-password`,
    EMPLOYEE_CHANGE_PASSWORD: `${V1}/auth/employee/change-password`,
  },
  USERS: {
    LIST: `${V1}/users`,
    DETAIL: (id: string | number) => `${V1}/users/${id}`,
  },
  EMPLOYEES: {
    LIST: '/admin/employees',
    DETAIL: (id: string | number) => `/admin/employees/${id}`,
    PROFILE_PHOTO: (id: string | number) => `/admin/employees/${id}/profile-photo`,
    BULK_DELETE: '/admin/employees/bulk-delete',
    BULK_STATUS: '/admin/employees/bulk-status',
    BULK_CREATE: '/admin/employees/bulk-create',
    EXPORT: '/admin/employees/export',
  },
  EMPLOYEE_EXPENSES: {
    LIST: `${V1}/employee/expenses`,
    DETAIL: (id: string | number) => `${V1}/employee/expenses/${id}`,
    SUPPORT_FILE: (id: string | number) => `${V1}/employee/expenses/${id}/support-file`,
  },
  ADMIN_EMPLOYEE_EXPENSES: {
    LIST: `${V1}/admin/employee-expenses`,
    SUMMARY: `${V1}/admin/employee-expenses/summary`,
    DETAIL: (id: string | number) => `${V1}/admin/employee-expenses/${id}`,
    STATUS: (id: string | number) => `${V1}/admin/employee-expenses/${id}/status`,
    SUPPORT_FILE: (id: string | number) =>
      `${V1}/admin/employee-expenses/${id}/support-file`,
  },
  ADMIN_DROPDOWNS: {
    CATEGORIES: `${V1}/admin/dropdowns/categories`,
    SUB_CATEGORIES: `${V1}/admin/dropdowns/sub-categories`,
    SUB_SUB_CATEGORIES: `${V1}/admin/dropdowns/sub-sub-categories`,
    PAYMENT_METHODS: `${V1}/admin/dropdowns/payment-methods`,
    WHOM: `${V1}/admin/dropdowns/whom`,
  },
  DROPDOWNS: {
    CATEGORIES: `${V1}/employee/dropdowns/categories`,
    SUB_CATEGORIES: `${V1}/employee/dropdowns/sub-categories`,
    SUB_SUB_CATEGORIES: `${V1}/employee/dropdowns/sub-sub-categories`,
    PAYMENT_METHODS: `${V1}/employee/dropdowns/payment-methods`,
    WHOM: `${V1}/employee/dropdowns/whom`,
  },
  CATEGORIES: {
    LIST: `${V1}/admin/categories`,
    DETAIL: (id: string | number) => `${V1}/admin/categories/${id}`,
    SUB_BY_CATEGORY: (categoryId: string | number) =>
      `${V1}/admin/categories/${categoryId}/sub-categories`,
  },
  SUB_CATEGORIES: {
    LIST: `${V1}/admin/sub-categories`,
    DETAIL: (id: string | number) => `${V1}/admin/sub-categories/${id}`,
  },
  SUB_SUB_CATEGORIES: {
    LIST: `${V1}/admin/sub-sub-categories`,
    DETAIL: (id: string | number) => `${V1}/admin/sub-sub-categories/${id}`,
  },
  PAYMENT_METHODS: {
    LIST: `${V1}/admin/payment-methods`,
    DETAIL: (id: string | number) => `${V1}/admin/payment-methods/${id}`,
  },
  HEALTH: '/health',
} as const;
