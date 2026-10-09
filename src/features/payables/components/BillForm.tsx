'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAdminCategoryDropdown } from '@/features/admin-expenses/hooks/useAdminExpenseQueries';
import { VAT_RATE_OPTIONS } from '@/features/payables/constants/payable.constants';
import {
  billSchema,
  type BillFormInput,
  type BillFormValues,
} from '@/features/payables/schemas/bill.schema';
import { useSupplierOptions } from '@/features/suppliers/hooks/useSuppliers';
import type { Bill, BillPayload, VatRate } from '@/types/finance.types';
import { calculateTotals, formatMoney, todayIso } from '@/utils/money.utils';

interface BillFormProps {
  bill?: Bill;
  isSubmitting: boolean;
  onSubmit: (payload: BillPayload) => void;
  onCancel: () => void;
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

export function BillForm({ bill, isSubmitting, onSubmit, onCancel }: BillFormProps) {
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
  const totals = Number.isFinite(subtotal) && subtotal > 0
    ? calculateTotals(subtotal, Number(vatRateInput))
    : null;

  // Creating offers "save as draft" or "save and issue"; editing keeps the status.
  const submitAs = (status?: 'draft' | 'open') =>
    handleSubmit((values) => onSubmit(toPayload(values, status)));

  return (
    <form onSubmit={submitAs(isEdit ? undefined : 'open')} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Supplier" htmlFor="supplierId" required error={errors.supplierId?.message}>
          <Select id="supplierId" {...register('supplierId')}>
            <option value="">Select supplier…</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.companyName}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Supplier's bill no." htmlFor="billNo" required error={errors.billNo?.message}>
          <Input id="billNo" placeholder="e.g. INV-4471" {...register('billNo')} />
        </FormField>
        <FormField label="Bill date" htmlFor="billDate" required error={errors.billDate?.message}>
          <Input id="billDate" type="date" {...register('billDate')} />
        </FormField>
        <FormField label="Due date" htmlFor="dueDate" required error={errors.dueDate?.message}>
          <Input id="dueDate" type="date" {...register('dueDate')} />
        </FormField>
        <FormField label="Amount before VAT (AED)" htmlFor="subtotalAmount" required error={errors.subtotalAmount?.message}>
          <Input id="subtotalAmount" type="number" inputMode="decimal" step="0.01" min="0.01" {...register('subtotalAmount')} />
        </FormField>
        <FormField label="VAT" htmlFor="vatRate" required error={errors.vatRate?.message}>
          <Select id="vatRate" {...register('vatRate')}>
            {VAT_RATE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <dl className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm" aria-live="polite">
        <div>
          <dt className="text-xs text-muted-foreground">Net</dt>
          <dd className="font-medium tabular-nums">{totals ? formatMoney(totals.subtotal) : '—'}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">VAT</dt>
          <dd className="font-medium tabular-nums">{totals ? formatMoney(totals.vat) : '—'}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Total</dt>
          <dd className="font-semibold tabular-nums">{totals ? formatMoney(totals.total) : '—'}</dd>
        </div>
      </dl>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Category" htmlFor="categoryId" error={errors.categoryId?.message}>
          <Select id="categoryId" {...register('categoryId')}>
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Description" htmlFor="description" error={errors.description?.message}>
          <Input id="description" placeholder="What was bought" {...register('description')} />
        </FormField>
        <FormField label="Notes" htmlFor="notes" error={errors.notes?.message} className="sm:col-span-2">
          <Textarea id="notes" rows={2} {...register('notes')} />
        </FormField>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        {isEdit ? (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </Button>
        ) : (
          <>
            <Button type="button" variant="secondary" disabled={isSubmitting} onClick={submitAs('draft')}>
              Save as draft
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save & issue'}
            </Button>
          </>
        )}
      </div>
    </form>
  );
}
