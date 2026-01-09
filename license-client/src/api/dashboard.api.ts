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

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

export const dashboardApi = {
  getDashboard: async (): Promise<DashboardResponse> => {
    const response = await apiClient.get<DashboardResponse>('/api/v1/admin/dashboard');
    return response.data;
  },
};
