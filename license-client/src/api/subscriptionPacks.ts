import apiClient from './client';

export interface SubscriptionPack {
  id: number;
  name: string;
  description: string;
  sku: string;
  price: number;
  validity_months: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionPackRequest {
  name: string;
  description: string;
  sku: string;
  price: number;
  validity_months: number;
}

export interface UpdateSubscriptionPackRequest {
  name?: string;
  description?: string;
  sku?: string;
  price?: number;
  validity_months?: number;
}

export const subscriptionPacksApi = {
  list: async (page: number = 1, limit: number = 10) => {
    const response = await apiClient.get('/api/v1/admin/subscription-packs', {
      params: { page, limit },
    });
    return response.data;
  },

  listAvailable: async (page: number = 1, limit: number = 100) => {
    const response = await apiClient.get('/api/v1/customer/subscription-packs', {
      params: { page, limit },
    });
    return response.data;
  },

  create: async (data: CreateSubscriptionPackRequest) => {
    const response = await apiClient.post('/api/v1/admin/subscription-packs', data);
    return response.data;
  },

  update: async (id: number, data: UpdateSubscriptionPackRequest) => {
    const response = await apiClient.put(`/api/v1/admin/subscription-packs/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/api/v1/admin/subscription-packs/${id}`);
    return response.data;
  },
};
