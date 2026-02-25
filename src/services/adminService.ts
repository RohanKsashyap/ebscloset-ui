import apiClient from './api';
import type { Order } from './orderService';
import type { Product } from './productService';
import type { DiscountCode } from './discountService';
import type { Testimonial, GalleryImage } from './siteService';

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

export interface Review {
  _id: string;
  user: any;
  product: any;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface GalleryCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  displayOrder: number;
}

export const adminService = {
  getOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get('/admin/orders');
    return response.data || [];
  },

  updateOrderStatus: async (
    orderId: string,
    status: string,
    trackingNumber?: string
  ): Promise<Order> => {
    const response = await apiClient.put(`/admin/orders/${orderId}`, {
      status,
      trackingNumber,
    });
    return response.data;
  },

  deleteOrder: async (orderId: string): Promise<void> => {
    await apiClient.delete(`/admin/orders/${orderId}`);
  },

  getProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get('/admin/products');
    return response.data || [];
  },

  createProduct: async (productData: any): Promise<Product> => {
    // Note: Use FormData for uploads
    const response = await apiClient.post('/admin/products', productData);
    return response.data;
  },

  updateProduct: async (productId: string, productData: any): Promise<Product> => {
    // Note: Use FormData for uploads
    const response = await apiClient.put(`/admin/products/${productId}`, productData);
    return response.data;
  },

  deleteProduct: async (productId: string): Promise<void> => {
    await apiClient.delete(`/admin/products/${productId}`);
  },

  getSubscribers: async (): Promise<Subscriber[]> => {
    const response = await apiClient.get('/admin/newsletter');
    return response.data || [];
  },

  getMessages: async (): Promise<ContactMessage[]> => {
    const response = await apiClient.get('/admin/contacts');
    return response.data || [];
  },

  deleteMessage: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/contacts/${id}`);
  },

  getDiscounts: async (): Promise<DiscountCode[]> => {
    const response = await apiClient.get('/admin/discounts');
    return response.data || [];
  },

  createDiscount: async (discountData: Partial<DiscountCode>): Promise<DiscountCode> => {
    const response = await apiClient.post('/admin/discounts', discountData);
    return response.data;
  },

  deleteSubscriber: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/newsletter/${id}`);
  },

  getNavigation: async (): Promise<any[]> => {
    const response = await apiClient.get('/admin/navigation');
    return response.data.data || [];
  },

  updateNavigation: async (navData: any[]): Promise<any> => {
    const response = await apiClient.post('/admin/navigation', navData);
    return response.data.data;
  },

  getSiteSettings: async (): Promise<any> => {
    const response = await apiClient.get('/admin/site-settings');
    return response.data.data;
  },

  updateSiteSettings: async (settingsData: any): Promise<any> => {
    const response = await apiClient.post('/admin/site-settings', settingsData);
    return response.data.data;
  },

  // Reviews
  getReviews: async (): Promise<Review[]> => {
    const response = await apiClient.get('/reviews/admin/all');
    return response.data || [];
  },

  updateReview: async (id: string, data: any): Promise<Review> => {
    const response = await apiClient.put(`/reviews/admin/${id}`, data);
    return response.data;
  },

  deleteReview: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/admin/${id}`);
  },

  // Testimonials
  getAdminTestimonials: async (): Promise<Testimonial[]> => {
    const response = await apiClient.get('/testimonials/admin/all');
    return response.data || [];
  },

  addTestimonial: async (data: any): Promise<Testimonial> => {
    const response = await apiClient.post('/testimonials/admin/add', data);
    return response.data;
  },

  updateTestimonial: async (id: string, data: any): Promise<Testimonial> => {
    const response = await apiClient.put(`/testimonials/admin/${id}`, data);
    return response.data;
  },

  deleteTestimonial: async (id: string): Promise<void> => {
    await apiClient.delete(`/testimonials/admin/${id}`);
  },

  // Gallery
  getAdminGalleryImages: async (): Promise<GalleryImage[]> => {
    const response = await apiClient.get('/gallery/admin/images');
    return response.data || [];
  },

  createGalleryImage: async (formData: FormData): Promise<GalleryImage> => {
    const response = await apiClient.post('/gallery/admin/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateGalleryImage: async (id: string, formData: FormData): Promise<GalleryImage> => {
    const response = await apiClient.put(`/gallery/admin/images/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteGalleryImage: async (id: string): Promise<void> => {
    await apiClient.delete(`/gallery/admin/images/${id}`);
  },

  getAdminGalleryCategories: async (): Promise<GalleryCategory[]> => {
    const response = await apiClient.get('/gallery/admin/categories');
    return response.data || [];
  },

  createGalleryCategory: async (formData: FormData): Promise<GalleryCategory> => {
    const response = await apiClient.post('/gallery/admin/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateGalleryCategory: async (id: string, formData: FormData): Promise<GalleryCategory> => {
    const response = await apiClient.put(`/gallery/admin/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteGalleryCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/gallery/admin/categories/${id}`);
  },
};
