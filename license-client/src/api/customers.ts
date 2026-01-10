import apiClient from './client';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  phone?: string;
}

export const customersApi = {
  list: async (page: number = 1, limit: number = 10, search?: string) => {
    const response = await apiClient.get('/api/v1/admin/customers', {
      params: { page, limit, search },
    });
    return response.data;
  },

  get: async (id: number) => {
    const response = await apiClient.get(`/api/v1/admin/customers/${id}`);
    return response.data;
  },

  create: async (data: CreateCustomerRequest) => {
    const response = await apiClient.post('/api/v1/admin/customers', data);
    return response.data;
  },

  update: async (id: number, data: UpdateCustomerRequest) => {
    const response = await apiClient.put(`/api/v1/admin/customers/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/api/v1/admin/customers/${id}`);
    return response.data;
  },
};
