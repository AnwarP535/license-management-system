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
  requested_at?: string;
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

export const subscriptionsApi = {
  // Admin APIs
  list: async (page: number = 1, limit: number = 10, status?: string) => {
    const response = await apiClient.get('/api/v1/admin/subscriptions', {
      params: { page, limit, status },
    });
    return response.data;
  },

  approve: async (subscriptionId: number) => {
    const response = await apiClient.post(
      `/api/v1/admin/subscriptions/${subscriptionId}/approve`
    );
    return response.data;
  },

  assign: async (customerId: number, data: AssignSubscriptionRequest) => {
    const response = await apiClient.post(
      `/api/v1/admin/customers/${customerId}/assign-subscription`,
      data
    );
    return response.data;
  },

  unassign: async (customerId: number, subscriptionId: number) => {
    const response = await apiClient.delete(
      `/api/v1/admin/customers/${customerId}/subscription/${subscriptionId}`
    );
    return response.data;
  },

  // Customer APIs
  getCurrent: async () => {
    const response = await apiClient.get('/api/v1/customer/subscription');
    return response.data;
  },

  request: async (data: SubscriptionRequest) => {
    const response = await apiClient.post('/api/v1/customer/subscription', data);
    return response.data;
  },

  deactivate: async () => {
    const response = await apiClient.delete('/api/v1/customer/subscription');
    return response.data;
  },

  getHistory: async (page: number = 1, limit: number = 10, sort: 'asc' | 'desc' = 'desc') => {
    const response = await apiClient.get('/api/v1/customer/subscription-history', {
      params: { page, limit, sort },
    });
    return response.data;
  },
};
