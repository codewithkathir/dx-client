export const PAGE_TITLES = {
  ADMIN_DASHBOARD: 'Dashboard',
  ADMIN_EMPLOYEES: 'Employees',
  ADMIN_CATEGORIES: 'Categories',
  ADMIN_USERS: 'Users',
  ADMIN_EXPENSES: 'Expenses',
  ADMIN_PAYABLES: 'Purchase Bills',
  ADMIN_SUPPLIERS: 'Suppliers',
  ADMIN_RECEIVABLES: 'Receivables',
  ADMIN_CUSTOMERS: 'Customers',
  ADMIN_PRODUCTS: 'Products',
  ADMIN_SETTINGS: 'Settings',
  USER_HOME: 'Home',
  USER_EXPENSES: 'My expenses',
  USER_PROFILE: 'Profile',
} as const;

export const PAGE_DESCRIPTIONS = {
  ADMIN_DASHBOARD: 'Admin dashboard overview placeholder.',
  ADMIN_EMPLOYEES: 'Manage employee records, documents, and compliance data.',
  ADMIN_CATEGORIES:
    'Manage main categories, sub categories, and sub sub categories for your catalog hierarchy.',
  ADMIN_USERS: 'User management module placeholder.',
  ADMIN_EXPENSES:
    'Review employee expense claims. Approving a claim creates a reimbursement bill in Purchase Bills.',
  ADMIN_PAYABLES:
    'Money the company owes: supplier bills and employee reimbursements, with payments and balances.',
  ADMIN_SUPPLIERS: 'Companies you buy from. Each supplier can have bills in Purchase Bills.',
  ADMIN_RECEIVABLES:
    'Money owed to the company: customer invoices, receipts and balances. Download tax invoices as PDF.',
  ADMIN_CUSTOMERS: 'Companies you sell to, with their TRN and payment terms for invoices.',
  ADMIN_PRODUCTS: 'Your price list. Pick products when you raise an invoice; prices fill in and can be changed per invoice.',
  ADMIN_SETTINGS: 'Manage your admin profile and account security.',
  USER_HOME: 'Welcome to your employee dashboard.',
  USER_EXPENSES:
    'Submit and track your expense claims. You can edit or delete a claim until an administrator approves it.',
  USER_PROFILE: 'View your profile and manage account security.',
} as const;
