import { API_ENDPOINTS } from '@/services/endpoints';
import { BaseService } from '@/services/base.service';
import type {
  CategoryDropdownOption,
  DropdownOption,
  VehicleDropdownOption,
  WhomDropdownOption,
} from '@/types/expense.types';

class AdminDropdownService extends BaseService {
  listCategories(): Promise<CategoryDropdownOption[]> {
    return this.get<CategoryDropdownOption[]>(API_ENDPOINTS.ADMIN_DROPDOWNS.CATEGORIES);
  }

  listSubCategories(categoryId: number): Promise<DropdownOption[]> {
    return this.get<DropdownOption[]>(API_ENDPOINTS.ADMIN_DROPDOWNS.SUB_CATEGORIES, {
      params: { categoryId },
    });
  }

  listSubSubCategories(
    categoryId: number,
    subCategoryId: number,
  ): Promise<DropdownOption[]> {
    return this.get<DropdownOption[]>(API_ENDPOINTS.ADMIN_DROPDOWNS.SUB_SUB_CATEGORIES, {
      params: { categoryId, subCategoryId },
    });
  }

  listPaymentMethods(): Promise<DropdownOption[]> {
    return this.get<DropdownOption[]>(API_ENDPOINTS.ADMIN_DROPDOWNS.PAYMENT_METHODS);
  }

  listVehicles(): Promise<VehicleDropdownOption[]> {
    return this.get<VehicleDropdownOption[]>(API_ENDPOINTS.ADMIN_DROPDOWNS.VEHICLES);
  }

  listWhom(): Promise<WhomDropdownOption[]> {
    return this.get<WhomDropdownOption[]>(API_ENDPOINTS.ADMIN_DROPDOWNS.WHOM);
  }
}

export const adminDropdownService = new AdminDropdownService();
