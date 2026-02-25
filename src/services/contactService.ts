import apiClient from './api';

export const contactService = {
  submit: async (name: string, email: string, message: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/contact', {
      name,
      email,
      message,
    });
    return response.data;
  },
};
