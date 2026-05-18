import apiClient, { ensureBackendAvailable } from './api';

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
  cart: any[];
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  shippingFee: number;
  tax?: number;
  successUrl?: string;
  cancelUrl?: string;
}

export interface Order {
  _id?: string;
  orderId?: string;
  products: any[];
  customer: any;
  totalAmount: number;
  status?: string;
  paymentMethod?: string;
  createdAt?: string;
}

export const orderService = {
  createOrder: async (orderData: OrderData): Promise<{ orderId: string }> => {
    if (!(await ensureBackendAvailable())) throw new Error('Backend unavailable');
    const response = await apiClient.post('/checkout/cod', orderData);
    return response.data;
  },

  createStripeSession: async (orderData: OrderData): Promise<{ url: string }> => {
    if (!(await ensureBackendAvailable())) throw new Error('Backend unavailable');
    const response = await apiClient.post('/checkout/stripe-session', orderData);
    return response.data;
  },

  getOrder: async (orderId: string): Promise<Order> => {
    if (!(await ensureBackendAvailable())) throw new Error('Backend unavailable');
    const response = await apiClient.get(`/checkout/order/${orderId}`);
    return response.data;
  },

  getMyOrders: async (): Promise<Order[]> => {
    if (!(await ensureBackendAvailable())) return [];
    const response = await apiClient.get('/checkout/orders');
    return response.data || [];
  },

  createPaymentSession: async (orderId: string): Promise<{ url: string }> => {
    if (!(await ensureBackendAvailable())) throw new Error('Backend unavailable');
    const response = await apiClient.post(`/checkout/create-payment-session/${orderId}`);
    return response.data;
  },
};
