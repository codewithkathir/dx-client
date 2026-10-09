'use client';

import { useId } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Receipt } from 'lucide-react';

import { FormField } from '@/components/forms/FormField';
import { MoneyInput } from '@/components/forms/MoneyInput';
import { DialogIconHeader } from '@/components/shared/DialogIconHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAdminCategoryDropdown } from '@/features/admin-expenses/hooks/useAdminExpenseQueries';
import { billSchema, type BillFormInput, type BillFormValues } from '@/features/payables/schemas/bill.schema';
import { useSupplierOptions } from '@/features/suppliers/hooks/useSuppliers';
import type { Bill, BillPayload, VatRate } from '@/types/finance.types';
import { calculateTotals, formatMoney, todayIso } from '@/utils/money.utils';

interface BillFormDialogProps {
  open: boolean;
  bill?: Bill;
  isSubmitting: boolean;
  onSubmit: (payload: BillPayload) => void;
  onClose: () => void;
}

function toPayload(values: BillFormValues, status?: 'draft' | 'open'): BillPayload {
  return {
    supplierId: values.supplierId,
    billNo: values.billNo,
    billDate: values.billDate,
    dueDate: values.dueDate,
    subtotalAmount: values.subtotalAmount,
    vatRate: Number(values.vatRate) as VatRate,
    categoryId: values.categoryId ? Number(values.categoryId) : null,
    description: values.description || null,
    notes: values.notes || null,
    ...(status ? { status } : {}),
  };
}

/** Design "ModalBillForm": supplier bill with a live net / VAT / total summary. */
export function BillFormDialog(props: BillFormDialogProps) {
  if (!props.open) return null;
  return <BillFormDialogInner {...props} />;
}

function BillFormDialogInner({ bill, isSubmitting, onSubmit, onClose }: BillFormDialogProps) {
  const formId = useId();
  const { data: suppliers = [] } = useSupplierOptions();
  const { data: categories = [] } = useAdminCategoryDropdown();
  const isEdit = Boolean(bill);

  const { register, handleSubmit, formState, control } = useForm<BillFormInput, unknown, BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      supplierId: bill?.supplierId ? String(bill.supplierId) : '',
      billNo: bill?.billNo ?? '',
      billDate: bill?.billDate ?? todayIso(),
      dueDate: bill?.dueDate ?? todayIso(),
      subtotalAmount: bill ? String(bill.subtotalAmount) : '',
      vatRate: bill ? (String(bill.vatRate) as '0' | '5') : '5',
      categoryId: bill?.categoryId ? String(bill.categoryId) : '',
      description: bill?.description ?? '',
      notes: bill?.notes ?? '',
    },
  });
  const { errors } = formState;

  const [subtotalInput, vatRateInput] = useWatch({ control, name: ['subtotalAmount', 'vatRate'] });
  const subtotal = Number(subtotalInput);
  const totals = Number.isFinite(subtotal) && subtotal > 0 ? calculateTotals(subtotal, Number(vatRateInput)) : null;
  const submitAs = (status?: 'draft' | 'open') => handleSubmit((values) => onSubmit(toPayload(values, status)));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent onClose={onClose} className="max-w-[760px]">
        <DialogIconHeader
          icon={Receipt}
          title={isEdit ? `Edit bill ${bill?.billNo}` : 'New bill'}
          description="Record a supplier's bill. Reimbursement bills are created automatically when you approve an expense claim."
        />
        <div className="flex min-h-0 flex-wrap overflow-y-auto">
          <form
            id={formId}
            onSubmit={submitAs(isEdit ? undefined : 'open')}
            className="flex min-w-0 flex-[1_1_420px] flex-col gap-4 px-6 py-5"
            noValidate
          >
            <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
              <FormField label="Supplier" htmlFor={`${formId}-supplier`} required error={errors.supplierId?.message}>
                <Select id={`${formId}-supplier`} {...register('supplierId')}>
                  <option value="">Select supplier…</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.companyName}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Supplier's bill no." htmlFor={`${formId}-no`} required error={errors.billNo?.message}>
                <Input id={`${formId}-no`} placeholder="e.g. DL-INV-88213" {...register('billNo')} />
              </FormField>
              <FormField label="Bill date" htmlFor={`${formId}-date`} required error={errors.billDate?.message}>
                <Input id={`${formId}-date`} type="date" {...register('billDate')} />
              </FormField>
              <FormField label="Due date" htmlFor={`${formId}-due`} required error={errors.dueDate?.message}>
                <Input id={`${formId}-due`} type="date" aria-invalid={errors.dueDate ? true : undefined} {...register('dueDate')} />
              </FormField>
              <FormField label="Amount before VAT (AED)" htmlFor={`${formId}-amount`} required error={errors.subtotalAmount?.message}>
                <MoneyInput id={`${formId}-amount`} {...register('subtotalAmount')} />
              </FormField>
              <FormField label="VAT" htmlFor={`${formId}-vat`} error={errors.vatRate?.message}>
                <Select id={`${formId}-vat`} {...register('vatRate')}>
                  <option value="5">5%</option>
                  <option value="0">0% (zero-rated / exempt)</option>
                </Select>
              </FormField>
              <FormField label="Category" htmlFor={`${formId}-category`} error={errors.categoryId?.message} className="sm:col-span-2">
                <Select id={`${formId}-category`} {...register('categoryId')}>
                  <option value="">None</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
                <p className="text-xs text-muted-foreground">Optional — used for spend reports.</p>
              </FormField>
            </div>
            <FormField label="Description" htmlFor={`${formId}-desc`} error={errors.description?.message}>
              <Textarea id={`${formId}-desc`} className="min-h-14" placeholder="What was bought" {...register('description')} />
            </FormField>
            <FormField label="Notes" htmlFor={`${formId}-notes`} error={errors.notes?.message}>
              <Textarea id={`${formId}-notes`} className="min-h-14" placeholder="Internal notes" {...register('notes')} />
            </FormField>
          </form>

          <aside className="flex flex-[1_1_220px] flex-col gap-3 border-border bg-background px-6 py-5 sm:border-l" aria-label="Totals" aria-live="polite">
            <h3 className="text-xs font-semibold tracking-[0.04em] text-muted-foreground uppercase">Summary</h3>
            <dl className="flex flex-col gap-2.5 text-sm tabular-nums">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Net</dt>
                <dd>{totals ? formatMoney(totals.subtotal) : '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">VAT {vatRateInput}%</dt>
                <dd>{totals ? formatMoney(totals.vat) : '—'}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2.5 text-lg font-semibold">
                <dt>Total</dt>
                <dd>{totals ? formatMoney(totals.total) : '—'}</dd>
              </div>
            </dl>
          </aside>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          {isEdit ? (
            <Button loading={isSubmitting} type="submit" form={formId} size="lg" disabled={isSubmitting}>
              Save changes
            </Button>
          ) : (
            <>
              <Button type="button" variant="secondary" size="lg" disabled={isSubmitting} onClick={submitAs('draft')}>
                Save as draft
              </Button>
              <Button loading={isSubmitting} type="submit" form={formId} size="lg" disabled={isSubmitting}>
                Save bill
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
