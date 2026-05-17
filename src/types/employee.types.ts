import type { PaginationMeta } from '@/types/common.types';

export const EMPLOYEE_STATUSES = ['active', 'inactive', 'suspended'] as const;
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

export interface Employee {
  id: number;
  empName: string;
  companyName: string;
  dob: string;
  homeAddress: string;
  cityState: string;
  country: string;
  phoneNo: string;
  whatsappNo: string | null;
  emiratesIdNo: string;
  emiratesIdExpiryDate: string;
  visaExpiryDate: string;
  passportNo: string;
  passportExpiryDate: string;
  drivingLicenseNo: string | null;
  drivingLicenseExpiryDate: string | null;
  email: string;
  status: EmployeeStatus;
  comments: string | null;
  role: string;
  profilePhoto: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeListFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: EmployeeStatus | '';
  country?: string;
  cityState?: string;
  companyName?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  visaExpiry?: string;
  passportExpiry?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface EmployeeListResult {
  items: Employee[];
  meta: PaginationMeta;
}

export interface CreateEmployeePayload {
  empName: string;
  companyName: string;
  dob: string;
  homeAddress: string;
  cityState: string;
  country: string;
  phoneNo: string;
  whatsappNo?: string;
  emiratesIdNo: string;
  emiratesIdExpiryDate: string;
  visaExpiryDate: string;
  passportNo: string;
  passportExpiryDate: string;
  drivingLicenseNo?: string;
  drivingLicenseExpiryDate?: string;
  email: string;
  password: string;
  status?: EmployeeStatus;
  comments?: string;
  role?: string;
}

export type UpdateEmployeePayload = Partial<
  Omit<CreateEmployeePayload, 'password' | 'whatsappNo' | 'drivingLicenseNo' | 'drivingLicenseExpiryDate' | 'comments'>
> & {
  password?: string;
  whatsappNo?: string | null;
  drivingLicenseNo?: string | null;
  drivingLicenseExpiryDate?: string | null;
  comments?: string | null;
};

export interface BulkDeletePayload {
  ids: number[];
}

export interface BulkStatusPayload {
  ids: number[];
  status: EmployeeStatus;
}

export interface BulkCreateResult {
  created: Employee[];
  failed: Array<{ index: number; email: string; message: string }>;
}

export interface BulkActionResult {
  affected: number;
}
