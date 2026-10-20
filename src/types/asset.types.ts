import type { PaginationMeta } from '@/types/common.types';

export type AssetCategory =
  | 'laptop'
  | 'desktop'
  | 'phone'
  | 'tablet'
  | 'monitor'
  | 'accessory'
  | 'vehicle'
  | 'sim_card'
  | 'access_card'
  | 'tools'
  | 'furniture'
  | 'other';

export type AssetStatus = 'available' | 'assigned' | 'in_repair' | 'retired' | 'lost';
export type UnassignedAssetStatus = Exclude<AssetStatus, 'assigned'>;
export type AssetCondition = 'new' | 'good' | 'fair' | 'poor' | 'damaged';

export interface CurrentAssignment {
  assignmentId: number;
  employeeId: number;
  employeeName: string | null;
  employeeCode: string | null;
  assignedDate: string;
  expectedReturnDate: string | null;
  acknowledgedAt: string | null;
  isOverdue: boolean;
}

export interface Asset {
  id: number;
  assetNo: string;
  name: string;
  category: AssetCategory;
  brand: string | null;
  model: string | null;
  serialNo: string | null;
  purchaseDate: string | null;
  purchaseCost: number | null;
  warrantyExpiry: string | null;
  condition: AssetCondition;
  status: AssetStatus;
  notes: string | null;
  currentAssignment: CurrentAssignment | null;
  /** First photo, for list thumbnails. */
  coverImageId: number | null;
  imageCount: number;
  /** Latest odometer reading (vehicles); null when none recorded. */
  odometerKm: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssetAssignment {
  id: number;
  employeeId: number;
  employeeName: string | null;
  employeeCode: string | null;
  assignedDate: string;
  expectedReturnDate: string | null;
  conditionOut: AssetCondition;
  notes: string | null;
  assignedByName: string | null;
  acknowledgedAt: string | null;
  returnedDate: string | null;
  conditionIn: AssetCondition | null;
  returnNotes: string | null;
  returnedByName: string | null;
  odometerOut: number | null;
  odometerIn: number | null;
}

export interface AssetImage {
  id: number;
  originalName: string | null;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface AssetDetail extends Asset {
  history: AssetAssignment[];
  images: AssetImage[];
  /** Latest odometer reading (vehicles). */
  odometer: { readingKm: number; readingDate: string } | null;
}

export interface AssetSummary {
  total: number;
  totalValue: number;
  byStatus: Record<AssetStatus, number>;
  overdueReturns: number;
  awaitingAcknowledgement: number;
}

export interface AssetListFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: AssetStatus | '';
  category?: AssetCategory | '';
  employeeId?: number;
  order?: 'asc' | 'desc';
}

export interface AssetListResult {
  items: Asset[];
  meta: PaginationMeta;
}

export interface AssetPayload {
  assetNo?: string;
  name: string;
  category: AssetCategory;
  brand?: string | null;
  model?: string | null;
  serialNo?: string | null;
  purchaseDate?: string | null;
  purchaseCost?: number | null;
  warrantyExpiry?: string | null;
  condition: AssetCondition;
  status?: UnassignedAssetStatus;
  notes?: string | null;
}

export interface AssignAssetPayload {
  employeeId: number;
  assignedDate: string;
  expectedReturnDate?: string | null;
  condition?: AssetCondition;
  notes?: string | null;
  /** Vehicles: odometer at hand-over. */
  odometerKm?: number;
}

export interface ReturnAssetPayload {
  returnedDate: string;
  condition: AssetCondition;
  nextStatus: UnassignedAssetStatus;
  notes?: string | null;
  /** Vehicles: odometer when returned. */
  odometerKm?: number;
}

/** Employee app: one hand-over (current or past). */
export interface MyAsset {
  assignmentId: number;
  assetId: number;
  assetNo: string;
  name: string;
  category: AssetCategory;
  brand: string | null;
  model: string | null;
  serialNo: string | null;
  warrantyExpiry: string | null;
  assignedDate: string;
  expectedReturnDate: string | null;
  conditionOut: AssetCondition;
  notes: string | null;
  acknowledgedAt: string | null;
  returnedDate: string | null;
  conditionIn: AssetCondition | null;
  returnNotes: string | null;
  images: AssetImage[];
  /** Vehicles still with the employee: latest odometer reading. */
  odometer: { readingKm: number; readingDate: string } | null;
}

export interface MyAssets {
  current: MyAsset[];
  past: MyAsset[];
}
