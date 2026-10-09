'use client';

import { useId, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { FileText, Send } from 'lucide-react';

import { FormField } from '@/components/forms/FormField';
import { MoneyInput } from '@/components/forms/MoneyInput';
import { DialogIconHeader } from '@/components/shared/DialogIconHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCustomerOptions } from '@/features/customers/hooks/useCustomers';
import { DEFAULT_INVOICE_DUE_DAYS } from '@/features/receivables/constants/receivable.constants';
import { invoiceSchema, type InvoiceFormInput, type InvoiceFormValues } from '@/features/receivables/schemas/invoice.schema';
import type { Invoice, InvoicePayload, VatRate } from '@/types/finance.types';
import { addDaysIso, calculateTotals, formatMoney, todayIso } from '@/utils/money.utils';

interface InvoiceFormDialogProps {
  open: boolean;
  invoice?: Invoice;
  isSubmitting: boolean;
  onSubmit: (payload: InvoicePayload) => void;
  onClose: () => void;
}

/** Days from payment terms like "Net 45"; "Due on receipt" → 0; otherwise the default. */
export function termsToDays(terms: string | null | undefined): number {
  if (!terms) return DEFAULT_INVOICE_DUE_DAYS;
  if (/receipt|immediate/i.test(terms)) return 0;
  const match = terms.match(/(\d{1,3})/);
  return match ? Number(match[1]) : DEFAULT_INVOICE_DUE_DAYS;
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

/** Design "ModalInvoiceForm". */
export function InvoiceFormDialog(props: InvoiceFormDialogProps) {
  if (!props.open) return null;
  return <InvoiceFormDialogInner {...props} />;
}

function InvoiceFormDialogInner({ invoice, isSubmitting, onSubmit, onClose }: InvoiceFormDialogProps) {
  const formId = useId();
  const { data: customers = [] } = useCustomerOptions();
  const isEdit = Boolean(invoice);
  const today = todayIso();
  // Once the user picks a due date themselves, stop deriving it from the customer's terms.
  const [dueTouched, setDueTouched] = useState(isEdit);

  const { register, handleSubmit, formState, control, setValue, getValues } = useForm<InvoiceFormInput, unknown, InvoiceFormValues>({
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

  const [customerId, invoiceDate, subtotalInput, vatRateInput] = useWatch({
    control,
    name: ['customerId', 'invoiceDate', 'subtotalAmount', 'vatRate'],
  });
  const customer = customers.find((c) => String(c.id) === customerId);
  const termDays = termsToDays(customer?.paymentTerms);
  const subtotal = Number(subtotalInput);
  const totals = Number.isFinite(subtotal) && subtotal > 0 ? calculateTotals(subtotal, Number(vatRateInput)) : null;

  const syncDueDate = (date: string, days: number) => {
    if (!dueTouched && /^\d{4}-\d{2}-\d{2}$/.test(date)) setValue('dueDate', addDaysIso(date, days), { shouldValidate: true });
  };
  const customerField = register('customerId');
  const dateField = register('invoiceDate');
  const dueField = register('dueDate');

  const submitAs = (status?: 'draft' | 'sent') => handleSubmit((values) => onSubmit(toPayload(values, status)));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent onClose={onClose} className="max-w-[760px]">
        <DialogIconHeader
          icon={FileText}
          tone="green"
          title={isEdit ? `Edit invoice ${invoice?.invoiceNo}` : 'New invoice'}
          description="Bill a customer. Save as a draft, or issue it now to send and download the tax invoice."
        />
        <div className="flex min-h-0 flex-wrap overflow-y-auto">
          <form id={formId} onSubmit={submitAs(isEdit ? undefined : 'draft')} className="flex min-w-0 flex-[1_1_420px] flex-col gap-4 px-6 py-5" noValidate>
            <FormField label="Customer" htmlFor={`${formId}-customer`} required error={errors.customerId?.message}>
              <Select
                id={`${formId}-customer`}
                {...customerField}
                onChange={(e) => {
                  void customerField.onChange(e);
                  const picked = customers.find((c) => String(c.id) === e.target.value);
                  syncDueDate(getValues('invoiceDate'), termsToDays(picked?.paymentTerms));
                }}
              >
                <option value="">Select customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName}
                  </option>
                ))}
              </Select>
              {customer ? (
                <p className="text-xs text-muted-foreground">
                  {[customer.trn ? `TRN ${customer.trn}` : 'No TRN on file', customer.paymentTerms].filter(Boolean).join(' · ')}
                </p>
              ) : null}
            </FormField>
            <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
              <FormField label="Invoice date" htmlFor={`${formId}-date`} required error={errors.invoiceDate?.message}>
                <Input
                  id={`${formId}-date`}
                  type="date"
                  {...dateField}
                  onChange={(e) => {
                    void dateField.onChange(e);
                    syncDueDate(e.target.value, termDays);
                  }}
                />
              </FormField>
              <FormField label="Due date" htmlFor={`${formId}-due`} required error={errors.dueDate?.message}>
                <Input
                  id={`${formId}-due`}
                  type="date"
                  {...dueField}
                  onChange={(e) => {
                    setDueTouched(true);
                    void dueField.onChange(e);
                  }}
                />
                {!dueTouched && invoiceDate ? (
                  <p className="text-xs text-muted-foreground">
                    {termDays === 0 ? 'Due on the invoice date' : `${termDays} days after the invoice date`}
                  </p>
                ) : null}
              </FormField>
              <FormField label="Amount before VAT (AED)" htmlFor={`${formId}-amount`} required error={errors.subtotalAmount?.message}>
                <MoneyInput id={`${formId}-amount`} {...register('subtotalAmount')} />
              </FormField>
              <FormField label="VAT" htmlFor={`${formId}-vat`} error={errors.vatRate?.message}>
                <Select id={`${formId}-vat`} {...register('vatRate')}>
                  <option value="5">5%</option>
                  <option value="0">0% (zero-rated)</option>
                </Select>
              </FormField>
            </div>
            <FormField label="Description" htmlFor={`${formId}-desc`} required error={errors.description?.message}>
              <Textarea id={`${formId}-desc`} className="min-h-16" placeholder="Goods or services supplied" {...register('description')} />
            </FormField>
            <FormField label="Customer PO reference" htmlFor={`${formId}-po`} error={errors.poReference?.message}>
              <Input id={`${formId}-po`} {...register('poReference')} />
            </FormField>
            <FormField label="Notes (printed on invoice)" htmlFor={`${formId}-notes`} error={errors.notes?.message}>
              <Textarea id={`${formId}-notes`} className="min-h-14" {...register('notes')} />
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
            <p className="mt-2 text-xs leading-[18px] text-muted-foreground">
              VAT is rounded half-up to the nearest fils, exactly as the server computes it.
            </p>
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
              <Button type="submit" form={formId} variant="secondary" size="lg" disabled={isSubmitting}>
                Save as draft
              </Button>
              <Button loading={isSubmitting} type="button" size="lg" disabled={isSubmitting} onClick={submitAs('sent')}>
                <Send className="size-4" />
                Issue invoice
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
