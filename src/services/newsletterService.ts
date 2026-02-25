import apiClient from './api';

export const newsletterService = {
  subscribe: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/newsletter/subscribe', { email });
    return response.data;
  },

  unsubscribe: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/newsletter/unsubscribe', { email });
    return response.data;
  },
};
