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
  wishlistIds: any[];
  toggleWishlist: (id: any) => void;
  isWishlisted: (id: any) => boolean;
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
  const [wishlistIds, setWishlistIds] = useState<(string | number)[]>(() => {
    try {
      const raw = localStorage.getItem('wishlist_ids_v1');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

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

  useEffect(() => {
    try {
      localStorage.setItem('wishlist_ids_v1', JSON.stringify(wishlistIds));
    } catch {
      // ignore
    }
  }, [wishlistIds]);

  const toggleWishlist = (id: string | number) => {
    setWishlistIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]));
  };
  const isWishlisted = (id: string | number) => wishlistIds.includes(id);

  return (
    <ProductContext.Provider value={{
      products,
      newArrivals,
      trending,
      loadingProducts,
      loadingArrivals,
      loadingTrending,
      error,
      refreshProducts,
      wishlistIds,
      toggleWishlist,
      isWishlisted
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
