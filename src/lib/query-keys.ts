import type { AssetListFilters } from '@/types/asset.types';
import type { AccountEntryFilters, AccountListFilters } from '@/types/employee-account.types';
import type { ServiceTypeListFilters, VehicleExpenseFilters } from '@/types/vehicle.types';
import type { CatalogListFilters } from '@/types/catalog.types';
import type { EmployeeListFilters } from '@/types/employee.types';
import type {
  AdminExpenseListFilters,
  AdminExpenseSummaryFilters,
} from '@/types/expense.types';
import type { ExpenseListFilters } from '@/types/expense.types';
import type {
  BillListFilters,
  InvoiceListFilters,
  PartyListFilters,
} from '@/types/finance.types';

export const queryKeys = {
  auth: {
    profile: ['auth', 'profile'] as const,
    adminProfile: ['auth', 'admin', 'profile'] as const,
    employeeProfile: ['auth', 'employee', 'profile'] as const,
  },
  users: {
    all: ['users'] as const,
    detail: (id: string) => ['users', id] as const,
    list: (filters?: Record<string, unknown>) => ['users', 'list', filters] as const,
  },
  employees: {
    all: ['employees'] as const,
    detail: (id: number) => ['employees', id] as const,
    list: (filters?: EmployeeListFilters) => ['employees', 'list', filters] as const,
  },
  expenses: {
    all: ['expenses'] as const,
    detail: (id: number) => ['expenses', id] as const,
    list: (filters?: ExpenseListFilters) => ['expenses', 'list', filters] as const,
    summary: ['expenses', 'summary'] as const,
  },
  adminExpenses: {
    all: ['admin-expenses'] as const,
    detail: (id: number) => ['admin-expenses', id] as const,
    list: (filters?: AdminExpenseListFilters) =>
      ['admin-expenses', 'list', filters] as const,
    summary: (filters?: AdminExpenseSummaryFilters) =>
      ['admin-expenses', 'summary', filters] as const,
  },
  adminDropdowns: {
    categories: ['admin-dropdowns', 'categories'] as const,
    subCategories: (categoryId?: number) =>
      ['admin-dropdowns', 'sub-categories', categoryId] as const,
    subSubCategories: (categoryId?: number, subCategoryId?: number) =>
      ['admin-dropdowns', 'sub-sub-categories', categoryId, subCategoryId] as const,
    paymentMethods: ['admin-dropdowns', 'payment-methods'] as const,
    whom: ['admin-dropdowns', 'whom'] as const,
    countries: ['admin-dropdowns', 'countries'] as const,
  },
  dropdowns: {
    categories: ['dropdowns', 'categories'] as const,
    subCategories: (categoryId?: number) =>
      ['dropdowns', 'sub-categories', categoryId] as const,
    subSubCategories: (categoryId?: number, subCategoryId?: number) =>
      ['dropdowns', 'sub-sub-categories', categoryId, subCategoryId] as const,
    paymentMethods: ['dropdowns', 'payment-methods'] as const,
    whom: ['dropdowns', 'whom'] as const,
    myVehicles: ['dropdowns', 'my-vehicles'] as const,
    vehicles: ['dropdowns', 'vehicles'] as const,
    countries: ['dropdowns', 'countries'] as const,
  },
  assets: {
    all: ['assets'] as const,
    list: (filters?: AssetListFilters) => ['assets', 'list', filters] as const,
    summary: ['assets', 'summary'] as const,
    detail: (id: number) => ['assets', id] as const,
    mine: ['assets', 'mine'] as const,
  },
  vehicles: {
    all: ['vehicles'] as const,
    serviceRecords: (assetId: number) => ['vehicles', assetId, 'service-records'] as const,
    odometer: (assetId: number, page: number) => ['vehicles', assetId, 'odometer', page] as const,
    serviceTypes: (filters?: ServiceTypeListFilters) => ['vehicles', 'service-types', filters] as const,
    expenses: (assetId: number, filters?: VehicleExpenseFilters) => ['vehicles', assetId, 'expenses', filters] as const,
    expenseSummary: (assetId: number) => ['vehicles', assetId, 'expenses', 'summary'] as const,
    mySummary: (assetId: number) => ['vehicles', 'mine', assetId] as const,
  },
  employeeAccounts: {
    all: ['employee-accounts'] as const,
    list: (filters?: AccountListFilters) => ['employee-accounts', 'list', filters] as const,
    summary: ['employee-accounts', 'summary'] as const,
    detail: (employeeId: number) => ['employee-accounts', employeeId] as const,
    entries: (employeeId: number, filters?: AccountEntryFilters) => ['employee-accounts', employeeId, 'entries', filters] as const,
    approvalPreview: (expenseId: number) => ['employee-accounts', 'approval-preview', expenseId] as const,
    mine: ['employee-accounts', 'mine'] as const,
    myEntries: (page: number) => ['employee-accounts', 'mine', 'entries', page] as const,
  },
  invoiceBranding: ['invoice-branding'] as const,
  suppliers: {
    all: ['suppliers'] as const,
    list: (filters?: PartyListFilters) => ['suppliers', 'list', filters] as const,
    options: ['suppliers', 'options'] as const,
  },
  payables: {
    all: ['payables'] as const,
    list: (filters?: BillListFilters) => ['payables', 'list', filters] as const,
    detail: (id: number) => ['payables', 'detail', id] as const,
    summary: ['payables', 'summary'] as const,
  },
  customers: {
    all: ['customers'] as const,
    list: (filters?: PartyListFilters) => ['customers', 'list', filters] as const,
    options: ['customers', 'options'] as const,
  },
  receivables: {
    all: ['receivables'] as const,
    list: (filters?: InvoiceListFilters) => ['receivables', 'list', filters] as const,
    detail: (id: number) => ['receivables', 'detail', id] as const,
    summary: ['receivables', 'summary'] as const,
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    overview: ['dashboard', 'overview'] as const,
    alerts: ['dashboard', 'alerts'] as const,
    search: (q: string) => ['dashboard', 'search', q] as const,
  },
  catalog: {
    all: ['catalog'] as const,
    categories: (filters?: CatalogListFilters) => ['catalog', 'categories', filters] as const,
    subCategories: (filters?: CatalogListFilters) =>
      ['catalog', 'sub-categories', filters] as const,
    subSubCategories: (filters?: CatalogListFilters) =>
      ['catalog', 'sub-sub-categories', filters] as const,
    categoryOptions: ['catalog', 'category-options'] as const,
    subCategoryOptions: (categoryId?: number) =>
      ['catalog', 'sub-category-options', categoryId] as const,
  },
} as const;
