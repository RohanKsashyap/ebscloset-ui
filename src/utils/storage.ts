import type { Product } from '../services/productService';
import { createClient } from '@supabase/supabase-js';

export type NavCategory = { name: string; items: string[] };
export type DiscountCode = { code: string; type: 'percent' | 'amount'; value: number };
export type LinkItem = { label: string; href: string };
export type FooterGroup = { title: string; links: LinkItem[] };
export type SocialLink = { kind: 'instagram' | 'facebook' | 'youtube' | 'custom'; href: string };
export type CollectionItem = { id: number; title: string; video?: string; image?: string; category: string };
export type HeroSettings = {
  title: string;
  subtitle: string;
  backgroundImages: string[];
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
};

const PRODUCTS_KEY = 'catalog_products';
const NAV_KEY = 'nav_categories';
const DISCOUNT_KEY = 'discount_codes';
const SITE_KEY = 'site_settings';
const DRESS_IMAGE_KEY = 'dress3d_image';
const DRESS_SNAPSHOTS_KEY = 'dress3d_snapshots';
const TRENDING_KEY = 'trending_dresses';
const ARRIVALS_KEY = 'arrivals_dresses';
const ARRIVAL_PRODUCTS_KEY = 'arrivals_products';
const AGE_PRODUCTS_KEY = 'age_products';
const OCCASION_PRODUCTS_KEY = 'occasion_products';
const STYLE_PRODUCTS_KEY = 'style_products';
const PARTY_PRODUCTS_KEY = 'party_products';
const CASUAL_PRODUCTS_KEY = 'casual_products';
const SEASONAL_PRODUCTS_KEY = 'seasonal_products';
const SPECIAL_OCCASION_PRODUCTS_KEY = 'special_occasion_products';
const HOME_ANIMATIONS_KEY = 'home_animations';
const HOME_ANIMATION_1 = 'home_animation_1';
const HOME_ANIMATION_2 = 'home_animation_2';
const HOME_ANIMATION_3 = 'home_animation_3';

function getSupabase() {
  const url = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
  const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function replaceTableRows<T extends Record<string, any>>(table: string, rows: T[]): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase.from(table).delete().neq('id', -1);
    if (rows.length > 0) {
      await supabase.from(table).insert(rows);
    }
  } catch { void 0; }
}

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
  void replaceTableRows<Product>(PRODUCTS_KEY, products);
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
  void replaceTableRows<NavCategory>(NAV_KEY, nav);
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
  void replaceTableRows<DiscountCode>(DISCOUNT_KEY, codes);
}

export async function filesToBase64(files: FileList | File[]): Promise<string[]> {
  const list: File[] = Array.from(files instanceof FileList ? files : files as File[]);
  const results = await Promise.all(
    list.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        })
    )
  );
  return results;
}

export async function uploadImages(files: FileList | File[]): Promise<string[]> {
  try {
    const url = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
    const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (!url || !key) return [];
    const bucket = ((import.meta as any).env?.VITE_SUPABASE_BUCKET as string | undefined) ?? 'public';
    const supabase = createClient(url, key);
    const list: File[] = Array.from(files instanceof FileList ? files : files as File[]);
    const now = Date.now();
    const uploads = await Promise.all(
      list.map(async (file, i) => {
        const path = `products/${now}-${i}-${Math.random().toString(36).slice(2)}-${file.name}`;
        const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
        if (error) return '';
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl ?? '';
      })
    );
    return uploads.filter((u) => !!u);
  } catch {
    return [];
  }
}

export function loadSite(fallback: SiteSettings): SiteSettings {
  try {
    const raw = localStorage.getItem(SITE_KEY);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveSite(site: SiteSettings) {
  localStorage.setItem(SITE_KEY, JSON.stringify(site));
  const supabase = getSupabase();
  if (supabase) {
    void supabase.from(SITE_KEY).upsert({ id: 1, ...site });
  }
}

export type RotationSnapshot = { angle: number; image: string };

export function loadDressImage(): string | null {
  try {
    return localStorage.getItem(DRESS_IMAGE_KEY);
  } catch {
    return null;
  }
}

export function saveDressImage(img: string) {
  localStorage.setItem(DRESS_IMAGE_KEY, img);
}

export function loadDressSnapshots(): RotationSnapshot[] {
  try {
    const raw = localStorage.getItem(DRESS_SNAPSHOTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDressSnapshots(snaps: RotationSnapshot[]) {
  localStorage.setItem(DRESS_SNAPSHOTS_KEY, JSON.stringify(snaps));
}

export type TrendingDress = { id: number; image: string; name?: string; link?: string };

export function loadTrendingDresses(fallback: TrendingDress[] = []): TrendingDress[] {
  try {
    const raw = localStorage.getItem(TRENDING_KEY);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveTrendingDresses(items: TrendingDress[]) {
  localStorage.setItem(TRENDING_KEY, JSON.stringify(items));
  void replaceTableRows<TrendingDress>(TRENDING_KEY, items);
}

export type ArrivalItem = { id: number; image: string; name?: string; ageGroup?: string; productId?: number };

export function loadArrivals(fallback: ArrivalItem[] = []): ArrivalItem[] {
  try {
    const raw = localStorage.getItem(ARRIVALS_KEY);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveArrivals(items: ArrivalItem[]) {
  localStorage.setItem(ARRIVALS_KEY, JSON.stringify(items));
  void replaceTableRows<ArrivalItem>(ARRIVALS_KEY, items);
}

export function loadArrivalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(ARRIVAL_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveArrivalProducts(products: Product[]) {
  localStorage.setItem(ARRIVAL_PRODUCTS_KEY, JSON.stringify(products));
  void replaceTableRows<Product>(ARRIVAL_PRODUCTS_KEY, products);
}

export function loadAgeProducts(): Product[] {
  try {
    const raw = localStorage.getItem(AGE_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAgeProducts(products: Product[]) {
  localStorage.setItem(AGE_PRODUCTS_KEY, JSON.stringify(products));
  void replaceTableRows<Product>(AGE_PRODUCTS_KEY, products);
}

export function loadOccasionProducts(): Product[] {
  try {
    const raw = localStorage.getItem(OCCASION_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOccasionProducts(products: Product[]) {
  localStorage.setItem(OCCASION_PRODUCTS_KEY, JSON.stringify(products));
  void replaceTableRows<Product>(OCCASION_PRODUCTS_KEY, products);
}

export function loadStyleProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STYLE_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStyleProducts(products: Product[]) {
  localStorage.setItem(STYLE_PRODUCTS_KEY, JSON.stringify(products));
  void replaceTableRows<Product>(STYLE_PRODUCTS_KEY, products);
}

export function loadPartyProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PARTY_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePartyProducts(products: Product[]) {
  localStorage.setItem(PARTY_PRODUCTS_KEY, JSON.stringify(products));
  void replaceTableRows<Product>(PARTY_PRODUCTS_KEY, products);
}

export function loadCasualProducts(): Product[] {
  try {
    const raw = localStorage.getItem(CASUAL_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCasualProducts(products: Product[]) {
  localStorage.setItem(CASUAL_PRODUCTS_KEY, JSON.stringify(products));
  void replaceTableRows<Product>(CASUAL_PRODUCTS_KEY, products);
}

export function loadSeasonalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(SEASONAL_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSeasonalProducts(products: Product[]) {
  localStorage.setItem(SEASONAL_PRODUCTS_KEY, JSON.stringify(products));
  void replaceTableRows<Product>(SEASONAL_PRODUCTS_KEY, products);
}

export function loadSpecialOccasionProducts(): Product[] {
  try {
    const raw = localStorage.getItem(SPECIAL_OCCASION_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSpecialOccasionProducts(products: Product[]) {
  localStorage.setItem(SPECIAL_OCCASION_PRODUCTS_KEY, JSON.stringify(products));
  void replaceTableRows<Product>(SPECIAL_OCCASION_PRODUCTS_KEY, products);
}

export async function hydrateBackend(): Promise<void> {
  try {
    const url = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
    const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (!url || !key) return;
    const supabase = createClient(url, key);
    const tables = [
      { name: 'catalog_products', setter: (v: any) => saveProducts(v as Product[]) },
      { name: 'arrivals_products', setter: (v: any) => saveArrivalProducts(v as Product[]) },
      { name: 'age_products', setter: (v: any) => saveAgeProducts(v as Product[]) },
      { name: 'occasion_products', setter: (v: any) => saveOccasionProducts(v as Product[]) },
      { name: 'style_products', setter: (v: any) => saveStyleProducts(v as Product[]) },
      { name: 'party_products', setter: (v: any) => savePartyProducts(v as Product[]) },
      { name: 'casual_products', setter: (v: any) => saveCasualProducts(v as Product[]) },
      { name: 'seasonal_products', setter: (v: any) => saveSeasonalProducts(v as Product[]) },
      { name: 'special_occasion_products', setter: (v: any) => saveSpecialOccasionProducts(v as Product[]) },
    ];
    await Promise.all(
      tables.map(async (t) => {
        const { data, error } = await supabase.from(t.name).select('*');
        if (!error && Array.isArray(data)) t.setter(data);
      })
    );
    {
      const { data, error } = await supabase.from('nav_categories').select('*');
      if (!error && Array.isArray(data)) saveNav(data as NavCategory[]);
    }
    {
      const { data, error } = await supabase.from('discount_codes').select('*');
      if (!error && Array.isArray(data)) saveDiscounts(data as DiscountCode[]);
    }
    {
      const { data, error } = await supabase.from('arrivals_dresses').select('*');
      if (!error && Array.isArray(data)) saveArrivals(data as ArrivalItem[]);
    }
    {
      const { data, error } = await supabase.from('trending_dresses').select('*');
      if (!error && Array.isArray(data)) saveTrendingDresses(data as TrendingDress[]);
    }
    {
      const { data, error } = await supabase.from('site_settings').select('*').limit(1).single();
      if (!error && data) saveSite(data as SiteSettings);
    }
    {
      const { data, error } = await supabase.from('home_animations').select('*');
      if (!error && Array.isArray(data)) {
        const items = (data as any[]).map((m, idx) => ({
          id: m.id ?? idx + 1,
          cover: m.cover,
          title: m.title,
          href: m.href,
          video: (m.videoUrl ?? m.video_url ?? m.video) as string | undefined,
        }));
        saveHomeAnimations(items);
      }
    }
    window.dispatchEvent(new Event('backend-hydrated'));
  } catch { void 0; }
}

const ADMIN_CREDENTIALS_KEY = 'admin_credentials';
const ADMIN_SESSION_KEY = 'admin_session';
export type AdminCredentials = { email: string; hash: string };

const DEFAULT_ADMIN: AdminCredentials = {
  email: 'admin@site.local',
  hash: 'admin123'
};

export function getAdmin(): AdminCredentials | null {
  try {
    const raw = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_ADMIN;
  } catch {
    return DEFAULT_ADMIN;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}


export async function setAdmin(email: string, password: string): Promise<string> {
  const hash = await hashPassword(password);
  const creds: AdminCredentials = { email: email.toLowerCase(), hash };
  localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(creds));
  return '';
}

export async function loginAdmin(email: string, password: string): Promise<boolean> {
  const saved = getAdmin();
  if (!saved) return false;
  const hash = await hashPassword(password);
  const fallbackOk = email.toLowerCase() === DEFAULT_ADMIN.email && password === 'admin123' && saved.hash === DEFAULT_ADMIN.hash;
  const ok = (saved.email === email.toLowerCase() && saved.hash === hash) || fallbackOk;
  if (ok) localStorage.setItem(ADMIN_SESSION_KEY, '1');
  return ok;
}

export function isAdminAuthenticated(): boolean {
  return localStorage.getItem(ADMIN_SESSION_KEY) === '1';
}

export function logoutAdmin(): void {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

export type HomeAnimationItem = { id: number; video?: string; cover?: string; title?: string; href?: string };

const MEDIA_DB_NAME = 'site_media';
const MEDIA_STORE = 'media';

function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(MEDIA_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(MEDIA_STORE)) db.createObjectStore(MEDIA_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function saveMediaBlob(key: string, blob: Blob): Promise<void> {
  return openMediaDB().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, 'readwrite');
    const store = tx.objectStore(MEDIA_STORE);
    const req = store.put(blob, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  }));
}

function loadMediaBlob(key: string): Promise<Blob | null> {
  return openMediaDB().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, 'readonly');
    const store = tx.objectStore(MEDIA_STORE);
    const req = store.get(key);
    req.onsuccess = () => resolve((req.result as Blob) ?? null);
    req.onerror = () => reject(req.error);
  }));
}

function dataURLToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/data:(.*?);base64/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const bstr = atob(parts[1] ?? '');
  const len = bstr.length;
  const u8 = new Uint8Array(len);
  for (let i = 0; i < len; i++) u8[i] = bstr.charCodeAt(i);
  return new Blob([u8], { type: mime });
}

async function uploadDataUrlToSupabase(dataUrl: string, prefix: string): Promise<string> {
  try {
    const url = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
    const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (!url || !key) return '';
    const bucket = ((import.meta as any).env?.VITE_SUPABASE_BUCKET as string | undefined) ?? 'public';
    const supabase = createClient(url, key);
    const blob = dataURLToBlob(dataUrl);
    const now = Date.now();
    const path = `${prefix}/${now}-${Math.random().toString(36).slice(2)}.bin`;
    const { error } = await supabase.storage.from(bucket).upload(path, blob, { upsert: true });
    if (error) return '';
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl ?? '';
  } catch {
    return '';
  }
}

export function loadHomeAnimations(): HomeAnimationItem[] {
  try {
    const raw = localStorage.getItem(HOME_ANIMATIONS_KEY);
    if (raw) {
      const meta = JSON.parse(raw) as Array<{ id: number; cover?: string; title?: string; href?: string; videoKey?: string; video?: string; videoUrl?: string }>;
      const items: HomeAnimationItem[] = meta.map((m, idx) => ({ id: m.id ?? idx + 1, cover: m.cover, title: m.title, href: m.href }));
      meta.forEach((m, idx) => {
        const key = m.videoKey ?? `home_animation_video_${idx + 1}`;
        if (m.videoUrl && typeof m.videoUrl === 'string') {
          items[idx] = { ...items[idx], video: m.videoUrl };
        } else {
          loadMediaBlob(key).then((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              items[idx] = { ...items[idx], video: url };
              window.dispatchEvent(new Event('home-animations-updated'));
            } else if (m.video && m.video.startsWith('data:')) {
              try {
                const b = dataURLToBlob(m.video);
                saveMediaBlob(key, b).then(() => {
                  const url = URL.createObjectURL(b);
                  items[idx] = { ...items[idx], video: url };
                  window.dispatchEvent(new Event('home-animations-updated'));
                });
              } catch { void 0; }
            }
          });
        }
      });
      return items;
    }
    const slots = [HOME_ANIMATION_1, HOME_ANIMATION_2, HOME_ANIMATION_3];
    const items: HomeAnimationItem[] = [];
    slots.forEach((key, idx) => {
      const r = localStorage.getItem(key);
      if (r) {
        const obj = JSON.parse(r);
        items.push({ id: idx + 1, cover: obj.cover, title: obj.title, href: obj.href });
        const vkey = `home_animation_video_${idx + 1}`;
        loadMediaBlob(vkey).then((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            items[idx] = { ...items[idx], video: url };
            window.dispatchEvent(new Event('home-animations-updated'));
          } else if (obj.video && obj.video.startsWith('data:')) {
            try {
              const b = dataURLToBlob(obj.video);
              saveMediaBlob(vkey, b).then(() => {
                const url = URL.createObjectURL(b);
                items[idx] = { ...items[idx], video: url };
                window.dispatchEvent(new Event('home-animations-updated'));
              });
            } catch { void 0; }
          }
        });
      }
    });
    return items;
  } catch {
    return [];
  }
}

export function saveHomeAnimations(items: HomeAnimationItem[]) {
  try {
    const baseMeta = items.map((it, idx) => ({ id: it.id ?? idx + 1, cover: it.cover ?? '', title: it.title ?? '', href: it.href ?? '', videoKey: `home_animation_video_${idx + 1}` }));
    localStorage.setItem(HOME_ANIMATIONS_KEY, JSON.stringify(baseMeta));
    const supabase = getSupabase();
    if (supabase) {
      void (async () => {
        const nextMeta = [...baseMeta] as Array<{ id: number; cover?: string; title?: string; href?: string; videoKey?: string; videoUrl?: string }>;
        for (let idx = 0; idx < items.length; idx++) {
          const item = items[idx];
          if (!item) continue;
          if (item.video) {
            if (item.video.startsWith('data:')) {
              const url = await uploadDataUrlToSupabase(item.video, 'home_animations');
              if (url) nextMeta[idx] = { ...nextMeta[idx], videoUrl: url };
            } else if (/^https?:\/\//.test(item.video)) {
              nextMeta[idx] = { ...nextMeta[idx], videoUrl: item.video };
            }
          }
        }
        await replaceTableRows<{ id: number; cover?: string; title?: string; href?: string; videoKey?: string; videoUrl?: string }>(HOME_ANIMATIONS_KEY, nextMeta);
      })();
    }
    const slots = [HOME_ANIMATION_1, HOME_ANIMATION_2, HOME_ANIMATION_3];
    slots.forEach((key, idx) => {
      const item = items[idx];
      if (item) {
        localStorage.setItem(key, JSON.stringify({ cover: item.cover ?? '', title: item.title ?? '', href: item.href ?? '' }));
        if (item.video && item.video.startsWith('data:')) {
          try {
            const blob = dataURLToBlob(item.video);
            const vkey = `home_animation_video_${idx + 1}`;
            saveMediaBlob(vkey, blob);
          } catch { void 0; }
        }
      } else {
        localStorage.removeItem(key);
      }
    });
  } catch { void 0; }
}

export async function subscribeNewsletter(email: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase.from('newsletter_subscribers').insert({ email, created_at: new Date().toISOString() });
  } catch { void 0; }
}

export async function submitContact(name: string, email: string, message: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase.from('contact_messages').insert({ name, email, message, created_at: new Date().toISOString() });
  } catch { void 0; }
}

export type OrderItem = { id: number; name: string; price: number; image: string; qty: number };
export type OrderPayload = {
  email: string;
  items: OrderItem[];
  total: number;
  discountCode?: string | null;
  shipping: Record<string, any>;
};

export async function createOrder(payload: OrderPayload): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) return '';
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({ email: payload.email, total: payload.total, discount_code: payload.discountCode ?? null, items: payload.items, shipping: payload.shipping, status: 'new', created_at: new Date().toISOString() })
      .select('id')
      .single();
    if (error) return '';
    return String((data as any)?.id ?? '');
  } catch {
    return '';
  }
}

export async function fetchOrders(): Promise<any[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchSubscribers(): Promise<any[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchContactMessages(): Promise<any[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function updateOrderStatus(id: number | string, status: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteSubscriber(id: number): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteContactMessage(id: number): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}
