'use client';

import { useId, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { FileText, Loader2, Plus, Send, Trash } from 'lucide-react';

import { DatePicker } from '@/components/forms/DatePicker';
import { FormField } from '@/components/forms/FormField';
import { MoneyInput } from '@/components/forms/MoneyInput';
import { DialogIconHeader } from '@/components/shared/DialogIconHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCustomerOptions } from '@/features/customers/hooks/useCustomers';
import { useProductOptions } from '@/features/products/hooks/useProducts';
import { DEFAULT_INVOICE_DUE_DAYS } from '@/features/receivables/constants/receivable.constants';
import { useInvoice } from '@/features/receivables/hooks/useReceivables';
import {
  MAX_INVOICE_LINES,
  invoiceSchema,
  type InvoiceFormInput,
  type InvoiceFormValues,
} from '@/features/receivables/schemas/invoice.schema';
import type { Invoice, InvoiceDetail, InvoicePayload, VatRate } from '@/types/finance.types';
import { addDaysIso, calculateLineAmount, calculateTotals, formatMoney, todayIso } from '@/utils/money.utils';

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

const EMPTY_LINE = { productId: '', description: '', quantity: '1', unitPrice: '' };

function toPayload(values: InvoiceFormValues, status?: 'draft' | 'sent'): InvoicePayload {
  return {
    customerId: values.customerId,
    invoiceDate: values.invoiceDate,
    dueDate: values.dueDate,
    lines: values.lines.map((line) => ({
      productId: line.productId,
      description: line.description || null,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
    })),
    vatRate: Number(values.vatRate) as VatRate,
    description: values.description || null,
    poReference: values.poReference || null,
    notes: values.notes || null,
    ...(status ? { status } : {}),
  };
}

/** Design "ModalInvoiceForm". Editing loads the invoice's lines before showing the form. */
export function InvoiceFormDialog(props: InvoiceFormDialogProps) {
  if (!props.open) return null;
  const { invoice, ...rest } = props;
  return invoice ? <EditInvoiceDialog {...rest} invoice={invoice} /> : <InvoiceFormDialogInner {...rest} />;
}

function EditInvoiceDialog(props: InvoiceFormDialogProps & { invoice: Invoice }) {
  const { data: detail, isError } = useInvoice(props.invoice.id);
  if (detail) return <InvoiceFormDialogInner {...props} invoice={detail} />;
  return (
    <Dialog open onOpenChange={(o) => !o && props.onClose()}>
      <DialogContent onClose={props.onClose} className="max-w-[420px]">
        <div className="flex items-center gap-3 px-6 py-8 text-sm text-muted-foreground" role="status">
          {isError ? (
            "Couldn't load this invoice. Close and try again."
          ) : (
            <>
              <Loader2 className="size-4 animate-spin" />
              Loading invoice {props.invoice.invoiceNo}…
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InvoiceFormDialogInner({
  invoice,
  isSubmitting,
  onSubmit,
  onClose,
}: Omit<InvoiceFormDialogProps, 'invoice'> & { invoice?: InvoiceDetail }) {
  const formId = useId();
  const { data: customers = [] } = useCustomerOptions();
  const { data: products = [] } = useProductOptions();
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
      lines: invoice?.lines.length
        ? invoice.lines.map((line) => ({
            productId: line.productId ? String(line.productId) : '',
            // Keep a custom description; blank means "use the product's name".
            description: line.description,
            quantity: String(line.quantity),
            unitPrice: String(line.unitPrice),
          }))
        : [EMPTY_LINE],
      vatRate: invoice ? (String(invoice.vatRate) as '0' | '5') : '5',
      description: invoice?.description ?? '',
      poReference: invoice?.poReference ?? '',
      notes: invoice?.notes ?? '',
    },
  });
  const { errors } = formState;
  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });

  const [customerId, invoiceDate, vatRateInput, linesInput] = useWatch({
    control,
    name: ['customerId', 'invoiceDate', 'vatRate', 'lines'],
  });
  const customer = customers.find((c) => String(c.id) === customerId);
  const termDays = termsToDays(customer?.paymentTerms);

  const lineAmounts = (linesInput ?? []).map((line) => {
    const qty = Number(line.quantity);
    const price = Number(line.unitPrice);
    return Number.isFinite(qty) && qty > 0 && Number.isFinite(price) && price > 0 ? calculateLineAmount(qty, price) : null;
  });
  const subtotal = lineAmounts.reduce<number>((sum, amount) => sum + (amount ?? 0), 0);
  const totals = subtotal > 0 ? calculateTotals(subtotal, Number(vatRateInput)) : null;

  const syncDueDate = (date: string, days: number) => {
    if (!dueTouched && /^\d{4}-\d{2}-\d{2}$/.test(date)) setValue('dueDate', addDaysIso(date, days), { shouldValidate: true });
  };
  const customerField = register('customerId');

  /** Picking a product fills its list price and uses its name as the description. */
  const pickProduct = (index: number, productId: string) => {
    const product = products.find((p) => String(p.id) === productId);
    if (!product) return;
    setValue(`lines.${index}.unitPrice`, String(product.unitPrice), { shouldValidate: formState.isSubmitted });
    setValue(`lines.${index}.description`, '');
  };

  const submitAs = (status?: 'draft' | 'sent') => handleSubmit((values) => onSubmit(toPayload(values, status)));
  const linesError = errors.lines?.message ?? errors.lines?.root?.message;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent onClose={onClose} className="max-w-[1040px]">
        <DialogIconHeader
          icon={FileText}
          tone="green"
          title={isEdit ? `Edit invoice ${invoice?.invoiceNo}` : 'New invoice'}
          description="Bill a customer for products from your price list. Save as a draft, or issue it now to send and download the tax invoice."
        />
        <div className="flex min-h-0 flex-wrap overflow-y-auto">
          <form id={formId} onSubmit={submitAs(isEdit ? undefined : 'draft')} className="flex min-w-0 flex-[1_1_560px] flex-col gap-4 px-6 py-5" noValidate>
            <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
              <FormField label="Customer" htmlFor={`${formId}-customer`} required error={errors.customerId?.message} className="sm:col-span-2">
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
              <FormField label="Invoice date" htmlFor={`${formId}-date`} required error={errors.invoiceDate?.message}>
                <Controller
                  control={control}
                  name="invoiceDate"
                  render={({ field }) => (
                    <DatePicker
                      id={`${formId}-date`}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        syncDueDate(value, termDays);
                      }}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </FormField>
              <FormField label="Due date" htmlFor={`${formId}-due`} required error={errors.dueDate?.message}>
                <Controller
                  control={control}
                  name="dueDate"
                  render={({ field }) => (
                    <DatePicker
                      id={`${formId}-due`}
                      min={invoiceDate || undefined}
                      value={field.value}
                      onChange={(value) => {
                        setDueTouched(true);
                        field.onChange(value);
                      }}
                      onBlur={field.onBlur}
                      aria-invalid={errors.dueDate ? true : undefined}
                    />
                  )}
                />
                {!dueTouched && invoiceDate ? (
                  <p className="text-xs text-muted-foreground">
                    {termDays === 0 ? 'Due on the invoice date' : `${termDays} days after the invoice date`}
                  </p>
                ) : null}
              </FormField>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1.5 text-sm font-medium">
                Items <span className="text-destructive">*</span>
              </legend>
              <div
                className="hidden gap-2 px-1 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[minmax(0,1fr)_84px_132px_110px_36px]"
                aria-hidden
              >
                <span>Product</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Unit price</span>
                <span className="text-right">Amount</span>
                <span />
              </div>
              {fields.map((field, index) => {
                const lineErrors = errors.lines?.[index];
                const productField = register(`lines.${index}.productId`);
                const picked = products.find((p) => String(p.id) === linesInput?.[index]?.productId);
                // A saved line whose product is now inactive (or a converted old line) still shows its name.
                const savedDescription = invoice?.lines[index]?.description;
                const savedProductId = invoice?.lines[index]?.productId;
                const keepSaved = savedProductId && !products.some((p) => p.id === savedProductId);
                return (
                  <div key={field.id} className="rounded-lg border border-border p-2.5 sm:border-0 sm:p-0">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_84px_132px_110px_36px] sm:items-start">
                      <div className="col-span-2 flex flex-col gap-1 sm:col-span-1">
                        <Select
                          aria-label={`Line ${index + 1} product`}
                          aria-invalid={lineErrors?.productId ? true : undefined}
                          {...productField}
                          onChange={(e) => {
                            void productField.onChange(e);
                            pickProduct(index, e.target.value);
                          }}
                        >
                          <option value="">Select product…</option>
                          {keepSaved ? <option value={savedProductId}>{savedDescription} (inactive)</option> : null}
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.code ? `${p.name} · ${p.code}` : p.name}
                            </option>
                          ))}
                        </Select>
                        <Input
                          aria-label={`Line ${index + 1} description`}
                          className="h-8 text-xs"
                          placeholder={picked ? `Description (default: ${picked.name})` : 'Description (optional)'}
                          {...register(`lines.${index}.description`)}
                        />
                        {lineErrors?.productId?.message ? (
                          <p className="text-xs text-destructive">{lineErrors.productId.message}</p>
                        ) : null}
                      </div>
                      <div className="flex flex-col gap-1">
                        <Input
                          aria-label={`Line ${index + 1} quantity`}
                          type="number"
                          inputMode="decimal"
                          step="any"
                          min="0"
                          className="text-right tabular-nums"
                          aria-invalid={lineErrors?.quantity ? true : undefined}
                          {...register(`lines.${index}.quantity`)}
                        />
                        <span className="text-right text-xs text-muted-foreground">{picked?.unit ?? invoice?.lines[index]?.unit ?? ''}</span>
                        {lineErrors?.quantity?.message ? <p className="text-xs text-destructive">{lineErrors.quantity.message}</p> : null}
                      </div>
                      <div className="flex flex-col gap-1">
                        <MoneyInput
                          aria-label={`Line ${index + 1} unit price`}
                          className="text-right"
                          aria-invalid={lineErrors?.unitPrice ? true : undefined}
                          {...register(`lines.${index}.unitPrice`)}
                        />
                        {lineErrors?.unitPrice?.message ? <p className="text-xs text-destructive">{lineErrors.unitPrice.message}</p> : null}
                      </div>
                      <div className="flex h-9 items-center justify-end text-sm font-semibold tabular-nums">
                        {lineAmounts[index] != null ? formatMoney(lineAmounts[index]) : '—'}
                      </div>
                      <div className="flex h-9 items-center justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove line ${index + 1}`}
                          disabled={fields.length === 1}
                          onClick={() => remove(index)}
                        >
                          <Trash className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {linesError ? <p className="text-xs text-destructive">{linesError}</p> : null}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={fields.length >= MAX_INVOICE_LINES}
                  onClick={() => append(EMPTY_LINE)}
                >
                  <Plus className="size-4" />
                  Add item
                </Button>
                {products.length === 0 ? (
                  <span className="text-xs text-muted-foreground">No active products yet. Add them on the Products page.</span>
                ) : null}
              </div>
            </fieldset>

            <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
              <FormField label="VAT" htmlFor={`${formId}-vat`} error={errors.vatRate?.message}>
                <Select id={`${formId}-vat`} {...register('vatRate')}>
                  <option value="5">5%</option>
                  <option value="0">0% (zero-rated)</option>
                </Select>
              </FormField>
              <FormField label="Customer PO reference" htmlFor={`${formId}-po`} error={errors.poReference?.message}>
                <Input id={`${formId}-po`} {...register('poReference')} />
              </FormField>
              <FormField label="Subject (printed above the items)" htmlFor={`${formId}-desc`} error={errors.description?.message} className="sm:col-span-2">
                <Input id={`${formId}-desc`} placeholder="e.g. October supplies" {...register('description')} />
              </FormField>
              <FormField label="Notes (printed on invoice)" htmlFor={`${formId}-notes`} error={errors.notes?.message} className="sm:col-span-2">
                <Textarea id={`${formId}-notes`} className="min-h-14" {...register('notes')} />
              </FormField>
            </div>
          </form>

          <aside className="flex flex-[1_1_220px] flex-col gap-3 lg:flex-[0_0_260px] border-border bg-background px-6 py-5 sm:border-l" aria-label="Totals" aria-live="polite">
            <h3 className="text-xs font-semibold tracking-[0.04em] text-muted-foreground uppercase">Summary</h3>
            <dl className="flex flex-col gap-2.5 text-sm tabular-nums">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Items</dt>
                <dd>{lineAmounts.filter((a) => a != null).length}</dd>
              </div>
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
              Each line is qty × unit price; VAT is on the net total. Both are rounded half-up to the nearest fils, exactly as the server computes them.
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
