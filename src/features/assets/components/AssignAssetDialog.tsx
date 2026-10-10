'use client';

import { useId } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { UserPlus } from 'lucide-react';

import { FormField } from '@/components/forms/FormField';
import { DialogIconHeader } from '@/components/shared/DialogIconHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAdminWhomDropdown } from '@/features/admin-expenses/hooks/useAdminExpenseQueries';
import { AssetIcon } from '@/features/assets/components/AssetIcon';
import { ASSET_CONDITION_OPTIONS } from '@/features/assets/constants/asset.constants';
import { assignFormSchema, type AssignFormValues } from '@/features/assets/schemas/asset.schema';
import type { Asset, AssetCondition, AssignAssetPayload } from '@/types/asset.types';
import { todayIso } from '@/utils/money.utils';

interface AssignAssetDialogProps {
  asset: Asset | null;
  isSubmitting: boolean;
  onSubmit: (payload: AssignAssetPayload) => void;
  onClose: () => void;
}

/** Hand an available asset to an employee. */
export function AssignAssetDialog(props: AssignAssetDialogProps) {
  if (!props.asset) return null;
  return <AssignInner {...props} asset={props.asset} />;
}

function AssignInner({ asset, isSubmitting, onSubmit, onClose }: AssignAssetDialogProps & { asset: Asset }) {
  const formId = useId();
  const { data: employees = [] } = useAdminWhomDropdown();
  const { register, handleSubmit, formState } = useForm<AssignFormValues>({
    resolver: zodResolver(assignFormSchema),
    defaultValues: { employeeId: '', assignedDate: todayIso(), expectedReturnDate: '', condition: asset.condition, notes: '' },
  });
  const { errors } = formState;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent onClose={onClose} className="max-w-[520px]">
        <DialogIconHeader icon={UserPlus} title="Assign asset" description="The employee is emailed and asked to confirm they received it." />
        <form
          id={formId}
          noValidate
          className="flex flex-col gap-4 overflow-y-auto px-6 py-5"
          onSubmit={handleSubmit((v) =>
            onSubmit({
              employeeId: Number(v.employeeId),
              assignedDate: v.assignedDate,
              expectedReturnDate: v.expectedReturnDate || null,
              condition: v.condition as AssetCondition,
              notes: v.notes.trim() || null,
            }),
          )}
        >
          <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-3.5 py-3">
            <AssetIcon category={asset.category} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{asset.name}</div>
              <div className="truncate font-mono text-xs text-muted-foreground">
                {asset.assetNo}
                {asset.serialNo ? ` · SN ${asset.serialNo}` : ''}
              </div>
            </div>
          </div>
          <FormField label="Assign to" htmlFor={`${formId}-emp`} required error={errors.employeeId?.message}>
            <Select id={`${formId}-emp`} {...register('employeeId')}>
              <option value="">Select employee…</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.empName}
                  {e.employeeCode ? ` (${e.employeeCode})` : ''}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
            <FormField label="Assigned on" htmlFor={`${formId}-date`} required error={errors.assignedDate?.message}>
              <Input id={`${formId}-date`} type="date" max={todayIso()} {...register('assignedDate')} />
            </FormField>
            <FormField label="Return by" htmlFor={`${formId}-ret`} error={errors.expectedReturnDate?.message}>
              <Input id={`${formId}-ret`} type="date" {...register('expectedReturnDate')} />
              <p className="text-xs text-muted-foreground">Optional — leave empty for permanent use.</p>
            </FormField>
            <FormField label="Condition when handed over" htmlFor={`${formId}-cond`} className="sm:col-span-2">
              <Select id={`${formId}-cond`} {...register('condition')}>
                {ASSET_CONDITION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
          <FormField label="Notes" htmlFor={`${formId}-notes`} error={errors.notes?.message}>
            <Textarea id={`${formId}-notes`} className="min-h-14" placeholder="e.g. With charger and sleeve" {...register('notes')} />
          </FormField>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} size="lg" loading={isSubmitting}>
            Assign asset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
