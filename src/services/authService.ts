import apiClient from './api';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  addresses?: Address[];
}

export interface Address {
  _id?: string;
  type: string;
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  isPrimary: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  register: async (
    fullName: string,
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', {
      fullName,
      email,
      password,
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  adminLogin: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/admin-login', { email, password });
    if (response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('admin', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  adminLogout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: { fullName?: string; email?: string; phone?: string }): Promise<User> => {
    const response = await apiClient.put('/auth/profile', data);
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  updatePassword: async (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
    const response = await apiClient.put('/auth/password', data);
    return response.data;
  },

  getAddresses: async (): Promise<Address[]> => {
    const response = await apiClient.get('/auth/addresses');
    return response.data;
  },

  addAddress: async (address: Omit<Address, '_id'>): Promise<Address[]> => {
    const response = await apiClient.post('/auth/addresses', address);
    return response.data;
  },

  updateAddress: async (id: string, address: Partial<Address>): Promise<Address[]> => {
    const response = await apiClient.put(`/auth/addresses/${id}`, address);
    return response.data;
  },

  deleteAddress: async (id: string): Promise<Address[]> => {
    const response = await apiClient.delete(`/auth/addresses/${id}`);
    return response.data;
  },
};
