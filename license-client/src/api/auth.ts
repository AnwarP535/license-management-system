import apiClient from './client';

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface CustomerLoginRequest {
  email: string;
  password: string;
}

export interface CustomerSignupRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  refresh_token?: string;
  expires_in: number;
  email?: string;
  name?: string;
  phone?: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  token: string;
  expires_in: number;
}

export const authApi = {
  adminLogin: async (data: AdminLoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/api/admin/login', data);
    return response.data;
  },

  customerLogin: async (data: CustomerLoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/api/customer/login', data);
    return response.data;
  },

  customerSignup: async (data: CustomerSignupRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/api/customer/signup', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post('/api/refresh', { refresh_token: refreshToken });
    return response.data;
  },
};
