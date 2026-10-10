'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Camera, CircleAlert, CircleCheck, FileText, Loader2 } from 'lucide-react';

import { FormField } from '@/components/forms/FormField';
import { mobileButton } from '@/components/mobile/mobile.styles';
import { FileSourcePicker } from '@/components/shared/FileSourcePicker';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ACCEPTED_SUPPORT_FILE_TYPES, MAX_SUPPORT_FILE_MB } from '@/features/expenses/constants/expense.constants';
import {
  useCategoryDropdown,
  usePaymentMethodDropdown,
  useSubCategoryDropdown,
  useSubSubCategoryDropdown,
  useWhomDropdown,
} from '@/features/expenses/hooks/useExpenseQueries';
import { expenseFormSchema, type ExpenseFormValues } from '@/features/expenses/schemas/expense.schema';
import { formatExpenseDate, getTodayExpenseDate, supportFileLabel } from '@/features/expenses/utils/expense.utils';
import { validateSupportFile } from '@/features/expenses/utils/support-file.utils';
import { cn } from '@/lib/utils';
import type { CreateExpensePayload, Expense } from '@/types/expense.types';
import { formatMoney } from '@/utils/money.utils';

const RECEIPT_ACCEPT = `image/*,${ACCEPTED_SUPPORT_FILE_TYPES}`;

const INPUT = 'h-11 rounded-xl text-base';

interface ClaimFormProps {
  expense?: Expense;
  isSubmitting: boolean;
  onSubmit: (payload: CreateExpensePayload, receipt: File | null) => void;
}

/** Design "MobileNewExpense": receipt, big amount, category chips, details. Also used to edit a pending claim. */
export function ClaimForm({ expense, isSubmitting, onSubmit }: ClaimFormProps) {
  const formId = useId();
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  // Keep the previous receipt (if any) when the new one is rejected.
  const pickReceipt = (file: File) => {
    const problem = validateSupportFile(file, 'Receipt');
    setReceiptError(problem);
    if (!problem) setReceipt(file);
  };
  const previewUrl = useMemo(() => (receipt?.type.startsWith('image/') ? URL.createObjectURL(receipt) : null), [receipt]);
  useEffect(() => () => (previewUrl ? URL.revokeObjectURL(previewUrl) : undefined), [previewUrl]);

  const { data: categories = [] } = useCategoryDropdown();
  const { data: whomOptions = [] } = useWhomDropdown();
  const { data: paymentMethods = [] } = usePaymentMethodDropdown();

  // Claims are dated the day they are submitted (same rule as the desktop form).
  const date = expense?.date ?? getTodayExpenseDate();
  const { register, handleSubmit, setValue, control, formState } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      date,
      amount: expense?.amount ?? (undefined as unknown as number),
      whom: expense?.whom ?? 0,
      categoryId: expense?.categoryId ?? 0,
      subCategoryId: expense?.subCategoryId ?? 0,
      subSubCategoryId: expense?.subSubCategoryId ?? undefined,
      description: expense?.description ?? '',
      paymentMethodId: expense?.paymentMethodId ?? 0,
    },
  });
  const { errors } = formState;
  const [categoryId, subCategoryId, amount] = useWatch({ control, name: ['categoryId', 'subCategoryId', 'amount'] });
  const { data: subCategories = [] } = useSubCategoryDropdown(categoryId > 0 ? categoryId : undefined);
  const { data: subSubCategories = [] } = useSubSubCategoryDropdown(
    categoryId > 0 ? categoryId : undefined,
    subCategoryId > 0 ? subCategoryId : undefined,
  );
  const vatIncluded = Number.isFinite(amount) && amount > 0 ? Math.round((amount * 5) / 105 * 100) / 100 : null;

  const pickCategory = (id: number) => {
    if (id === categoryId) return;
    setValue('categoryId', id, { shouldValidate: formState.isSubmitted });
    setValue('subCategoryId', 0);
    setValue('subSubCategoryId', undefined);
  };
  const subCategoryField = register('subCategoryId', { valueAsNumber: true });

  const hasReceipt = Boolean(receipt || expense?.supportFile);
  const receiptName = receipt?.name ?? supportFileLabel(expense?.supportFile ?? null);

  return (
    <>
      <form
        id={formId}
        noValidate
        className="flex flex-1 flex-col gap-[18px] p-5"
        onSubmit={handleSubmit((values) =>
          onSubmit(
            {
              date: values.date,
              amount: values.amount,
              whom: values.whom,
              categoryId: values.categoryId,
              subCategoryId: values.subCategoryId,
              subSubCategoryId: values.subSubCategoryId ?? null,
              description: values.description || null,
              paymentMethodId: values.paymentMethodId,
            },
            receipt,
          ),
        )}
      >
        {hasReceipt ? (
          <div className="flex items-stretch gap-3">
            <div className="flex h-[120px] w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted text-muted-foreground">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
                <img src={previewUrl} alt="Receipt preview" className="size-full object-cover" />
              ) : (
                <FileText className="size-8" aria-hidden />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-status-success-ink">
                <CircleCheck className="size-4" aria-hidden />
                Receipt attached
              </div>
              <div className="truncate text-[13px] text-muted-foreground">{receiptName}</div>
              <FileSourcePicker
                accept={RECEIPT_ACCEPT}
                onPick={pickReceipt}
                size="sm"
                cameraLabel="Retake"
                deviceLabel="Replace"
                cameraTitle="Photo of your receipt"
                maxBytes={MAX_SUPPORT_FILE_MB * 1024 * 1024}
                describedBy={receiptError ? `${formId}-receipt-error` : undefined}
              />
            </div>
          </div>
        ) : (
          <div
            className={cn(
              'flex flex-col gap-3 rounded-xl border border-dashed bg-background p-4',
              receiptError ? 'border-destructive' : 'border-input-border',
            )}
          >
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue-50 text-primary" aria-hidden>
                <Camera className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium">Add a receipt</span>
                <span className="block text-[13px] text-muted-foreground">
                  JPG, PNG or PDF · up to {MAX_SUPPORT_FILE_MB} MB
                </span>
              </span>
            </div>
            <FileSourcePicker
              accept={RECEIPT_ACCEPT}
              onPick={pickReceipt}
              className="grid grid-cols-2"
              buttonClassName="h-11 text-[15px]"
              cameraLabel="Take photo"
              deviceLabel="Choose file"
              cameraTitle="Photo of your receipt"
              maxBytes={MAX_SUPPORT_FILE_MB * 1024 * 1024}
              describedBy={receiptError ? `${formId}-receipt-error` : undefined}
            />
          </div>
        )}
        {receiptError ? (
          <p id={`${formId}-receipt-error`} role="alert" className="-mt-2.5 flex items-start gap-1.5 text-[13px] text-destructive">
            <CircleAlert className="mt-px size-4 shrink-0" aria-hidden />
            {receiptError}
          </p>
        ) : null}

        <div className="space-y-2">
          <label htmlFor={`${formId}-amount`} className="text-sm font-medium">
            Amount <span className="text-destructive">*</span>
          </label>
          <div
            className={cn(
              'flex h-14 items-center gap-2 rounded-xl border-2 px-3.5 transition-shadow focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(31,79,209,.18)]',
              errors.amount ? 'border-destructive' : 'border-input-border',
            )}
          >
            <span className="text-base font-semibold text-muted-foreground">AED</span>
            <input
              id={`${formId}-amount`}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              aria-invalid={errors.amount ? true : undefined}
              className="min-w-0 flex-1 bg-transparent text-2xl font-semibold tabular-nums outline-none placeholder:text-muted-foreground/50"
              {...register('amount', { valueAsNumber: true })}
            />
          </div>
          {errors.amount ? (
            <p className="text-[13px] text-destructive">{errors.amount.message}</p>
          ) : vatIncluded ? (
            <p className="text-xs text-muted-foreground">If VAT 5% is included: {formatMoney(vatIncluded)}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <span id={`${formId}-cat`} className="text-sm font-medium">
            Category <span className="text-destructive">*</span>
          </span>
          <div role="radiogroup" aria-labelledby={`${formId}-cat`} className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const on = c.id === categoryId;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => pickCategory(c.id)}
                  className={cn(
                    'h-10 rounded-full border px-3.5 text-sm transition-colors',
                    on ? 'border-primary bg-brand-blue-50 font-semibold text-brand-blue-hover' : 'border-input-border bg-card font-medium text-[#33415a]',
                  )}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
          {errors.categoryId ? <p className="text-[13px] text-destructive">{errors.categoryId.message}</p> : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Date" htmlFor={`${formId}-date`} error={errors.date?.message}>
            <input type="hidden" {...register('date')} />
            <Input id={`${formId}-date`} readOnly value={formatExpenseDate(date)} className={cn(INPUT, 'bg-muted')} />
          </FormField>
          <FormField label="Sub category" htmlFor={`${formId}-sub`} required error={errors.subCategoryId?.message}>
            <Select
              id={`${formId}-sub`}
              className={INPUT}
              disabled={!categoryId}
              {...subCategoryField}
              onChange={(e) => {
                void subCategoryField.onChange(e);
                setValue('subSubCategoryId', undefined);
              }}
            >
              <option value={0}>Select…</option>
              {subCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        {subSubCategories.length > 0 ? (
          <FormField label="Detail" htmlFor={`${formId}-subsub`}>
            <Select
              id={`${formId}-subsub`}
              className={INPUT}
              {...register('subSubCategoryId', { setValueAs: (v) => (v === '' || v === '0' ? undefined : Number(v)) })}
            >
              <option value="">Optional</option>
              {subSubCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FormField>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Whom" htmlFor={`${formId}-whom`} required error={errors.whom?.message}>
            <Select id={`${formId}-whom`} className={INPUT} {...register('whom', { valueAsNumber: true })}>
              <option value={0}>Select…</option>
              {whomOptions.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.empName}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Paid with" htmlFor={`${formId}-pay`} required error={errors.paymentMethodId?.message}>
            <Select id={`${formId}-pay`} className={INPUT} {...register('paymentMethodId', { valueAsNumber: true })}>
              <option value={0}>Select…</option>
              {paymentMethods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <FormField label="What was it for?" htmlFor={`${formId}-desc`} error={errors.description?.message}>
          <Textarea id={`${formId}-desc`} className="min-h-16 rounded-xl text-base" placeholder="e.g. Lunch with the client's team" {...register('description')} />
        </FormField>
      </form>

      <div className="sticky bottom-0 flex flex-col gap-2 border-t border-border bg-card px-5 pt-3 pb-[max(28px,env(safe-area-inset-bottom))]">
        <button type="submit" form={formId} disabled={isSubmitting} className={mobileButton('primary')}>
          {isSubmitting ? <Loader2 className="size-5 animate-spin" aria-hidden /> : null}
          {expense ? 'Save changes' : 'Submit for approval'}
        </button>
        <p className="text-center text-xs text-muted-foreground">You can edit or delete it until an administrator approves it.</p>
      </div>
    </>
  );
}
