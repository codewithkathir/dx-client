'use client';

import { Gauge } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { shortDate } from '@/features/expenses/utils/claim.utils';
import { DUE_STATUS_VARIANT, dueStatus, formatKm } from '@/features/vehicles/constants/vehicle.constants';
import { useMyVehicleSummary } from '@/features/vehicles/hooks/useVehicles';
import { formatMoney, todayIso } from '@/utils/money.utils';

const STAGE_LABEL = { pending: 'Pending', approved: 'Approved', paid: 'Paid', rejected: 'Rejected' } as const;

/**
 * Employee claim form: once a vehicle is picked, what I've spent on it, my
 * last claims, its km and the services coming up.
 */
export function MyVehicleSpendPanel({ assetId }: { assetId: number }) {
  const { data: summary, isLoading, isError } = useMyVehicleSummary(assetId);
  if (isError) return null;
  if (isLoading || !summary) return <Skeleton className="h-28 w-full rounded-xl" />;

  const today = todayIso();
  const km = summary.odometer?.readingKm ?? null;
  const due = summary.due
    .map((d) => ({ ...d, status: dueStatus(d, true, km, today) }))
    .filter((d) => d.status === 'overdue' || d.status === 'due_soon');

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-muted/50 p-3 text-[13px]">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <div className="text-muted-foreground">This month</div>
          <div className="font-semibold tabular-nums">{formatMoney(summary.thisMonth.amount)}</div>
        </div>
        <div>
          <div className="text-muted-foreground">This year</div>
          <div className="font-semibold tabular-nums">{formatMoney(summary.thisYear.amount)}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Odometer</div>
          <div className="flex items-center gap-1 font-semibold tabular-nums">
            <Gauge className="size-3.5 text-muted-foreground" aria-hidden />
            {km !== null ? formatKm(km) : '—'}
          </div>
        </div>
      </div>

      {due.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {due.map((d) => (
            <Badge key={d.serviceTypeName} variant={DUE_STATUS_VARIANT[d.status]} dot>
              {d.serviceTypeName} {d.status === 'overdue' ? 'overdue' : 'due soon'}
              {d.nextDueKm !== null ? ` · ${formatKm(d.nextDueKm)}` : d.endDate ? ` · ${shortDate(d.endDate)}` : ''}
            </Badge>
          ))}
        </div>
      ) : null}

      {summary.recentClaims.length > 0 ? (
        <div className="flex flex-col gap-1">
          <div className="text-muted-foreground">Your recent claims for {summary.assetNo}</div>
          {summary.recentClaims.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate">
                {shortDate(c.date)} · {c.subCategoryName}
              </span>
              <span className="shrink-0 tabular-nums">
                {formatMoney(c.amount)} <span className="text-muted-foreground">· {STAGE_LABEL[c.stage]}</span>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground">No claims for {summary.assetNo} yet.</div>
      )}
    </div>
  );
}
