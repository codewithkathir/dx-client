import { API_ENDPOINTS } from '@/services/endpoints';
import { BaseService } from '@/services/base.service';
import type {
  AssetDetail,
  AssetListFilters,
  AssetListResult,
  AssetPayload,
  AssetSummary,
  AssignAssetPayload,
  MyAsset,
  MyAssets,
  ReturnAssetPayload,
} from '@/types/asset.types';

function buildListParams(filters: AssetListFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    order: filters.order ?? 'desc',
  };
  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  if (filters.category) params.category = filters.category;
  if (filters.employeeId) params.employeeId = filters.employeeId;
  return params;
}

class AssetService extends BaseService {
  list(filters: AssetListFilters): Promise<AssetListResult> {
    return this.getPaginated(API_ENDPOINTS.ASSETS.LIST, { params: buildListParams(filters) });
  }

  summary(): Promise<AssetSummary> {
    return this.get<AssetSummary>(API_ENDPOINTS.ASSETS.SUMMARY);
  }

  getById(id: number): Promise<AssetDetail> {
    return this.get<AssetDetail>(API_ENDPOINTS.ASSETS.DETAIL(id));
  }

  create(payload: AssetPayload): Promise<AssetDetail> {
    return this.post<AssetDetail>(API_ENDPOINTS.ASSETS.LIST, payload);
  }

  update(id: number, payload: Partial<AssetPayload>): Promise<AssetDetail> {
    return this.put<AssetDetail>(API_ENDPOINTS.ASSETS.DETAIL(id), payload);
  }

  remove(id: number): Promise<void> {
    return this.delete<void>(API_ENDPOINTS.ASSETS.DETAIL(id));
  }

  assign(id: number, payload: AssignAssetPayload): Promise<AssetDetail> {
    return this.post<AssetDetail>(API_ENDPOINTS.ASSETS.ASSIGN(id), payload);
  }

  returnAsset(id: number, payload: ReturnAssetPayload): Promise<AssetDetail> {
    return this.post<AssetDetail>(API_ENDPOINTS.ASSETS.RETURN(id), payload);
  }

  addImage(id: number, file: File): Promise<AssetDetail> {
    const form = new FormData();
    form.append('image', file);
    return this.post<AssetDetail>(API_ENDPOINTS.ASSETS.IMAGES(id), form);
  }

  removeImage(id: number, imageId: number): Promise<AssetDetail> {
    return this.delete<AssetDetail>(API_ENDPOINTS.ASSETS.IMAGE(id, imageId));
  }

  /** Employee app */
  mine(): Promise<MyAssets> {
    return this.get<MyAssets>(API_ENDPOINTS.EMPLOYEE_ASSETS.LIST);
  }

  acknowledge(assignmentId: number): Promise<MyAsset> {
    return this.post<MyAsset>(API_ENDPOINTS.EMPLOYEE_ASSETS.ACKNOWLEDGE(assignmentId));
  }
}

export const assetService = new AssetService();
