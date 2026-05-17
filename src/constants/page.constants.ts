export const PAGE_TITLES = {
  ADMIN_DASHBOARD: 'Dashboard',
  ADMIN_EMPLOYEES: 'Employees',
  ADMIN_CATEGORIES: 'Categories',
  ADMIN_USERS: 'Users',
  ADMIN_EXPENSES: 'Expenses',
  ADMIN_SETTINGS: 'Settings',
  USER_HOME: 'Home',
  USER_EXPENSES: 'My expenses',
  USER_PROFILE: 'Profile',
  USER_ORDERS: 'Orders',
} as const;

export const PAGE_DESCRIPTIONS = {
  ADMIN_DASHBOARD: 'Admin dashboard overview placeholder.',
  ADMIN_EMPLOYEES: 'Manage employee records, documents, and compliance data.',
  ADMIN_CATEGORIES:
    'Manage main categories, sub categories, and sub sub categories for your catalog hierarchy.',
  ADMIN_USERS: 'User management module placeholder.',
  ADMIN_EXPENSES:
    'Review employee expense claims, update payment status, and track totals across your organization.',
  ADMIN_SETTINGS: 'Manage your admin profile and account security.',
  USER_HOME: 'Welcome to your employee dashboard.',
  USER_EXPENSES:
    'Submit and track your expense claims. Status is read-only and managed by administrators.',
  USER_PROFILE: 'View your profile and manage account security.',
  USER_ORDERS: 'Your orders and requests will appear here.',
} as const;
