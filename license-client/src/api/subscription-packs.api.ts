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

export interface SubscriptionPackCreateRequest {
  name: string;
  description: string;
  sku: string;
  price: number;
  validity_months: number;
}

export interface SubscriptionPackUpdateRequest {
  name?: string;
  description?: string;
  sku?: string;
  price?: number;
  validity_months?: number;
}

export interface SubscriptionPacksResponse {
  success: boolean;
  packs: SubscriptionPack[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export const subscriptionPacksApi = {
  getAll: async (page = 1, limit = 10): Promise<SubscriptionPacksResponse> => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    const response = await apiClient.get<SubscriptionPacksResponse>(
      `/api/v1/admin/subscription-packs?${params}`
    );
    return response.data;
  },

  create: async (
    data: SubscriptionPackCreateRequest
  ): Promise<{ success: boolean; pack: SubscriptionPack }> => {
    const response = await apiClient.post<{ success: boolean; pack: SubscriptionPack }>(
      '/api/v1/admin/subscription-packs',
      data
    );
    return response.data;
  },

  update: async (
    id: number,
    data: SubscriptionPackUpdateRequest
  ): Promise<{ success: boolean; pack: SubscriptionPack }> => {
    const response = await apiClient.put<{ success: boolean; pack: SubscriptionPack }>(
      `/api/v1/admin/subscription-packs/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/api/v1/admin/subscription-packs/${id}`
    );
    return response.data;
  },

  // Customer endpoint - get all packs (for requesting subscriptions)
  getAllPublic: async (): Promise<SubscriptionPacksResponse> => {
    const response = await apiClient.get<SubscriptionPacksResponse>(
      '/api/v1/admin/subscription-packs?limit=100'
    );
    return response.data;
  },
};
