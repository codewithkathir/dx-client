import type { CatalogListFilters } from '@/types/catalog.types';
import type { EmployeeListFilters } from '@/types/employee.types';
import type {
  AdminExpenseListFilters,
  AdminExpenseSummaryFilters,
} from '@/types/expense.types';
import type { ExpenseListFilters } from '@/types/expense.types';

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
  },
  dropdowns: {
    categories: ['dropdowns', 'categories'] as const,
    subCategories: (categoryId?: number) =>
      ['dropdowns', 'sub-categories', categoryId] as const,
    subSubCategories: (categoryId?: number, subCategoryId?: number) =>
      ['dropdowns', 'sub-sub-categories', categoryId, subCategoryId] as const,
    paymentMethods: ['dropdowns', 'payment-methods'] as const,
    whom: ['dropdowns', 'whom'] as const,
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
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
