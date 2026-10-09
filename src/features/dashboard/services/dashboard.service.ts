import { API_ENDPOINTS } from '@/services/endpoints';
import { BaseService } from '@/services/base.service';
import type { DashboardAlerts, DashboardOverview, SearchResult } from '@/types/dashboard.types';

class DashboardService extends BaseService {
  overview(): Promise<DashboardOverview> {
    return this.get<DashboardOverview>(API_ENDPOINTS.DASHBOARD.OVERVIEW);
  }

  alerts(): Promise<DashboardAlerts> {
    return this.get<DashboardAlerts>(API_ENDPOINTS.DASHBOARD.ALERTS);
  }

  search(q: string): Promise<SearchResult[]> {
    return this.get<SearchResult[]>(API_ENDPOINTS.DASHBOARD.SEARCH, { params: { q } });
  }
}

export const dashboardService = new DashboardService();
