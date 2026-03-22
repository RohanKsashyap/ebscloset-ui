import { useState, useEffect, useRef, useMemo } from 'react';
import { loadHomeAnimations } from '../utils/storage';
import HeroSection from './HeroSection';
import { loadSite, type SiteSettings, formatAUD } from '../utils/storage';
import { getOptimizedUrl } from '../utils/imageKit';
import CollectionGrid from './CollectionGrid';
import EditorialSection from './EditorialSection';
import ProductShowcase from './ProductShowcase';
import NewArrivalsGallery from './NewArrivalsGallery';
import Testimonials from './Testimonials';
import { useProductContext } from '../context/ProductContext';

export default function HomePage() {
  const { products } = useProductContext();
  const heroRef = useRef<HTMLDivElement>(null);
  const [animations, setAnimations] = useState(loadHomeAnimations());

  const budgetItems = useMemo(() => {
    const fallback: SiteSettings = { 
      hero: { title: '', subtitle: '', slides: [], bannerImage: '', bannerTitle: '', bannerSubtitle: '', bannerCtaText: '', bannerCtaHref: '' }, 
      editorial: { image: '', kicker: '', title: '', body: '', ctaText: '', ctaHref: '' }, 
      collections: [], 
      footerGroups: [], 
      social: [], 
      newsletter: { heading: '', subtext: '' }, 
      legalLabels: { privacy: '', terms: '', cookies: '' }, 
      infoPages: {}, 
      budgets: [
        { label: 'Under $20', slug: 'under20', min: 0, max: 20 },
        { label: 'Under $40', slug: 'under40', min: 0, max: 40 },
        { label: 'Under $60', slug: 'under60', min: 0, max: 60 },
        { label: '$60 – $80', slug: '60-80', min: 60, max: 80 },
        { label: '$80 – $100', slug: '80-100', min: 80, max: 100 },
        { label: '$100+ Premium', slug: '100plus', min: 100, max: 10000 },
      ] 
    };
    const site = loadSite(fallback);
    return (site.budgets ?? fallback.budgets!).map((b) => {
      const label = b.slug.startsWith('under')
        ? `Under ${formatAUD(b.max)}`
        : b.slug === '100plus'
          ? `${formatAUD(100)}+ Premium`
          : `${formatAUD(b.min)} – ${formatAUD(b.max)}`;
      
      const p = products.find(p => p.price >= b.min && p.price <= b.max);
      const img = p?.image || (p?.images && p.images[0]) || null;
      
      return { label, q: b.slug, img };
    });
  }, [products]);

  useEffect(() => {
    const onUpdate = () => setAnimations(loadHomeAnimations());
    window.addEventListener('home-animations-updated', onUpdate);
    return () => window.removeEventListener('home-animations-updated', onUpdate);
  }, []);

  return (
    <main className="bg-white">
      <HeroSection ref={heroRef} />
      <CollectionGrid />
      <section className="py-12 md:py-16 px-6 lg:px-12 max-w-screen-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-serif text-2xl md:text-5xl text-hot-pink">Shop by Budget</h2>
          <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-rose-gold">Quick picks for parents</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {budgetItems.map((b) => (
            <a key={b.q} href={`/shop?budget=${b.q}`} className="premium-card rounded-2xl overflow-hidden border bg-white/60">
              <div className="aspect-[4/3] bg-gradient-to-br from-pink-50 via-white to-peach-50 flex items-center justify-center">
                {b.img ? (
                  <img src={getOptimizedUrl(b.img, 400)} alt={b.label} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-white/70 border" />
                )}
              </div>
              <div className="p-4 text-center">
                <p className="text-sm text-gray-800">{b.label}</p>
              </div>
            </a>
          ))}
        </div>
        <div className="text-center mt-8">
          <a href="/budget" className="premium-button">Explore Budget Zone</a>
        </div>
      </section>
      {animations.filter(a => !!a.video).length > 0 && (
        <section className="py-12 md:py-20 px-6 lg:px-12 max-w-screen-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-6xl lg:text-7xl mb-6 text-hot-pink">Homepage Animations</h2>
            <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-rose-gold">Auto‑playing showcase from Admin</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
            {animations.filter(a => !!a.video).map((anim, i) => {
              const title = anim.title ?? '';
              const cover = anim.cover ?? '';
              const href = anim.href ?? '';
              const mime = anim.video?.startsWith('data:video/webm') ? 'video/webm' : anim.video?.startsWith('data:video/mp4') ? 'video/mp4' : undefined;
              const content = (
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden aspect-[3/4] mb-6">
                    {mime ? (
                      <video poster={cover} className="w-full h-full object-cover" autoPlay loop muted playsInline preload="auto">
                        <source src={anim.video!} type={mime} />
                      </video>
                    ) : (
                      <video src={anim.video!} poster={cover} className="w-full h-full object-cover" autoPlay loop muted playsInline preload="auto" />
                    )}
                    <div className="absolute inset-0 bg-hot-pink opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                  </div>
                  {title && (
                    <h3 className="font-serif text-2xl md:text-3xl text-gray-800">{title}</h3>
                  )}
                </div>
              );
              return (
                <div key={anim.id ?? i}>
                  {href ? <a href={href}>{content}</a> : content}
                </div>
              );
            })}
          </div>
        </section>
      )}
      <EditorialSection />
      <Testimonials />
      <NewArrivalsGallery />
      <ProductShowcase />
    </main>
  );
}
