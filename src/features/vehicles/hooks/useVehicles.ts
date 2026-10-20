'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { vehicleService } from '@/features/vehicles/services/vehicle.service';
import { useApiError } from '@/hooks/useApiError';
import { queryKeys } from '@/lib/query-keys';
import type {
  MyOdometerPayload,
  OdometerReadingPayload,
  ServiceRecordPayload,
  ServiceTypeListFilters,
  ServiceTypePayload,
  VehicleExpenseFilters,
} from '@/types/vehicle.types';

export function useServiceRecords(assetId: number) {
  return useQuery({
    queryKey: queryKeys.vehicles.serviceRecords(assetId),
    queryFn: () => vehicleService.listServiceRecords(assetId),
    enabled: assetId > 0,
  });
}

export function useOdometerReadings(assetId: number, page: number) {
  return useQuery({
    queryKey: queryKeys.vehicles.odometer(assetId, page),
    queryFn: () => vehicleService.listOdometerReadings(assetId, page),
    enabled: assetId > 0,
    placeholderData: (prev) => prev,
  });
}

export function useVehicleExpenses(assetId: number, filters: VehicleExpenseFilters) {
  return useQuery({
    queryKey: queryKeys.vehicles.expenses(assetId, filters),
    queryFn: () => vehicleService.listVehicleExpenses(assetId, filters),
    enabled: assetId > 0,
    placeholderData: (prev) => prev,
  });
}

export function useVehicleExpenseSummary(assetId: number) {
  return useQuery({
    queryKey: queryKeys.vehicles.expenseSummary(assetId),
    queryFn: () => vehicleService.getVehicleExpenseSummary(assetId),
    enabled: assetId > 0,
  });
}

export function useServiceTypes(filters: ServiceTypeListFilters) {
  return useQuery({
    queryKey: queryKeys.vehicles.serviceTypes(filters),
    queryFn: () => vehicleService.listServiceTypes(filters),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
}

/** Records, readings and the asset (its odometer and history) all change together. */
function useInvalidateVehicle() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
  };
}

export function useServiceRecordMutations(assetId: number) {
  const invalidate = useInvalidateVehicle();
  const { handleError } = useApiError();

  const createRecord = useMutation({
    mutationFn: (payload: ServiceRecordPayload) => vehicleService.createServiceRecord(assetId, payload),
    onSuccess: (record) => {
      invalidate();
      toast.success(`${record.serviceTypeName} recorded`);
    },
    onError: (err) => handleError(err),
  });

  const updateRecord = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ServiceRecordPayload> }) =>
      vehicleService.updateServiceRecord(assetId, id, payload),
    onSuccess: () => {
      invalidate();
      toast.success('Service record updated');
    },
    onError: (err) => handleError(err),
  });

  const deleteRecord = useMutation({
    mutationFn: (id: number) => vehicleService.deleteServiceRecord(assetId, id),
    onSuccess: () => {
      invalidate();
      toast.success('Service record deleted');
    },
    onError: (err) => handleError(err),
  });

  return { createRecord, updateRecord, deleteRecord };
}

export function useOdometerMutations(assetId: number) {
  const invalidate = useInvalidateVehicle();
  const { handleError } = useApiError();

  const addReading = useMutation({
    mutationFn: (payload: OdometerReadingPayload) => vehicleService.addOdometerReading(assetId, payload),
    onSuccess: () => {
      invalidate();
      toast.success('Odometer reading added');
    },
    onError: (err) => handleError(err),
  });

  const deleteReading = useMutation({
    mutationFn: (readingId: number) => vehicleService.deleteOdometerReading(assetId, readingId),
    onSuccess: () => {
      invalidate();
      toast.success('Odometer reading deleted');
    },
    onError: (err) => handleError(err),
  });

  return { addReading, deleteReading };
}

export function useServiceTypeMutations() {
  const queryClient = useQueryClient();
  const { handleError } = useApiError();
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });

  const createType = useMutation({
    mutationFn: (payload: ServiceTypePayload) => vehicleService.createServiceType(payload),
    onSuccess: (type) => {
      invalidate();
      toast.success(`${type.name} added`);
    },
    onError: (err) => handleError(err),
  });

  const updateType = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ServiceTypePayload> }) =>
      vehicleService.updateServiceType(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success('Service type updated');
    },
    onError: (err) => handleError(err),
  });

  const deleteType = useMutation({
    mutationFn: (id: number) => vehicleService.deleteServiceType(id),
    onSuccess: () => {
      invalidate();
      toast.success('Service type deleted');
    },
    onError: (err) => handleError(err),
  });

  return { createType, updateType, deleteType };
}

/** Employee app */
export function useReportMyOdometer() {
  const queryClient = useQueryClient();
  const { handleError } = useApiError();
  return useMutation({
    mutationFn: ({ assignmentId, payload }: { assignmentId: number; payload: MyOdometerPayload }) =>
      vehicleService.reportMyOdometer(assignmentId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.assets.mine });
      toast.success('Odometer saved — thank you');
    },
    onError: (err) => handleError(err),
  });
}
