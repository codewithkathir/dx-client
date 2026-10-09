'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCustomerOptions } from '@/features/customers/hooks/useCustomers';
import { VAT_RATE_OPTIONS } from '@/features/payables/constants/payable.constants';
import { DEFAULT_INVOICE_DUE_DAYS } from '@/features/receivables/constants/receivable.constants';
import {
  invoiceSchema,
  type InvoiceFormInput,
  type InvoiceFormValues,
} from '@/features/receivables/schemas/invoice.schema';
import type { Invoice, InvoicePayload, VatRate } from '@/types/finance.types';
import { addDaysIso, calculateTotals, formatMoney, todayIso } from '@/utils/money.utils';

interface InvoiceFormProps {
  invoice?: Invoice;
  isSubmitting: boolean;
  onSubmit: (payload: InvoicePayload) => void;
  onCancel: () => void;
}

function toPayload(values: InvoiceFormValues, status?: 'draft' | 'sent'): InvoicePayload {
  return {
    customerId: values.customerId,
    invoiceDate: values.invoiceDate,
    dueDate: values.dueDate,
    subtotalAmount: values.subtotalAmount,
    vatRate: Number(values.vatRate) as VatRate,
    description: values.description,
    poReference: values.poReference || null,
    notes: values.notes || null,
    ...(status ? { status } : {}),
  };
}

export function InvoiceForm({ invoice, isSubmitting, onSubmit, onCancel }: InvoiceFormProps) {
  const { data: customers = [] } = useCustomerOptions();
  const isEdit = Boolean(invoice);
  const today = todayIso();

  const { register, handleSubmit, formState, control } = useForm<InvoiceFormInput, unknown, InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerId: invoice ? String(invoice.customerId) : '',
      invoiceDate: invoice?.invoiceDate ?? today,
      dueDate: invoice?.dueDate ?? addDaysIso(today, DEFAULT_INVOICE_DUE_DAYS),
      subtotalAmount: invoice ? String(invoice.subtotalAmount) : '',
      vatRate: invoice ? (String(invoice.vatRate) as '0' | '5') : '5',
      description: invoice?.description ?? '',
      poReference: invoice?.poReference ?? '',
      notes: invoice?.notes ?? '',
    },
  });
  const { errors } = formState;

  const [subtotalInput, vatRateInput] = useWatch({ control, name: ['subtotalAmount', 'vatRate'] });
  const subtotal = Number(subtotalInput);
  const totals = Number.isFinite(subtotal) && subtotal > 0 ? calculateTotals(subtotal, Number(vatRateInput)) : null;

  const submitAs = (status?: 'draft' | 'sent') =>
    handleSubmit((values) => onSubmit(toPayload(values, status)));

  return (
    <form onSubmit={submitAs(isEdit ? undefined : 'draft')} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Customer" htmlFor="customerId" required error={errors.customerId?.message} className="sm:col-span-2">
          <Select id="customerId" {...register('customerId')}>
            <option value="">Select customer…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Invoice date" htmlFor="invoiceDate" required error={errors.invoiceDate?.message}>
          <Input id="invoiceDate" type="date" {...register('invoiceDate')} />
        </FormField>
        <FormField label="Due date" htmlFor="dueDate" required error={errors.dueDate?.message}>
          <Input id="dueDate" type="date" {...register('dueDate')} />
        </FormField>
        <FormField label="Description" htmlFor="description" required error={errors.description?.message} className="sm:col-span-2">
          <Textarea id="description" rows={3} placeholder="Goods or services supplied" {...register('description')} />
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
        <FormField label="Customer PO reference" htmlFor="poReference" error={errors.poReference?.message}>
          <Input id="poReference" {...register('poReference')} />
        </FormField>
        <FormField label="Notes (printed on invoice)" htmlFor="notes" error={errors.notes?.message}>
          <Input id="notes" {...register('notes')} />
        </FormField>
      </div>

      {!isEdit ? (
        <p className="text-xs text-muted-foreground">
          An invoice number is assigned when you save. Sent invoices can&apos;t be edited — cancel and re-issue instead.
        </p>
      ) : null}

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
            <Button type="submit" variant="secondary" disabled={isSubmitting}>
              Save as draft
            </Button>
            <Button type="button" disabled={isSubmitting} onClick={submitAs('sent')}>
              {isSubmitting ? 'Saving…' : 'Save & mark sent'}
            </Button>
          </>
        )}
      </div>
    </form>
  );
}
