import type { OdometerSource, ServiceRecord } from '@/types/vehicle.types';
import { addDaysIso } from '@/utils/money.utils';

/** Flag an item as "due soon" this many days or km ahead. */
export const DUE_SOON_DAYS = 30;
export const DUE_SOON_KM = 500;

export const ODOMETER_SOURCE_LABELS: Record<OdometerSource, string> = {
  manual: 'Admin',
  service: 'Service',
  assign: 'Hand-over',
  return: 'Return',
  employee: 'Driver',
  expense: 'Expense claim',
};

export type DueStatus = 'overdue' | 'due_soon' | 'ok' | 'done';

export const DUE_STATUS_LABELS: Record<DueStatus, string> = {
  overdue: 'Overdue',
  due_soon: 'Due soon',
  ok: 'OK',
  done: 'Superseded',
};

export const DUE_STATUS_VARIANT: Record<DueStatus, 'destructive' | 'warning' | 'success' | 'muted'> = {
  overdue: 'destructive',
  due_soon: 'warning',
  ok: 'success',
  done: 'muted',
};

export function formatKm(km: number): string {
  return `${km.toLocaleString('en-US')} km`;
}

/**
 * Due state of a record by date and km, whichever comes first. Only the
 * newest record of each type counts; older ones were superseded by it.
 */
export function dueStatus(record: ServiceRecord, isLatest: boolean, currentKm: number | null, today: string): DueStatus {
  if (!isLatest) return 'done';
  const byDate = record.endDate;
  const byKm = record.nextDueKm;
  if ((byDate && byDate < today) || (byKm !== null && currentKm !== null && currentKm >= byKm)) return 'overdue';
  if (
    (byDate && byDate <= addDaysIso(today, DUE_SOON_DAYS)) ||
    (byKm !== null && currentKm !== null && byKm - currentKm <= DUE_SOON_KM)
  ) {
    return 'due_soon';
  }
  return 'ok';
}

/** Ids of the newest record per service type (by start date, then id). */
export function latestRecordIds(records: ServiceRecord[]): Set<number> {
  const latest = new Map<number, ServiceRecord>();
  for (const r of records) {
    const seen = latest.get(r.serviceTypeId);
    if (!seen || r.startDate > seen.startDate || (r.startDate === seen.startDate && r.id > seen.id)) {
      latest.set(r.serviceTypeId, r);
    }
  }
  return new Set([...latest.values()].map((r) => r.id));
}
