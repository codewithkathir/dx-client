'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ACCEPTED_SUPPORT_FILE_TYPES } from '@/features/expenses/constants/expense.constants';
import {
  useCategoryDropdown,
  usePaymentMethodDropdown,
  useSubCategoryDropdown,
  useSubSubCategoryDropdown,
  useWhomDropdown,
} from '@/features/expenses/hooks/useExpenseQueries';
import {
  expenseFormSchema,
  type ExpenseFormValues,
} from '@/features/expenses/schemas/expense.schema';
import { formatExpenseDate, getTodayExpenseDate } from '@/features/expenses/utils/expense.utils';
import type { Expense } from '@/types/expense.types';

interface ExpenseFormProps {
  expense?: Expense;
  isSubmitting?: boolean;
  onSubmit: (values: ExpenseFormValues, supportFile?: File | null) => void;
  onCancel: () => void;
}

export function ExpenseForm({ expense, isSubmitting, onSubmit, onCancel }: ExpenseFormProps) {
  const [supportFile, setSupportFile] = useState<File | null>(null);
  const expenseDate = expense?.date ?? getTodayExpenseDate();

  const { data: categories = [] } = useCategoryDropdown();
  const { data: whomOptions = [] } = useWhomDropdown();
  const { data: paymentMethods = [] } = usePaymentMethodDropdown();

  const { register, handleSubmit, watch, setValue, formState } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      date: expenseDate,
      amount: expense?.amount ?? 0,
      whom: expense?.whom ?? 0,
      categoryId: expense?.categoryId ?? 0,
      subCategoryId: expense?.subCategoryId ?? 0,
      subSubCategoryId: expense?.subSubCategoryId ?? undefined,
      description: expense?.description ?? '',
      paymentMethodId: expense?.paymentMethodId ?? 0,
    },
  });

  const categoryId = watch('categoryId');
  const subCategoryId = watch('subCategoryId');

  const { data: subCategories = [] } = useSubCategoryDropdown(
    categoryId > 0 ? categoryId : undefined,
  );
  const { data: subSubCategories = [] } = useSubSubCategoryDropdown(
    categoryId > 0 ? categoryId : undefined,
    subCategoryId > 0 ? subCategoryId : undefined,
  );

  useEffect(() => {
    if (!expense) {
      setValue('subCategoryId', 0);
      setValue('subSubCategoryId', undefined);
    }
  }, [categoryId, expense, setValue]);

  useEffect(() => {
    if (!expense) {
      setValue('subSubCategoryId', undefined);
    }
  }, [subCategoryId, expense, setValue]);

  useEffect(() => {
    setValue('date', expenseDate);
  }, [expenseDate, setValue]);

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values, supportFile))}
      className="space-y-4"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Date" htmlFor="expenseDate" required error={formState.errors.date?.message}>
          <Input id="expenseDate" type="hidden" {...register('date')} />
          <Input
            id="expenseDateDisplay"
            type="text"
            readOnly
            disabled
            value={formatExpenseDate(expenseDate)}
            className="bg-muted"
          />
        </FormField>

        <FormField label="Amount" htmlFor="expenseAmount" required error={formState.errors.amount?.message}>
          <Input
            id="expenseAmount"
            type="number"
            step="0.01"
            min="0"
            {...register('amount', { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <FormField label="Whom" htmlFor="expenseWhom" required error={formState.errors.whom?.message}>
        <Select id="expenseWhom" {...register('whom', { valueAsNumber: true })}>
          <option value={0}>Select employee</option>
          {whomOptions.map((w) => (
            <option key={w.id} value={w.id}>
              {w.empName}
              {w.employeeCode ? ` (${w.employeeCode})` : ''}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Category"
          htmlFor="expenseCategory"
          required
          error={formState.errors.categoryId?.message}
        >
          <Select id="expenseCategory" {...register('categoryId', { valueAsNumber: true })}>
            <option value={0}>Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Sub category"
          htmlFor="expenseSubCategory"
          required
          error={formState.errors.subCategoryId?.message}
        >
          <Select
            id="expenseSubCategory"
            disabled={!categoryId}
            {...register('subCategoryId', { valueAsNumber: true })}
          >
            <option value={0}>Select sub category</option>
            {subCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField
        label="Sub sub category"
        htmlFor="expenseSubSubCategory"
        error={formState.errors.subSubCategoryId?.message}
      >
        <Select
          id="expenseSubSubCategory"
          disabled={!subCategoryId}
          {...register('subSubCategoryId', {
            setValueAs: (v) => (v === '' || v === '0' ? undefined : Number(v)),
          })}
        >
          <option value="">Optional</option>
          {subSubCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField
        label="Payment method"
        htmlFor="expensePayment"
        required
        error={formState.errors.paymentMethodId?.message}
      >
        <Select id="expensePayment" {...register('paymentMethodId', { valueAsNumber: true })}>
          <option value={0}>Select payment method</option>
          {paymentMethods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField
        label="Description"
        htmlFor="expenseDescription"
        error={formState.errors.description?.message}
      >
        <Textarea id="expenseDescription" rows={3} {...register('description')} />
      </FormField>

      <FormField label="Supporting document" htmlFor="expenseSupportFile">
        <Input
          id="expenseSupportFile"
          type="file"
          accept={ACCEPTED_SUPPORT_FILE_TYPES}
          onChange={(e) => setSupportFile(e.target.files?.[0] ?? null)}
        />
        {expense?.supportFile ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Current file: {expense.supportFile.split('/').pop()}
          </p>
        ) : null}
      </FormField>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : expense ? 'Update expense' : 'Submit expense'}
        </Button>
      </div>
    </form>
  );
}
