import { Badge } from '@/components/ui/badge';
import { CATALOG_STATUS_LABELS } from '@/features/catalog/constants/catalog.constants';
import type { CatalogStatus } from '@/types/catalog.types';

const VARIANT_MAP: Record<CatalogStatus, 'success' | 'muted'> = {
  active: 'success',
  inactive: 'muted',
};

interface CatalogStatusBadgeProps {
  status: CatalogStatus;
}

export function CatalogStatusBadge({ status }: CatalogStatusBadgeProps) {
  return <Badge variant={VARIANT_MAP[status]}>{CATALOG_STATUS_LABELS[status]}</Badge>;
}
