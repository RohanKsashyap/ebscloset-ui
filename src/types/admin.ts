import type { Product } from '../services/productService';
import type { Review, GalleryCategory } from '../services/adminService';
import type { Testimonial, GalleryImage } from '../services/siteService';

export type NavCategory = { 
  _id?: string; 
  name: string; 
  href?: string; 
  items: { label: string; href: string }[] 
};

export type DiscountCode = { 
  _id?: string; 
  code: string; 
  type: 'percent' | 'amount' | 'fixed'; 
  value: number;
  status?: 'Active' | 'Scheduled' | 'Expired';
  usage?: number;
};

export type SiteSettings = {
  hero: { 
    title: string; 
    subtitle: string; 
    slides: any[]; 
    bannerImage: string; 
    bannerTitle: string; 
    bannerSubtitle: string; 
    bannerCtaText: string; 
    bannerCtaHref: string 
  };
  editorial: { 
    image: string; 
    kicker: string; 
    title: string; 
    body: string; 
    ctaText: string; 
    ctaHref: string 
  };
  collections: any[];
  footerGroups: any[];
  social: any[];
  newsletter: { heading: string; subtext: string };
  legalLabels: { privacy: string; terms: string; cookies: string };
  infoPages: Record<string, any>;
  budgets?: { label: string; slug: string; min: number; max: number }[];
  sparkleEffectEnabled?: boolean;
};

export type Budget = {
  label: string;
  slug: string;
  min: number;
  max: number;
};
