import apiClient, { ensureBackendAvailable } from './api';
import type { Product } from './productService';

export interface Testimonial {
  _id: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
  image?: string;
  active: boolean;
}

export interface GalleryImage {
  _id: string;
  title: string;
  imageUrl: string;
  category: any;
  featured: boolean;
}

export interface Offer {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
}

export const siteService = {
  getNavigation: async (): Promise<any[]> => {
    if (!(await ensureBackendAvailable())) return [];
    try {
      const response = await apiClient.get('/site/navigation');
      return response.data.data || [];
    } catch {
      return [];
    }
  },

  getSiteSettings: async (): Promise<any> => {
    if (!(await ensureBackendAvailable())) return null;
    try {
      const response = await apiClient.get('/site/site-settings');
      return response.data.data;
    } catch {
      return null;
    }
  },

  getTestimonials: async (): Promise<Testimonial[]> => {
    if (!(await ensureBackendAvailable())) return [];
    const response = await apiClient.get('/testimonials');
    return response.data || [];
  },

  getGalleryImages: async (category?: string): Promise<GalleryImage[]> => {
    if (!(await ensureBackendAvailable())) return [];
    const url = category ? `/gallery/images/${category}` : '/gallery/images';
    const response = await apiClient.get(url);
    return response.data || [];
  },

  getOffers: async (): Promise<Offer[]> => {
    if (!(await ensureBackendAvailable())) return [];
    const response = await apiClient.get('/offers');
    return response.data || [];
  },

  getGalleryOffers: async (): Promise<any[]> => {
    if (!(await ensureBackendAvailable())) return [];
    const response = await apiClient.get('/gallery-offers');
    return response.data || [];
  }
};
