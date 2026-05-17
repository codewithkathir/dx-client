import type { CatalogStatus } from '@/types/catalog.types';

export const CATALOG_STATUS_OPTIONS: { label: string; value: CatalogStatus | '' }[] = [
  { label: 'All statuses', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

export const CATALOG_STATUS_LABELS: Record<CatalogStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
};

export type CatalogTab = 'categories' | 'sub-categories' | 'sub-sub-categories';

export const CATALOG_TABS: {
  id: CatalogTab;
  label: string;
  description: string;
  level: string;
}[] = [
  {
    id: 'categories',
    label: 'Main categories',
    description: 'Top-level catalog groups',
    level: 'L1',
  },
  {
    id: 'sub-categories',
    label: 'Sub categories',
    description: 'Children of a main category',
    level: 'L2',
  },
  {
    id: 'sub-sub-categories',
    label: 'Sub sub categories',
    description: 'Third level in the tree',
    level: 'L3',
  },
];
