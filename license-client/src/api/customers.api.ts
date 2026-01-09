import apiClient from './client';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerCreateRequest {
  name: string;
  email: string;
  phone: string;
}

export interface CustomerUpdateRequest {
  name?: string;
  phone?: string;
}

export interface CustomersResponse {
  success: boolean;
  customers: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export const customersApi = {
  getAll: async (page = 1, limit = 10, search?: string): Promise<CustomersResponse> => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append('search', search);
    const response = await apiClient.get<CustomersResponse>(`/api/v1/admin/customers?${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<{ success: boolean; customer: Customer }> => {
    const response = await apiClient.get<{ success: boolean; customer: Customer }>(
      `/api/v1/admin/customers/${id}`
    );
    return response.data;
  },

  create: async (data: CustomerCreateRequest): Promise<{ success: boolean; customer: Customer }> => {
    const response = await apiClient.post<{ success: boolean; customer: Customer }>(
      '/api/v1/admin/customers',
      data
    );
    return response.data;
  },

  update: async (
    id: number,
    data: CustomerUpdateRequest
  ): Promise<{ success: boolean; customer: Customer }> => {
    const response = await apiClient.put<{ success: boolean; customer: Customer }>(
      `/api/v1/admin/customers/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/api/v1/admin/customers/${id}`
    );
    return response.data;
  },
};
