'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { employeeAccountService } from '@/features/employee-accounts/services/employee-account.service';
import { useApiError } from '@/hooks/useApiError';
import { queryKeys } from '@/lib/query-keys';
import type {
  AccountEntryFilters,
  AccountListFilters,
  AdjustmentPayload,
  CashEntryPayload,
} from '@/types/employee-account.types';

export function useEmployeeAccounts(filters: AccountListFilters) {
  return useQuery({
    queryKey: queryKeys.employeeAccounts.list(filters),
    queryFn: () => employeeAccountService.listAccounts(filters),
    placeholderData: (prev) => prev,
  });
}

export function useEmployeeAccountsSummary() {
  return useQuery({ queryKey: queryKeys.employeeAccounts.summary, queryFn: () => employeeAccountService.getSummary() });
}

export function useEmployeeAccount(employeeId: number) {
  return useQuery({
    queryKey: queryKeys.employeeAccounts.detail(employeeId),
    queryFn: () => employeeAccountService.getAccount(employeeId),
    enabled: employeeId > 0,
  });
}

export function useAccountEntries(employeeId: number, filters: AccountEntryFilters) {
  return useQuery({
    queryKey: queryKeys.employeeAccounts.entries(employeeId, filters),
    queryFn: () => employeeAccountService.listEntries(employeeId, filters),
    enabled: employeeId > 0,
    placeholderData: (prev) => prev,
  });
}

export function useAccountMutations() {
  const queryClient = useQueryClient();
  const { handleError } = useApiError();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.employeeAccounts.all });
    // The Employees list shows each balance.
    void queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
  };

  const giveAdvance = useMutation({
    mutationFn: ({ employeeId, payload }: { employeeId: number; payload: CashEntryPayload }) =>
      employeeAccountService.giveAdvance(employeeId, payload),
    onSuccess: (account) => {
      invalidate();
      toast.success(`Advance recorded for ${account.employeeName}`);
    },
    onError: (err) => handleError(err),
  });

  const recordReturn = useMutation({
    mutationFn: ({ employeeId, payload }: { employeeId: number; payload: CashEntryPayload }) =>
      employeeAccountService.recordReturn(employeeId, payload),
    onSuccess: () => {
      invalidate();
      toast.success('Return recorded');
    },
    onError: (err) => handleError(err),
  });

  const adjust = useMutation({
    mutationFn: ({ employeeId, payload }: { employeeId: number; payload: AdjustmentPayload }) =>
      employeeAccountService.adjust(employeeId, payload),
    onSuccess: () => {
      invalidate();
      toast.success('Balance adjusted');
    },
    onError: (err) => handleError(err),
  });

  const voidEntry = useMutation({
    mutationFn: ({ entryId, reason }: { entryId: number; reason: string }) => employeeAccountService.voidEntry(entryId, reason),
    onSuccess: () => {
      invalidate();
      toast.success('Entry voided');
    },
    onError: (err) => handleError(err),
  });

  return { giveAdvance, recordReturn, adjust, voidEntry };
}

/** Employee app */
export function useMyAccount() {
  return useQuery({ queryKey: queryKeys.employeeAccounts.mine, queryFn: () => employeeAccountService.getMyAccount() });
}

export function useMyAccountEntries(page: number) {
  return useQuery({
    queryKey: queryKeys.employeeAccounts.myEntries(page),
    queryFn: () => employeeAccountService.listMyEntries(page),
    placeholderData: (prev) => prev,
  });
}
