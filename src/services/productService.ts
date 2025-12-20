import apiClient from './api';

export interface Product {
  _id?: string;
  id?: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category?: string;
  size?: string[];
  sizes?: string[];
  color?: string[];
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
  isNewArrival?: boolean;
  isTrending?: boolean;
}

const CACHE_DURATION_MS = 5 * 60 * 1000;
const cache: Record<string, { data: any; timestamp: number }> = {};

function getFromCache(key: string): any | null {
  const cached = cache[key];
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_DURATION_MS) {
    delete cache[key];
    return null;
  }
  return cached.data;
}

function setInCache(key: string, data: any): void {
  cache[key] = { data, timestamp: Date.now() };
}

export const productService = {
  getAllProducts: async (filters?: Record<string, any>): Promise<Product[]> => {
    const cacheKey = `products:${JSON.stringify(filters || {})}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;
    
    const response = await apiClient.get('/products', { params: filters });
    const data = response.data.products || [];
    setInCache(cacheKey, data);
    return data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const cacheKey = `product:${id}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;
    
    const response = await apiClient.get(`/products/${id}`);
    const data = response.data.product;
    setInCache(cacheKey, data);
    return data;
  },

  getTrendingProducts: async (): Promise<Product[]> => {
    const cacheKey = 'trending-products';
    const cached = getFromCache(cacheKey);
    if (cached) return cached;
    
    const response = await apiClient.get('/products/trending');
    const data = response.data.products || [];
    setInCache(cacheKey, data);
    return data;
  },

  getNewArrivals: async (): Promise<Product[]> => {
    const cacheKey = 'new-arrivals';
    const cached = getFromCache(cacheKey);
    if (cached) return cached;
    
    const response = await apiClient.get('/products/new-arrivals');
    const data = response.data.products || [];
    setInCache(cacheKey, data);
    return data;
  },

  addReview: async (
    productId: string,
    name: string,
    rating: number,
    comment: string
  ): Promise<Product> => {
    const response = await apiClient.post(`/products/${productId}/reviews`, {
      name,
      rating,
      comment,
    });
    delete cache[`product:${productId}`];
    return response.data.product;
  },

  clearCache: () => {
    Object.keys(cache).forEach(key => delete cache[key]);
  }
};
