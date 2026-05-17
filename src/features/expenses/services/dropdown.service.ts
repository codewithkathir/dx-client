import { API_ENDPOINTS } from '@/services/endpoints';
import { BaseService } from '@/services/base.service';
import type { DropdownOption, WhomDropdownOption } from '@/types/expense.types';

class DropdownService extends BaseService {
  listCategories(): Promise<DropdownOption[]> {
    return this.get<DropdownOption[]>(API_ENDPOINTS.DROPDOWNS.CATEGORIES);
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
