'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { employeeService } from '@/features/employees/services/employee.service';
import { useApiError } from '@/hooks/useApiError';
import { queryKeys } from '@/lib/query-keys';
import { SUCCESS_MESSAGES } from '@/messages/success.messages';
import { clearEmployeeSelection } from '@/store/employees/employees.slice';
import { useAppDispatch } from '@/store/hooks';
import type {
  BulkDeletePayload,
  BulkStatusPayload,
  CreateEmployeePayload,
  EmployeeListFilters,
  UpdateEmployeePayload,
} from '@/types/employee.types';

export interface CreateEmployeeVariables {
  payload: CreateEmployeePayload;
  profilePhoto?: File | null;
}

export interface UpdateEmployeeVariables {
  id: number;
  payload: UpdateEmployeePayload;
  profilePhoto?: File | null;
}

export function useEmployeeMutations() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { handleError } = useApiError();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
  };

  const createMutation = useMutation({
    mutationFn: ({ payload, profilePhoto }: CreateEmployeeVariables) =>
      employeeService.create(payload, profilePhoto),
    onSuccess: () => {
      invalidate();
      toast.success(SUCCESS_MESSAGES.CREATE);
    },
    onError: (err) => handleError(err),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload, profilePhoto }: UpdateEmployeeVariables) =>
      employeeService.update(id, payload, profilePhoto),
    onSuccess: () => {
      invalidate();
      toast.success(SUCCESS_MESSAGES.UPDATE);
    },
    onError: (err) => handleError(err),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => employeeService.remove(id),
    onSuccess: () => {
      invalidate();
      dispatch(clearEmployeeSelection());
      toast.success(SUCCESS_MESSAGES.DELETE);
    },
    onError: (err) => handleError(err),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (payload: BulkDeletePayload) => employeeService.bulkDelete(payload),
    onSuccess: (result) => {
      invalidate();
      dispatch(clearEmployeeSelection());
      toast.success(`Deleted ${result.affected} employee(s)`);
    },
    onError: (err) => handleError(err),
  });

  const bulkStatusMutation = useMutation({
    mutationFn: (payload: BulkStatusPayload) => employeeService.bulkUpdateStatus(payload),
    onSuccess: (result) => {
      invalidate();
      dispatch(clearEmployeeSelection());
      toast.success(`Updated ${result.affected} employee(s)`);
    },
    onError: (err) => handleError(err),
  });

  const exportMutation = useMutation({
    mutationFn: (filters: EmployeeListFilters) => employeeService.exportCsv(filters),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `employees-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    },
    onError: (err) => handleError(err),
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    bulkDeleteMutation,
    bulkStatusMutation,
    exportMutation,
  };
}
