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

export interface SignupRequest {
  name?: string;
  email: string;
  password: string;
  phone?: string;
  role: 'admin' | 'customer';
}

export interface AuthResponse {
  success: boolean;
  token: string;
  email?: string;
  name?: string;
  phone?: string;
  role?: 'admin' | 'customer';
  expires_in: number;
}

export const authApi = {
  adminLogin: async (data: AdminLoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/admin/login', data);
    return response.data;
  },

  customerLogin: async (data: CustomerLoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/customer/login', data);
    return response.data;
  },

  customerSignup: async (data: CustomerSignupRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/customer/signup', data);
    return response.data;
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/signup', data);
    return response.data;
  },
};
