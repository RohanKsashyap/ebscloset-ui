import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { productService, type Product } from '../services/productService';

interface ProductContextType {
  products: Product[];
  newArrivals: Product[];
  trending: Product[];
  loadingProducts: boolean;
  loadingArrivals: boolean;
  loadingTrending: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingArrivals, setLoadingArrivals] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = useCallback(async () => {
    try {
      setError(null);
      const [allProducts, arrivals, trendingData] = await Promise.all([
        productService.getAllProducts().catch(() => []),
        productService.getNewArrivals().catch(() => []),
        productService.getTrendingProducts().catch(() => [])
      ]);
      
      setProducts(allProducts);
      setNewArrivals(arrivals);
      setTrending(trendingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoadingProducts(false);
      setLoadingArrivals(false);
      setLoadingTrending(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  return (
    <ProductContext.Provider value={{
      products,
      newArrivals,
      trending,
      loadingProducts,
      loadingArrivals,
      loadingTrending,
      error,
      refreshProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProductContext() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProductContext must be used within ProductProvider');
  return ctx;
}
