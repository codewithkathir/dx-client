'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ADMIN_ROUTES } from '@/constants/routes.constants';
import { useAdminExpenseMutations } from '@/features/admin-expenses/hooks/useAdminExpenseMutations';
import { useAdminCategoryDropdown, useAdminVehicleDropdown } from '@/features/admin-expenses/hooks/useAdminExpenseQueries';
import type { Expense } from '@/types/expense.types';

interface ExpenseVehicleFieldProps {
  expense: Expense;
  onUpdated: (expense: Expense) => void;
}

/**
 * Vehicle and km on a claim, with an inline fix. Shown for vehicle categories
 * (or when a vehicle is already set); on approved claims saving rebuilds the
 * linked service record or odometer reading.
 */
export function ExpenseVehicleField({ expense, onUpdated }: ExpenseVehicleFieldProps) {
  const [editing, setEditing] = useState(false);
  const [assetId, setAssetId] = useState(expense.assetId ? String(expense.assetId) : '');
  const [km, setKm] = useState(expense.odometerKm != null ? String(expense.odometerKm) : '');
  const { data: categories = [] } = useAdminCategoryDropdown();
  const { data: vehicles = [] } = useAdminVehicleDropdown(editing);
  const { updateVehicle } = useAdminExpenseMutations();

  const isVehicleCategory = Boolean(categories.find((c) => c.id === expense.categoryId)?.isVehicleExpense);
  if (!expense.assetId && !isVehicleCategory) return null;
  const rejected = expense.employeeStatus === 'rejected' || expense.adminStatus === 'rejected';
  const kmValid = km === '' || /^\d+$/.test(km);

  if (!editing) {
    return (
      <div className="col-span-2">
        <dt className="text-[13px] text-muted-foreground">Vehicle</dt>
        <dd className="mt-0.5 flex flex-wrap items-center gap-2 text-sm font-medium">
          {expense.vehicle && expense.assetId ? (
            <>
              <Link href={ADMIN_ROUTES.VEHICLE_DETAIL(expense.assetId)} className="font-mono text-primary hover:underline">
                {expense.vehicle.assetNo}
              </Link>
              <span className="text-muted-foreground">
                {expense.vehicle.name}
                {expense.odometerKm != null ? ` · ${expense.odometerKm.toLocaleString('en-US')} km` : ''}
              </span>
            </>
          ) : (
            <span className="text-status-warning-ink">Not set</span>
          )}
          {!rejected ? (
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              <Pen className="size-3.5" />
              Change
            </Button>
          ) : null}
        </dd>
      </div>
    );
  }

  return (
    <div className="col-span-2 flex flex-col gap-2 rounded-xl border border-border p-3">
      <div className="text-[13px] font-medium">Vehicle for this claim</div>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_140px]">
        <Select aria-label="Vehicle" value={assetId} onChange={(e) => setAssetId(e.target.value)}>
          <option value="">No vehicle</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.assetNo} · {v.name}
            </option>
          ))}
        </Select>
        <Input
          aria-label="Odometer (km)"
          inputMode="numeric"
          placeholder="Odometer km"
          value={km}
          disabled={!assetId}
          aria-invalid={kmValid ? undefined : true}
          onChange={(e) => setKm(e.target.value.trim())}
        />
      </div>
      {expense.employeeStatus === 'approved' ? (
        <p className="text-xs text-muted-foreground">The service record or reading this claim created is updated to match.</p>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={updateVehicle.isPending}>
          Cancel
        </Button>
        <Button
          size="sm"
          loading={updateVehicle.isPending}
          disabled={!kmValid}
          onClick={() =>
            updateVehicle.mutate(
              { id: expense.id, payload: { assetId: assetId ? Number(assetId) : null, odometerKm: assetId && km ? Number(km) : null } },
              {
                onSuccess: (updated) => {
                  setEditing(false);
                  onUpdated(updated);
                },
              },
            )
          }
        >
          Save
        </Button>
      </div>
    </div>
  );
}
