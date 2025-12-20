import apiClient from './api';
import type { Order } from './orderService';
import type { Product } from './productService';
import type { DiscountCode } from './discountService';

export interface Subscriber {
  email: string;
  subscribedAt?: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  createdAt?: string;
}

export const adminService = {
  getOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get('/orders/admin/all');
    return response.data.orders || [];
  },

  updateOrderStatus: async (
    orderId: string,
    status: string,
    trackingNumber?: string
  ): Promise<Order> => {
    const response = await apiClient.put(`/orders/${orderId}/status`, {
      status,
      trackingNumber,
    });
    return response.data.order;
  },

  getProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get('/products');
    return response.data.products || [];
  },

  createProduct: async (productData: Partial<Product>): Promise<Product> => {
    const response = await apiClient.post('/products', productData);
    return response.data.product;
  },

  updateProduct: async (productId: string, productData: Partial<Product>): Promise<Product> => {
    const response = await apiClient.put(`/products/${productId}`, productData);
    return response.data.product;
  },

  deleteProduct: async (productId: string): Promise<void> => {
    await apiClient.delete(`/products/${productId}`);
  },

  getSubscribers: async (): Promise<Subscriber[]> => {
    const response = await apiClient.get('/newsletter');
    return response.data.subscribers || [];
  },

  getMessages: async (): Promise<ContactMessage[]> => {
    const response = await apiClient.get('/contact');
    return response.data.messages || [];
  },

  getDiscounts: async (): Promise<DiscountCode[]> => {
    const response = await apiClient.get('/discounts');
    return response.data.codes || [];
  },

  createDiscount: async (discountData: Partial<DiscountCode>): Promise<DiscountCode> => {
    const response = await apiClient.post('/discounts', discountData);
    return response.data.discount;
  },
};
