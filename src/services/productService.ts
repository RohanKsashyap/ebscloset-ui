import apiClient, { ensureBackendAvailable } from './api';

export interface Product {
  _id?: string;
  id?: string | number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category?: string;
  categoryId?:{
    _id:string;
    name:string;
    slug:string
  };
  size?: string;
  sizes?: string[];
  color?: string;
  rating?: number;
  reviews?: Array<{
    name: string;
    rating: number;
    comment: string;
    date?: string;
  }>;
  sku?: string;
  materials?: string;
  care?: string;
  stock?: Record<string, number>;
  type?: string;
  occasion?: string;
  newarrival?: boolean;
  trending?: boolean;
  bestseller?: boolean;
  assured?: boolean;
}

export const productService = {
  getAllProducts: async (filters?: Record<string, any>): Promise<Product[]> => {
    if (!(await ensureBackendAvailable())) return [];
    const response = await apiClient.get('/products', { params: filters });
    return response.data.products || [];
  },

  getProduct: async (id: string): Promise<Product> => {
    if (!(await ensureBackendAvailable())) throw new Error('Backend unavailable');
    const response = await apiClient.get(`/products/${id}`);
    return response.data.product;
  },

  getTrendingProducts: async (): Promise<Product[]> => {
    if (!(await ensureBackendAvailable())) return [];
    const response = await apiClient.get('/products/trending');
    return response.data.products || [];
  },

//best seller
getBestSellerProducts: async (): Promise<Product[]> => {
  if (!(await ensureBackendAvailable())) return [];
  const response = await apiClient.get('/products/bestseller');
  return response.data.products || [];
},





  getNewArrivals: async (): Promise<Product[]> => {
    if (!(await ensureBackendAvailable())) return [];
    const response = await apiClient.get('/products/new-arrivals');
    return response.data.products || [];
  },

  addReview: async (
    productId: string,
    name: string,
    rating: number,
    comment: string
  ): Promise<Product> => {
    if (!(await ensureBackendAvailable())) throw new Error('Backend unavailable');
    const response = await apiClient.post(`/products/${productId}/reviews`, {
      name,
      rating,
      comment,
    });
    return response.data.product;
  },
};
