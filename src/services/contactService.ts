import apiClient from './api';

export const contactService = {
  submit: async (name: string, email: string,subject:string, message: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/contact', {
      name,
      email,
      subject,
      message,
    });
    return response.data;
  },
};
