import { Badge } from '@/components/ui/badge';
import { EMPLOYEE_STATUS_LABELS } from '@/features/employees/constants/employee.constants';
import type { EmployeeStatus } from '@/types/employee.types';

const VARIANT_MAP: Record<
  EmployeeStatus,
  'success' | 'muted' | 'warning' | 'destructive'
> = {
  active: 'success',
  inactive: 'muted',
  suspended: 'warning',
};

interface StatusBadgeProps {
  status: EmployeeStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={VARIANT_MAP[status]}>{EMPLOYEE_STATUS_LABELS[status]}</Badge>;
}
