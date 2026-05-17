import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  size?: string;
  color?: string;
  variantId?: string;
  sku?: string;
  selectedAttributes?: Record<string, any>;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  removeItem: (id: string | number, size?: string, sku?: string) => void;
  updateQty: (id: string | number, qty: number, size?: string, sku?: string) => void;
  total: number;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('cart_items');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items));
  }, [items]);

  const addItem: CartContextValue['addItem'] = (item, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((p) => {
        if (item.sku && p.sku) return p.sku === item.sku;
        return p.id === item.id && p.size === item.size;
      });
      if (existing) {
        showToast(`Updated quantity for ${item.name}`, 'info');
        return prev.map((p) => {
          const match = (item.sku && p.sku) ? p.sku === item.sku : (p.id === item.id && p.size === item.size);
          return match ? { ...p, qty: p.qty + qty } : p;
        });
      }
      showToast(`Added ${item.name} to bag`);
      return [...prev, { ...item, qty }];
    });
  };

  const removeItem: CartContextValue['removeItem'] = (id, size, sku) => {
    setItems((prev) => prev.filter((p) => {
      if (sku && p.sku) return p.sku !== sku;
      return !(p.id === id && (size === undefined || p.size === size));
    }));
    showToast('Item removed from bag', 'info');
  };

  const updateQty: CartContextValue['updateQty'] = (id, qty, size, sku) => {
    setItems((prev) => prev.map((p) => {
      const match = (sku && p.sku) ? p.sku === sku : (p.id === id && (size === undefined || p.size === size));
      return match ? { ...p, qty } : p;
    }));
  };

  const clear = () => setItems([]);

  const total = useMemo(() => items.reduce((sum, p) => sum + p.price * p.qty, 0), [items]);

  const value: CartContextValue = { items, addItem, removeItem, updateQty, total, clear };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
