import { API_ENDPOINTS } from '@/services/endpoints';
import { BaseService } from '@/services/base.service';
import type {
  LatestOdometer,
  MyOdometerPayload,
  OdometerReadingListResult,
  OdometerReadingPayload,
  ServiceRecord,
  ServiceRecordListResult,
  ServiceRecordPayload,
  ServiceType,
  ServiceTypeListFilters,
  ServiceTypeListResult,
  ServiceTypePayload,
  VehicleExpenseFilters,
  VehicleExpenseListResult,
  VehicleExpenseSummary,
} from '@/types/vehicle.types';

function buildServiceTypeParams(filters: ServiceTypeListFilters): Record<string, string | number> {
  const params: Record<string, string | number> = { page: filters.page ?? 1, limit: filters.limit ?? 100 };
  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  if (filters.category) params.category = filters.category;
  return params;
}

/** Maintenance log, odometer readings and service types for vehicles (and other assets). */
class VehicleService extends BaseService {
  listServiceRecords(assetId: number): Promise<ServiceRecordListResult> {
    // The full history fits in one page; the tab works out what's due from it.
    return this.getPaginated(API_ENDPOINTS.VEHICLES.SERVICE_RECORDS(assetId), { params: { page: 1, limit: 100 } });
  }

  createServiceRecord(assetId: number, payload: ServiceRecordPayload): Promise<ServiceRecord> {
    return this.post<ServiceRecord>(API_ENDPOINTS.VEHICLES.SERVICE_RECORDS(assetId), payload);
  }

  updateServiceRecord(assetId: number, recordId: number, payload: Partial<ServiceRecordPayload>): Promise<ServiceRecord> {
    return this.put<ServiceRecord>(API_ENDPOINTS.VEHICLES.SERVICE_RECORD(assetId, recordId), payload);
  }

  deleteServiceRecord(assetId: number, recordId: number): Promise<void> {
    return this.delete<void>(API_ENDPOINTS.VEHICLES.SERVICE_RECORD(assetId, recordId));
  }

  listOdometerReadings(assetId: number, page: number): Promise<OdometerReadingListResult> {
    return this.getPaginated(API_ENDPOINTS.VEHICLES.ODOMETER_READINGS(assetId), { params: { page, limit: 10 } });
  }

  addOdometerReading(assetId: number, payload: OdometerReadingPayload): Promise<LatestOdometer | null> {
    return this.post<LatestOdometer | null>(API_ENDPOINTS.VEHICLES.ODOMETER_READINGS(assetId), payload);
  }

  deleteOdometerReading(assetId: number, readingId: number): Promise<LatestOdometer | null> {
    return this.delete<LatestOdometer | null>(API_ENDPOINTS.VEHICLES.ODOMETER_READING(assetId, readingId));
  }

  listVehicleExpenses(assetId: number, filters: VehicleExpenseFilters): Promise<VehicleExpenseListResult> {
    const params: Record<string, string | number> = { page: filters.page ?? 1, limit: filters.limit ?? 10 };
    if (filters.stage) params.stage = filters.stage;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    return this.getPaginated(API_ENDPOINTS.VEHICLES.EXPENSES(assetId), { params });
  }

  getVehicleExpenseSummary(assetId: number): Promise<VehicleExpenseSummary> {
    return this.get<VehicleExpenseSummary>(API_ENDPOINTS.VEHICLES.EXPENSES_SUMMARY(assetId));
  }

  listServiceTypes(filters: ServiceTypeListFilters): Promise<ServiceTypeListResult> {
    return this.getPaginated(API_ENDPOINTS.VEHICLES.SERVICE_TYPES, { params: buildServiceTypeParams(filters) });
  }

  createServiceType(payload: ServiceTypePayload): Promise<ServiceType> {
    return this.post<ServiceType>(API_ENDPOINTS.VEHICLES.SERVICE_TYPES, payload);
  }

  updateServiceType(id: number, payload: Partial<ServiceTypePayload>): Promise<ServiceType> {
    return this.put<ServiceType>(API_ENDPOINTS.VEHICLES.SERVICE_TYPE(id), payload);
  }

  deleteServiceType(id: number): Promise<void> {
    return this.delete<void>(API_ENDPOINTS.VEHICLES.SERVICE_TYPE(id));
  }

  /** Employee app */
  reportMyOdometer(assignmentId: number, payload: MyOdometerPayload): Promise<LatestOdometer | null> {
    return this.post<LatestOdometer | null>(API_ENDPOINTS.EMPLOYEE_ASSETS.ODOMETER(assignmentId), payload);
  }
}

export const vehicleService = new VehicleService();
