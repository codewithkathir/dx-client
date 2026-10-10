'use client';

import { useId } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Undo2 } from 'lucide-react';

import { FormField } from '@/components/forms/FormField';
import { SegmentedRadio } from '@/components/forms/SegmentedRadio';
import { DialogIconHeader } from '@/components/shared/DialogIconHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ASSET_CONDITION_OPTIONS, UNASSIGNED_STATUS_OPTIONS } from '@/features/assets/constants/asset.constants';
import { returnFormSchema, type ReturnFormValues } from '@/features/assets/schemas/asset.schema';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import type { Asset, AssetCondition, ReturnAssetPayload, UnassignedAssetStatus } from '@/types/asset.types';
import { todayIso } from '@/utils/money.utils';

interface ReturnAssetDialogProps {
  asset: Asset | null;
  isSubmitting: boolean;
  onSubmit: (payload: ReturnAssetPayload) => void;
  onClose: () => void;
}

/** Record that an employee handed an asset back, and where it goes next. */
export function ReturnAssetDialog(props: ReturnAssetDialogProps) {
  if (!props.asset?.currentAssignment) return null;
  return <ReturnInner {...props} asset={props.asset} />;
}

function ReturnInner({ asset, isSubmitting, onSubmit, onClose }: ReturnAssetDialogProps & { asset: Asset }) {
  const formId = useId();
  const assignment = asset.currentAssignment!;
  const { register, handleSubmit, formState } = useForm<ReturnFormValues>({
    resolver: zodResolver(returnFormSchema),
    defaultValues: { returnedDate: todayIso(), condition: asset.condition, nextStatus: 'available', notes: '' },
  });
  const { errors } = formState;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent onClose={onClose} className="max-w-[520px]">
        <DialogIconHeader
          icon={Undo2}
          title="Record return"
          description={`${asset.name} from ${assignment.employeeName ?? 'employee'} — assigned ${formatExpenseDate(assignment.assignedDate)}.`}
        />
        <form
          id={formId}
          noValidate
          className="flex flex-col gap-4 overflow-y-auto px-6 py-5"
          onSubmit={handleSubmit((v) =>
            onSubmit({
              returnedDate: v.returnedDate,
              condition: v.condition as AssetCondition,
              nextStatus: v.nextStatus as UnassignedAssetStatus,
              notes: v.notes.trim() || null,
            }),
          )}
        >
          <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
            <FormField label="Returned on" htmlFor={`${formId}-date`} required error={errors.returnedDate?.message}>
              <Input id={`${formId}-date`} type="date" min={assignment.assignedDate} max={todayIso()} {...register('returnedDate')} />
            </FormField>
            <FormField label="Condition on return" htmlFor={`${formId}-cond`} required error={errors.condition?.message}>
              <Select id={`${formId}-cond`} {...register('condition')}>
                {ASSET_CONDITION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
          <FormField label="Next status" htmlFor={`${formId}-next`}>
            <SegmentedRadio id={`${formId}-next`} label="Next status" registration={register('nextStatus')} options={UNASSIGNED_STATUS_OPTIONS} />
          </FormField>
          <FormField label="Notes" htmlFor={`${formId}-notes`} error={errors.notes?.message}>
            <Textarea id={`${formId}-notes`} className="min-h-14" placeholder="e.g. Cracked screen, charger missing" {...register('notes')} />
          </FormField>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} size="lg" loading={isSubmitting}>
            Record return
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
