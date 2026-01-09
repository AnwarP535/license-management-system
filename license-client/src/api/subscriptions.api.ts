import apiClient from './client';

export interface Subscription {
  id: number;
  customer_id: number;
  pack_id: number;
  status: 'requested' | 'approved' | 'active' | 'inactive' | 'expired';
  pack_name: string;
  pack_sku: string;
  price: number;
  validity_months: number;
  requested_at: string;
  approved_at?: string;
  assigned_at?: string;
  expires_at?: string;
  deactivated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionRequest {
  sku: string;
}

export interface AssignSubscriptionRequest {
  pack_id: number;
}

export interface SubscriptionsResponse {
  success: boolean;
  subscriptions: Subscription[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export const subscriptionsApi = {
  getAll: async (
    page = 1,
    limit = 10,
    status?: string
  ): Promise<SubscriptionsResponse> => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    const response = await apiClient.get<SubscriptionsResponse>(
      `/api/v1/admin/subscriptions?${params}`
    );
    return response.data;
  },

  approve: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/api/v1/admin/subscriptions/${id}/approve`
    );
    return response.data;
  },

  assign: async (
    customerId: number,
    data: AssignSubscriptionRequest
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/api/v1/admin/customers/${customerId}/assign-subscription`,
      data
    );
    return response.data;
  },

  unassign: async (
    customerId: number,
    subscriptionId: number
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/api/v1/admin/customers/${customerId}/subscription/${subscriptionId}`
    );
    return response.data;
  },

  // Customer endpoints
  getCurrent: async (): Promise<{
    success: boolean;
    subscription: {
      id: number;
      pack: {
        name: string;
        sku: string;
        price: number;
        validity_months: number;
      };
      status: string;
      assigned_at: string;
      expires_at: string;
      is_valid: boolean;
    };
  }> => {
    const response = await apiClient.get('/api/v1/customer/subscription');
    return response.data;
  },

  request: async (sku: string): Promise<{
    success: boolean;
    message: string;
    subscription: {
      id: number;
      status: string;
      requested_at: string;
    };
  }> => {
    const response = await apiClient.post('/api/v1/customer/subscription', { sku });
    return response.data;
  },

  deactivate: async (): Promise<{
    success: boolean;
    message: string;
    deactivated_at: string;
  }> => {
    const response = await apiClient.delete('/api/v1/customer/subscription');
    return response.data;
  },

  getHistory: async (
    page = 1,
    limit = 10,
    sort: 'asc' | 'desc' = 'desc'
  ): Promise<{
    success: boolean;
    history: Array<{
      id: number;
      pack_name: string;
      status: string;
      assigned_at: string;
      expires_at: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
    });
    const response = await apiClient.get(`/api/v1/customer/subscription-history?${params}`);
    return response.data;
  },
};
