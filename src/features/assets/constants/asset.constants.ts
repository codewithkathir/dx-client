import {
  Car,
  Cpu,
  CreditCard,
  Headphones,
  Laptop,
  Monitor,
  Package,
  Smartphone,
  Sofa,
  Tablet,
  TabletSmartphone,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

import type { AssetCategory, AssetCondition, AssetStatus, UnassignedAssetStatus } from '@/types/asset.types';

/** Matches the server: JPG/PNG/WebP, up to 5 MB each, 6 photos per asset. */
export const ASSET_IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp';
export const ASSET_IMAGE_MAX_MB = 5;
export const ASSET_IMAGE_MAX_COUNT = 6;

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  laptop: 'Laptop',
  desktop: 'Desktop',
  phone: 'Phone',
  tablet: 'Tablet',
  monitor: 'Monitor',
  accessory: 'Accessory',
  vehicle: 'Vehicle',
  sim_card: 'SIM card',
  access_card: 'Access card',
  tools: 'Tools',
  furniture: 'Furniture',
  other: 'Other',
};

export const ASSET_CATEGORY_ICONS: Record<AssetCategory, LucideIcon> = {
  laptop: Laptop,
  desktop: Cpu,
  phone: Smartphone,
  tablet: Tablet,
  monitor: Monitor,
  accessory: Headphones,
  vehicle: Car,
  sim_card: TabletSmartphone,
  access_card: CreditCard,
  tools: Wrench,
  furniture: Sofa,
  other: Package,
};

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  available: 'Available',
  assigned: 'Assigned',
  in_repair: 'In repair',
  retired: 'Retired',
  lost: 'Lost',
};

export const ASSET_STATUS_VARIANT: Record<AssetStatus, 'success' | 'secondary' | 'warning' | 'muted' | 'destructive'> = {
  available: 'success',
  assigned: 'secondary',
  in_repair: 'warning',
  retired: 'muted',
  lost: 'destructive',
};

export const ASSET_CONDITION_LABELS: Record<AssetCondition, string> = {
  new: 'New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
  damaged: 'Damaged',
};

export const ASSET_CONDITION_OPTIONS = (Object.keys(ASSET_CONDITION_LABELS) as AssetCondition[]).map((value) => ({
  value,
  label: ASSET_CONDITION_LABELS[value],
}));

export const UNASSIGNED_STATUS_OPTIONS: Array<{ value: UnassignedAssetStatus; label: string }> = [
  { value: 'available', label: 'Available' },
  { value: 'in_repair', label: 'In repair' },
  { value: 'retired', label: 'Retired' },
  { value: 'lost', label: 'Lost' },
];
