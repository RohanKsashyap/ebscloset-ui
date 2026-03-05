import type { Product } from '../services/productService';
import { adminService } from '../services/adminService';
import { authService } from '../services/authService';

export type NavItem = { label: string; href: string };
export type NavCategory = { name: string; href?: string; items: NavItem[] };
export type DiscountCode = { code: string; type: 'percent' | 'amount'; value: number };
export type LinkItem = { label: string; href: string };
export type FooterGroup = { title: string; links: LinkItem[] };
export type SocialLink = { kind: 'instagram' | 'facebook' | 'youtube' | 'custom'; href: string };
export type CollectionItem = { id: number; title: string; video?: string; image?: string; category: string };
export type HeroSlide = {
  id: string;
  type: 'image' | 'video';
  url: string;
};
export type HeroSettings = {
  title: string;
  subtitle: string;
  slides: HeroSlide[];
  bannerImage: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerCtaText: string;
  bannerCtaHref: string;
};
export type EditorialSettings = {
  image: string;
  kicker: string;
  title: string;
  body: string;
  ctaText: string;
  ctaHref?: string;
};
export type NewsletterSettings = { heading: string; subtext: string };
export type InfoSection = { heading?: string; body: string };
export type InfoContent = { title: string; subtitle?: string; sections: InfoSection[] };
export type SiteSettings = {
  hero: HeroSettings;
  editorial: EditorialSettings;
  collections: CollectionItem[];
  footerGroups: FooterGroup[];
  social: SocialLink[];
  newsletter: NewsletterSettings;
  legalLabels: { privacy: string; terms: string; cookies: string };
  infoPages: Record<string, InfoContent>;
  budgets?: Array<{ label: string; slug: string; min: number; max: number }>;
  sparkleEffectEnabled?: boolean;
};

const PRODUCTS_KEY = 'catalog_products';
const NAV_KEY = 'nav_categories_v2';
const DISCOUNT_KEY = 'discount_codes';
const SITE_KEY = 'site_settings';

export function loadProducts(fallback: Product[]): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveProducts(products: Product[]) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function loadNav(fallback: NavCategory[]): NavCategory[] {
  try {
    const raw = localStorage.getItem(NAV_KEY);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveNav(nav: NavCategory[]) {
  localStorage.setItem(NAV_KEY, JSON.stringify(nav));
}

export function loadDiscounts(fallback: DiscountCode[] = []): DiscountCode[] {
  try {
    const raw = localStorage.getItem(DISCOUNT_KEY);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveDiscounts(codes: DiscountCode[]) {
  localStorage.setItem(DISCOUNT_KEY, JSON.stringify(codes));
}

export function loadSite(fallback: SiteSettings): SiteSettings {
  try {
    const raw = localStorage.getItem(SITE_KEY);
    if (!raw) return fallback;
    
    const loaded = JSON.parse(raw);
    
    // Deep merge or at least ensure top-level properties are present
    // Using a simple merge for stability
    return {
      ...fallback,
      ...loaded,
      hero: { 
        ...fallback.hero, 
        ...(loaded.hero || {}),
        slides: (loaded.hero?.slides?.length ? loaded.hero.slides : fallback.hero.slides) || []
      },
      editorial: { ...fallback.editorial, ...(loaded.editorial || {}) },
      newsletter: { ...fallback.newsletter, ...(loaded.newsletter || {}) },
      legalLabels: { ...fallback.legalLabels, ...(loaded.legalLabels || {}) },
      collections: loaded.collections?.length ? loaded.collections : fallback.collections,
      footerGroups: loaded.footerGroups?.length ? loaded.footerGroups : fallback.footerGroups,
      social: loaded.social?.length ? loaded.social : fallback.social,
      budgets: loaded.budgets?.length ? loaded.budgets : fallback.budgets,
      sparkleEffectEnabled: typeof loaded.sparkleEffectEnabled === 'boolean' ? loaded.sparkleEffectEnabled : fallback.sparkleEffectEnabled,
    };
  } catch {
    return fallback;
  }
}

export function saveSite(site: SiteSettings) {
  localStorage.setItem(SITE_KEY, JSON.stringify(site));
}

import { siteService } from '../services/siteService';
import { productService } from '../services/productService';

export async function hydrateBackend(): Promise<void> {
  try {
    const [products, navigation, siteSettings] = await Promise.all([
      productService.getAllProducts(),
      siteService.getNavigation(),
      siteService.getSiteSettings()
    ]);

    if (products.length) saveProducts(products);
    if (navigation.length) saveNav(navigation);
    if (siteSettings && Object.keys(siteSettings).length) saveSite(siteSettings);

    window.dispatchEvent(new Event('backend-hydrated'));
  } catch (err) {
    console.error('Hydration error:', err);
  }
}

export function isAdminAuthenticated(): boolean {
  return !!localStorage.getItem('adminToken');
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}

export async function logoutAdmin(): Promise<void> {
  authService.adminLogout();
}

export async function loginAdmin(email: string, password: string): Promise<boolean> {
  try {
    const res = await authService.adminLogin(email, password);
    return !!res.token;
  } catch (err) {
    console.error('Login error:', err);
    return false;
  }
}

// Fallbacks for functions that might still be called by legacy components
export async function fetchOrders() { return adminService.getOrders(); }
export async function fetchSubscribers() { return adminService.getSubscribers(); }
export async function fetchContactMessages() { return adminService.getMessages(); }
export async function updateOrderStatus(id: string, status: string) { return adminService.updateOrderStatus(id, status); }
export async function deleteSubscriber(id: string) { return adminService.deleteSubscriber(id); }
export async function deleteContactMessage(id: string) { return adminService.deleteMessage(id); }

// Keep helpers
export const INR_TO_AUD = 0.018;
export function toAUD(inr: number): number {
  const aud = inr * INR_TO_AUD;
  return Math.round((aud + Number.EPSILON) * 100) / 100;
}
export function formatAUD(inr: number): string {
  return `A$${toAUD(inr).toFixed(2)}`;
}

// Dummy/Legacy stubs to avoid breaking imports
export function loadArrivalProducts() { return []; }
export function saveArrivalProducts(_: any) {}
export function loadAgeProducts() { return []; }
export function saveAgeProducts(_: any) {}
export function loadOccasionProducts() { return []; }
export function saveOccasionProducts(_: any) {}
export function loadStyleProducts() { return []; }
export function saveStyleProducts(_: any) {}
export function loadPartyProducts() { return []; }
export function savePartyProducts(_: any) {}
export function loadCasualProducts() { return []; }
export function saveCasualProducts(_: any) {}
export function loadSeasonalProducts() { return []; }
export function saveSeasonalProducts(_: any) {}
export function loadSpecialOccasionProducts() { return []; }
export function saveSpecialOccasionProducts(_: any) {}
export function loadTrendingDresses() { return []; }
export function saveTrendingDresses(_: any) {}
export function loadArrivals() { return []; }
export function saveArrivals(_: any) {}
export function loadHomeAnimations() { return []; }
export function saveHomeAnimations(_: any) {}
