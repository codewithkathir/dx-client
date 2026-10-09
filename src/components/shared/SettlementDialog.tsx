'use client';

import { useId } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { CircleCheck, HandCoins, Wallet } from 'lucide-react';

import { FormField } from '@/components/forms/FormField';
import { MoneyInput } from '@/components/forms/MoneyInput';
import { DialogIconHeader } from '@/components/shared/DialogIconHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogBody, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAdminPaymentMethodDropdown } from '@/features/admin-expenses/hooks/useAdminExpenseQueries';
import { formatExpenseDate } from '@/features/expenses/utils/expense.utils';
import { paymentSchema, type PaymentFormInput, type PaymentFormValues } from '@/features/payables/schemas/bill.schema';
import { formatMoney, toFils, todayIso } from '@/utils/money.utils';

export interface SettlementValues {
  date: string;
  amount: number;
  paymentMethodId: number;
  reference: string | null;
  notes: string | null;
}

interface SettlementDialogProps {
  open: boolean;
  /** "payment" = money paid out on a bill; "receipt" = money received on an invoice. */
  kind: 'payment' | 'receipt';
  /** e.g. "BILL-0041 · Gulf Office Supplies" */
  documentLabel: string;
  total: number;
  balance: number;
  dueDate: string;
  /** Earliest allowed date (the bill / invoice date). */
  minDate: string;
  isSubmitting: boolean;
  onSubmit: (values: SettlementValues) => void;
  onClose: () => void;
}

const COPY = {
  payment: {
    title: 'Record payment',
    description: 'Money paid out against a bill.',
    dateLabel: 'Payment date',
    submit: 'Save payment',
    settles: 'This settles the bill in full. Its status will change to Paid.',
    icon: Wallet,
    tone: 'blue' as const,
  },
  receipt: {
    title: 'Record receipt',
    description: 'Money received from a customer against an invoice.',
    dateLabel: 'Receipt date',
    submit: 'Save receipt',
    settles: 'This settles the invoice in full. Its status will change to Paid.',
    icon: HandCoins,
    tone: 'green' as const,
  },
};

/** Design "ModalPayment" / "ModalReceipt": record a settlement against a document's balance. */
export function SettlementDialog(props: SettlementDialogProps) {
  if (!props.open) return null;
  return <SettlementDialogInner {...props} />;
}

function SettlementDialogInner({
  kind,
  documentLabel,
  total,
  balance,
  dueDate,
  minDate,
  isSubmitting,
  onSubmit,
  onClose,
}: SettlementDialogProps) {
  const copy = COPY[kind];
  const formId = useId();
  const { data: methods = [] } = useAdminPaymentMethodDropdown();
  const { register, handleSubmit, formState, setValue, control } = useForm<PaymentFormInput, unknown, PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { paymentDate: todayIso(), amount: String(balance), paymentMethodId: '', reference: '', notes: '' },
    mode: 'onChange',
  });
  const { errors } = formState;
  const amountInput = Number(useWatch({ control, name: 'amount' }));
  const overBalance = Number.isFinite(amountInput) && toFils(amountInput) > toFils(balance);
  const settlesInFull = Number.isFinite(amountInput) && toFils(amountInput) === toFils(balance);

  const submit = handleSubmit((values) => {
    if (toFils(values.amount) > toFils(balance)) return;
    onSubmit({
      date: values.paymentDate,
      amount: values.amount,
      paymentMethodId: values.paymentMethodId,
      reference: values.reference || null,
      notes: values.notes || null,
    });
  });

  const amountError = overBalance ? `More than the balance of ${formatMoney(balance)}.` : errors.amount?.message;
  const dateOutOfRange = (value: string) => value > todayIso() || value < minDate;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent onClose={onClose} className="max-w-[520px]">
        <DialogIconHeader icon={copy.icon} tone={copy.tone} title={copy.title} description={copy.description} />
        <DialogBody>
          <form id={formId} onSubmit={submit} className="flex flex-col gap-4" noValidate>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3.5 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{documentLabel}</div>
                <div className="text-xs text-muted-foreground">
                  Total {formatMoney(total)} · due {formatExpenseDate(dueDate)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Balance</div>
                <div className="text-base font-semibold tabular-nums">{formatMoney(balance)}</div>
              </div>
            </div>

            <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
              <FormField label={copy.dateLabel} htmlFor={`${formId}-date`} required error={errors.paymentDate?.message}>
                <Input
                  id={`${formId}-date`}
                  type="date"
                  min={minDate}
                  max={todayIso()}
                  {...register('paymentDate', {
                    validate: (v) => !dateOutOfRange(v) || 'Use a date between the document date and today',
                  })}
                />
              </FormField>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor={`${formId}-amount`} className="text-sm leading-none font-medium">
                    Amount (AED) <span className="text-destructive">*</span>
                  </label>
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={() => setValue('amount', String(balance), { shouldValidate: true })}
                  >
                    {kind === 'payment' ? 'Pay full balance' : 'Full balance'}
                  </button>
                </div>
                <MoneyInput id={`${formId}-amount`} aria-invalid={amountError ? true : undefined} {...register('amount')} />
                {amountError ? <p className="text-[13px] text-destructive">{amountError}</p> : null}
              </div>
              <FormField label="Method" htmlFor={`${formId}-method`} required error={errors.paymentMethodId?.message}>
                <Select id={`${formId}-method`} {...register('paymentMethodId')}>
                  <option value="">Select method…</option>
                  {methods.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Reference" htmlFor={`${formId}-ref`} error={errors.reference?.message}>
                <Input id={`${formId}-ref`} placeholder="Bank ref / cheque no." {...register('reference')} />
              </FormField>
            </div>
            <FormField label="Notes" htmlFor={`${formId}-notes`} error={errors.notes?.message}>
              <Textarea id={`${formId}-notes`} className="min-h-14" placeholder="Optional" {...register('notes')} />
            </FormField>
            {settlesInFull ? (
              <p className="flex gap-2.5 rounded-[10px] bg-status-success px-3 py-2.5 text-[13px] text-status-success-ink">
                <CircleCheck className="mt-px size-4 shrink-0" aria-hidden />
                {copy.settles}
              </p>
            ) : null}
          </form>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button loading={isSubmitting} type="submit" form={formId} size="lg" disabled={isSubmitting || overBalance}>
            {copy.submit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
