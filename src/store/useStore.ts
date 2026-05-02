import { create } from 'zustand';
import type { Product } from '../services/productService';
import type { SiteSettings, NavCategory } from '../types/admin';

interface AppState {
  products: Product[];
  categories: any[];
  siteSettings: SiteSettings | null;
  navigation: NavCategory[];
  
  setProducts: (products: Product[]) => void;
  setCategories: (categories: any[]) => void;
  setSiteSettings: (settings: SiteSettings) => void;
  setNavigation: (nav: NavCategory[]) => void;
}

export const useStore = create<AppState>((set) => ({
  products: [],
  categories: [],
  siteSettings: null,
  navigation: [],
  
  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  setSiteSettings: (siteSettings) => set({ siteSettings }),
  setNavigation: (navigation) => set({ navigation }),
}));
