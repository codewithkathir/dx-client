import { API_ENDPOINTS } from '@/services/endpoints';
import { BaseService } from '@/services/base.service';
import type {
  CategoryDropdownOption,
  DropdownOption,
  VehicleDropdownOption,
  WhomDropdownOption,
} from '@/types/expense.types';

class DropdownService extends BaseService {
  listCategories(): Promise<CategoryDropdownOption[]> {
    return this.get<CategoryDropdownOption[]>(API_ENDPOINTS.DROPDOWNS.CATEGORIES);
  }

  /** Vehicles currently assigned to the signed-in employee. */
  listMyVehicles(): Promise<VehicleDropdownOption[]> {
    return this.get<VehicleDropdownOption[]>(API_ENDPOINTS.DROPDOWNS.MY_VEHICLES);
  }

  listSubCategories(categoryId: number): Promise<DropdownOption[]> {
    return this.get<DropdownOption[]>(API_ENDPOINTS.DROPDOWNS.SUB_CATEGORIES, {
      params: { categoryId },
    });
  }

  listSubSubCategories(
    categoryId: number,
    subCategoryId: number,
  ): Promise<DropdownOption[]> {
    return this.get<DropdownOption[]>(API_ENDPOINTS.DROPDOWNS.SUB_SUB_CATEGORIES, {
      params: { categoryId, subCategoryId },
    });
  }

  listPaymentMethods(): Promise<DropdownOption[]> {
    return this.get<DropdownOption[]>(API_ENDPOINTS.DROPDOWNS.PAYMENT_METHODS);
  }

  listWhom(): Promise<WhomDropdownOption[]> {
    return this.get<WhomDropdownOption[]>(API_ENDPOINTS.DROPDOWNS.WHOM);
  }
}

export const dropdownService = new DropdownService();
