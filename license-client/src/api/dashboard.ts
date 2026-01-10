import apiClient from './client';

export interface DashboardData {
  total_customers: number;
  active_subscriptions: number;
  pending_requests: number;
  total_revenue: number;
  recent_activities: Array<{
    type: string;
    customer: string;
    pack: string;
    timestamp: string;
  }>;
}

export const dashboardApi = {
  get: async (): Promise<{ success: boolean; data: DashboardData }> => {
    const response = await apiClient.get('/api/v1/admin/dashboard');
    return response.data;
  },
};
