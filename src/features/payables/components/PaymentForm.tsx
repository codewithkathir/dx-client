'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useAdminPaymentMethodDropdown } from '@/features/admin-expenses/hooks/useAdminExpenseQueries';
import {
  paymentSchema,
  type PaymentFormInput,
  type PaymentFormValues,
} from '@/features/payables/schemas/bill.schema';
import type { PaymentPayload } from '@/types/finance.types';
import { formatMoney, toFils, todayIso } from '@/utils/money.utils';

interface PaymentFormProps {
  balance: number;
  /** Earliest allowed date (the bill or invoice date). */
  billDate: string;
  /** Wording for receipts on invoices; defaults to payments. */
  dateLabel?: string;
  submitLabel?: string;
  isSubmitting: boolean;
  onSubmit: (payload: PaymentPayload) => void;
  onCancel: () => void;
}

export function PaymentForm({
  balance,
  billDate,
  dateLabel = 'Payment date',
  submitLabel = 'Record payment',
  isSubmitting,
  onSubmit,
  onCancel,
}: PaymentFormProps) {
  const { data: methods = [] } = useAdminPaymentMethodDropdown();
  const { register, handleSubmit, formState, setError } = useForm<PaymentFormInput, unknown, PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentDate: todayIso(),
      amount: String(balance),
      paymentMethodId: '',
      reference: '',
      notes: '',
    },
  });
  const { errors } = formState;

  const submit = handleSubmit((values) => {
    // Same checks the server enforces, shown inline instead of as a toast.
    if (toFils(values.amount) > toFils(balance)) {
      setError('amount', { message: `Can't exceed the balance of ${formatMoney(balance)}` });
      return;
    }
    if (values.paymentDate > todayIso() || values.paymentDate < billDate) {
      setError('paymentDate', { message: 'Use a date between the document date and today' });
      return;
    }
    onSubmit({
      paymentDate: values.paymentDate,
      amount: values.amount,
      paymentMethodId: values.paymentMethodId,
      reference: values.reference || null,
      notes: values.notes || null,
    });
  });

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Amount (AED)" htmlFor="amount" required error={errors.amount?.message}>
          <Input id="amount" type="number" inputMode="decimal" step="0.01" min="0.01" {...register('amount')} />
        </FormField>
        <FormField label={dateLabel} htmlFor="paymentDate" required error={errors.paymentDate?.message}>
          <Input id="paymentDate" type="date" min={billDate} max={todayIso()} {...register('paymentDate')} />
        </FormField>
        <FormField label="Method" htmlFor="paymentMethodId" required error={errors.paymentMethodId?.message}>
          <Select id="paymentMethodId" {...register('paymentMethodId')}>
            <option value="">Select method…</option>
            {methods.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Reference" htmlFor="reference" error={errors.reference?.message}>
          <Input id="reference" placeholder="Bank ref / cheque no." {...register('reference')} />
        </FormField>
        <FormField label="Notes" htmlFor="notes" error={errors.notes?.message} className="sm:col-span-2">
          <Input id="notes" {...register('notes')} />
        </FormField>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Recording…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
