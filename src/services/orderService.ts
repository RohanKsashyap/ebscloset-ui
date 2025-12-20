import apiClient from './api';

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  image?: string;
}

export interface ShippingData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export interface OrderData {
  items: OrderItem[];
  total: number;
  email: string;
  discountCode?: string;
  shipping: ShippingData;
}

export interface Order {
  _id?: string;
  id?: string;
  items: OrderItem[];
  total: number;
  email: string;
  status?: string;
  trackingNumber?: string;
  createdAt?: string;
  created_at?: string;
  paymentStatus?: string;
  discountCode?: string;
  discountAmount?: number;
  shipping?: any;
}

export const orderService = {
  createOrder: async (orderData: OrderData): Promise<{ success: boolean; orderId: string }> => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  getOrder: async (orderId: string): Promise<Order> => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data.order;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get('/orders');
    return response.data.orders || [];
  },
};
