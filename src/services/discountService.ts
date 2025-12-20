import apiClient from './api';

export interface DiscountCode {
  code: string;
  type: 'percent' | 'amount';
  value: number;
  maxUses?: number;
  expiresAt?: string;
}

export const discountService = {
  validateCode: async (code: string): Promise<DiscountCode | null> => {
    try {
      const response = await apiClient.get(`/discounts/code/${code}`);
      return response.data.code;
    } catch {
      return null;
    }
  },
};
