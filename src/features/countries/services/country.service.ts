import { AUTH_PORTAL, type AuthPortal } from '@/constants/auth.constants';
import { API_ENDPOINTS } from '@/services/endpoints';
import { BaseService } from '@/services/base.service';
import type { Country } from '@/types/country.types';

class CountryService extends BaseService {
  /** Active countries, A–Z. Admin and employee portals each have their own dropdown route. */
  list(portal: AuthPortal): Promise<Country[]> {
    return this.get<Country[]>(
      portal === AUTH_PORTAL.ADMIN ? API_ENDPOINTS.ADMIN_DROPDOWNS.COUNTRIES : API_ENDPOINTS.DROPDOWNS.COUNTRIES,
    );
  }
}

export const countryService = new CountryService();
