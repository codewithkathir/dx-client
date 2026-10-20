'use client';

import { useId } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Banknote, Scale, Undo2 } from 'lucide-react';

import { DatePicker } from '@/components/forms/DatePicker';
import { FormField } from '@/components/forms/FormField';
import { MoneyInput } from '@/components/forms/MoneyInput';
import { SegmentedRadio } from '@/components/forms/SegmentedRadio';
import { DialogIconHeader } from '@/components/shared/DialogIconHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAdminPaymentMethodDropdown, useAdminWhomDropdown } from '@/features/admin-expenses/hooks/useAdminExpenseQueries';
import { useAccountMutations } from '@/features/employee-accounts/hooks/useEmployeeAccounts';
import { accountEntryFormSchema, type AccountEntryFormValues } from '@/features/employee-accounts/schemas/account-entry.schema';
import { formatMoney, todayIso } from '@/utils/money.utils';

export type AccountEntryKind = 'advance' | 'return' | 'adjustment';

interface AccountEntryDialogProps {
  kind: AccountEntryKind | null;
  /** Omit to pick the employee in the dialog (Give advance from the list page). */
  account?: { employeeId: number; employeeName: string; balance: number };
  onClose: () => void;
}

const COPY: Record<AccountEntryKind, { title: string; description: string; submit: string }> = {
  advance: {
    title: 'Give advance',
    description: 'Money handed to the employee. Their approved claims are paid from it first.',
    submit: 'Record advance',
  },
  return: { title: 'Record return', description: 'Unused advance money the employee handed back.', submit: 'Record return' },
  adjustment: {
    title: 'Adjust balance',
    description: 'Correct the balance, e.g. a cash-count difference or a lost receipt written off.',
    submit: 'Save adjustment',
  },
};

const ICONS = { advance: Banknote, return: Undo2, adjustment: Scale } as const;

export function AccountEntryDialog(props: AccountEntryDialogProps) {
  if (!props.kind) return null;
  return <AccountEntryInner {...props} kind={props.kind} />;
}

function AccountEntryInner({ kind, account, onClose }: AccountEntryDialogProps & { kind: AccountEntryKind }) {
  const formId = useId();
  const { data: methods = [] } = useAdminPaymentMethodDropdown();
  const { data: employees = [] } = useAdminWhomDropdown();
  const { giveAdvance, recordReturn, adjust } = useAccountMutations();
  const pending = giveAdvance.isPending || recordReturn.isPending || adjust.isPending;
  const { register, handleSubmit, formState, control, setError } = useForm<AccountEntryFormValues>({
    resolver: zodResolver(accountEntryFormSchema),
    defaultValues: {
      kind,
      direction: 'deduct',
      amount: '',
      entryDate: todayIso(),
      paymentMethodId: '',
      reference: '',
      notes: '',
      employeeId: account ? String(account.employeeId) : '',
    },
  });
  const { errors } = formState;
  const copy = COPY[kind];

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent onClose={onClose} className="max-w-[520px]">
        <DialogIconHeader
          icon={ICONS[kind]}
          tone={kind === 'return' ? 'green' : 'blue'}
          title={account ? `${copy.title} · ${account.employeeName}` : copy.title}
          description={account ? `${copy.description} Current balance ${formatMoney(account.balance)}.` : copy.description}
        />
        <form
          id={formId}
          noValidate
          className="flex flex-col gap-4 overflow-y-auto px-6 py-5"
          onSubmit={handleSubmit((v) => {
            const target = account?.employeeId ?? Number(v.employeeId);
            if (!target) {
              setError('employeeId', { message: 'Pick an employee' });
              return;
            }
            const done = { onSuccess: onClose };
            if (kind === 'adjustment') {
              const amount = Number(v.amount) * (v.direction === 'deduct' ? -1 : 1);
              adjust.mutate({ employeeId: target, payload: { amount, entryDate: v.entryDate, notes: v.notes } }, done);
              return;
            }
            const payload = {
              amount: Number(v.amount),
              entryDate: v.entryDate,
              paymentMethodId: Number(v.paymentMethodId),
              reference: v.reference || null,
              notes: v.notes || null,
            };
            if (kind === 'advance') giveAdvance.mutate({ employeeId: target, payload }, done);
            else recordReturn.mutate({ employeeId: target, payload }, done);
          })}
        >
          {account ? null : (
            <FormField label="Employee" htmlFor={`${formId}-emp`} required error={errors.employeeId?.message}>
              <Select id={`${formId}-emp`} {...register('employeeId')}>
                <option value="">Select employee…</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.empName}
                    {e.employeeCode ? ` (${e.employeeCode})` : ''}
                  </option>
                ))}
              </Select>
            </FormField>
          )}
          {kind === 'adjustment' ? (
            <FormField label="Direction" htmlFor={`${formId}-dir`}>
              <SegmentedRadio
                id={`${formId}-dir`}
                label="Direction"
                registration={register('direction')}
                options={[
                  { value: 'deduct', label: 'Deduct from balance' },
                  { value: 'add', label: 'Add to balance' },
                ]}
              />
            </FormField>
          ) : null}
          <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
            <FormField label="Amount" htmlFor={`${formId}-amount`} required error={errors.amount?.message}>
              <MoneyInput id={`${formId}-amount`} min="0" autoFocus {...register('amount')} />
            </FormField>
            <FormField label="Date" htmlFor={`${formId}-date`} required error={errors.entryDate?.message}>
              <Controller
                control={control}
                name="entryDate"
                render={({ field }) => (
                  <DatePicker id={`${formId}-date`} max={todayIso()} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
                )}
              />
            </FormField>
            {kind !== 'adjustment' ? (
              <>
                <FormField
                  label={kind === 'advance' ? 'Paid by' : 'Returned by'}
                  htmlFor={`${formId}-method`}
                  required
                  error={errors.paymentMethodId?.message}
                >
                  <Select id={`${formId}-method`} {...register('paymentMethodId')}>
                    <option value="">Select…</option>
                    {methods.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Reference" htmlFor={`${formId}-ref`} error={errors.reference?.message}>
                  <Input id={`${formId}-ref`} placeholder="Voucher or transfer no." {...register('reference')} />
                </FormField>
              </>
            ) : null}
          </div>
          <FormField
            label={kind === 'adjustment' ? 'Reason' : 'Notes'}
            htmlFor={`${formId}-notes`}
            required={kind === 'adjustment'}
            error={errors.notes?.message}
          >
            <Textarea
              id={`${formId}-notes`}
              className="min-h-14"
              placeholder={kind === 'advance' ? 'e.g. Site visits, Abu Dhabi week' : kind === 'return' ? 'e.g. Unused cash' : 'e.g. Cash count difference'}
              {...register('notes')}
            />
          </FormField>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form={formId} size="lg" loading={pending}>
            {copy.submit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
