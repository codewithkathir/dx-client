import type { AssetCategory } from '@/types/asset.types';
import type { PaginationMeta } from '@/types/common.types';
import type { ExpenseStage } from '@/types/expense.types';

export type ServiceTypeStatus = 'active' | 'inactive';
export type OdometerSource = 'manual' | 'service' | 'assign' | 'return' | 'employee' | 'expense';

/** Oil change, insurance, registration… with the default interval to the next one. */
export interface ServiceType {
  id: number;
  code: string;
  name: string;
  /** null = offered for every asset category. */
  category: AssetCategory | null;
  intervalDays: number | null;
  intervalKm: number | null;
  sortOrder: number;
  status: ServiceTypeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceTypeListFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: ServiceTypeStatus | '';
  category?: AssetCategory | '';
}

export interface ServiceTypeListResult {
  items: ServiceType[];
  meta: PaginationMeta;
}

export interface ServiceTypePayload {
  code: string;
  name: string;
  category: AssetCategory | null;
  intervalDays: number | null;
  intervalKm: number | null;
  sortOrder?: number;
  status?: ServiceTypeStatus;
}

/** One maintenance or compliance entry: start = done/issued, end = next due/expiry. */
export interface ServiceRecord {
  id: number;
  assetId: number;
  serviceTypeId: number;
  serviceTypeCode: string;
  serviceTypeName: string;
  employeeId: number | null;
  employeeName: string | null;
  employeeCode: string | null;
  startDate: string;
  endDate: string | null;
  odometerKm: number | null;
  nextDueKm: number | null;
  cost: number | null;
  referenceNo: string | null;
  notes: string | null;
  /** The expense claim this record came from, if any. */
  expenseId: number | null;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRecordListResult {
  items: ServiceRecord[];
  meta: PaginationMeta;
}

export interface ServiceRecordPayload {
  serviceTypeId: number;
  employeeId?: number | null;
  startDate: string;
  /** Leave out to default from the type's day interval; null = no due date. */
  endDate?: string | null;
  odometerKm?: number | null;
  /** Leave out to default from the type's km interval. */
  nextDueKm?: number | null;
  cost?: number | null;
  referenceNo?: string | null;
  notes?: string | null;
  allowOdometerDecrease?: boolean;
}

export interface OdometerReading {
  id: number;
  assetId: number;
  readingKm: number;
  readingDate: string;
  source: OdometerSource;
  serviceRecordId: number | null;
  assignmentId: number | null;
  expenseId: number | null;
  employeeId: number | null;
  employeeName: string | null;
  notes: string | null;
  createdByName: string | null;
  createdAt: string;
}

export interface OdometerReadingListResult {
  items: OdometerReading[];
  meta: PaginationMeta;
}

export interface OdometerReadingPayload {
  readingKm: number;
  readingDate: string;
  employeeId?: number | null;
  notes?: string | null;
  allowDecrease?: boolean;
}

export interface LatestOdometer {
  readingKm: number;
  readingDate: string;
}

/** Employee app: the driver reports the km of the vehicle they hold. */
export interface MyOdometerPayload {
  readingKm: number;
  readingDate?: string;
  notes?: string | null;
}

/** An expense claim made for a vehicle (vehicle screen). */
export interface VehicleExpense {
  id: number;
  date: string;
  amount: number;
  description: string | null;
  odometerKm: number | null;
  stage: ExpenseStage;
  hasReceipt: boolean;
  employeeId: number;
  employeeName: string | null;
  categoryName: string;
  subCategoryName: string;
  subSubCategoryName: string | null;
  serviceRecordId: number | null;
  serviceTypeName: string | null;
}

export interface VehicleExpenseFilters {
  page?: number;
  limit?: number;
  stage?: ExpenseStage | '';
  dateFrom?: string;
  dateTo?: string;
}

export interface VehicleExpenseListResult {
  items: VehicleExpense[];
  meta: PaginationMeta;
}

export interface ExpenseTotals {
  count: number;
  amount: number;
}

/** Running cost: approved/paid claims, plus service costs entered by admins. */
export interface VehicleExpenseSummary {
  thisMonth: ExpenseTotals;
  thisYear: ExpenseTotals;
  allTime: ExpenseTotals;
  pending: ExpenseTotals;
  byCategory: Array<{ categoryName: string; count: number; amount: number }>;
  manualServiceCostThisYear: number;
  kmThisYear: number | null;
  costPerKm: number | null;
}

/** Employee claim form: the selected vehicle's km, my spend on it, and what's due. */
export interface EmployeeVehicleSummary {
  assetId: number;
  assetNo: string;
  name: string;
  odometer: LatestOdometer | null;
  thisMonth: ExpenseTotals;
  thisYear: ExpenseTotals;
  pending: ExpenseTotals;
  recentClaims: Array<{
    id: number;
    date: string;
    amount: number;
    categoryName: string;
    subCategoryName: string;
    stage: ExpenseStage;
  }>;
  due: Array<{ serviceTypeName: string; startDate: string; endDate: string | null; nextDueKm: number | null }>;
}
