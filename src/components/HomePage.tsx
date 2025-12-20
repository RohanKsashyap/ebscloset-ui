import { useState, useEffect, useRef } from 'react';
import { loadHomeAnimations, type SiteSettings } from '../utils/storage';
import HeroSection from './HeroSection';
import { loadSite } from '../utils/storage';
import CollectionGrid from './CollectionGrid';
import EditorialSection from './EditorialSection';
import ProductShowcase from './ProductShowcase';
import NewArrivalsGallery from './NewArrivalsGallery';
import { useProductContext } from '../context/ProductContext';

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const [animations, setAnimations] = useState(loadHomeAnimations());
  const { products } = useProductContext();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const onUpdate = () => setAnimations(loadHomeAnimations());
    window.addEventListener('home-animations-updated', onUpdate);
    return () => window.removeEventListener('home-animations-updated', onUpdate);
  }, []);

  return (
    <main className="bg-white">
      <HeroSection scrollY={scrollY} ref={heroRef} />
      <CollectionGrid />
      <section className="py-16 px-6 lg:px-12 max-w-screen-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-5xl text-hot-pink">Shop by Budget</h2>
          <p className="text-sm tracking-[0.3em] uppercase text-rose-gold pt-3">Quick picks for parents</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {(() => {
            const fallback: SiteSettings = { hero: {} as any, editorial: {} as any, collections: [], footerGroups: [], social: [], newsletter: { heading: '', subtext: '' }, legalLabels: { privacy: '', terms: '', cookies: '' }, infoPages: {}, budgets: [
              { label: 'Under ₹499', slug: 'under499', min: 0, max: 499 },
              { label: 'Under ₹799', slug: 'under799', min: 0, max: 799 },
              { label: 'Under ₹999', slug: 'under999', min: 0, max: 999 },
              { label: '₹1000 – ₹1499', slug: '1000-1499', min: 1000, max: 1499 },
              { label: '₹1500 – ₹1999', slug: '1500-1999', min: 1500, max: 1999 },
              { label: '₹2000+ Premium', slug: '2000plus', min: 2000, max: 3000 },
            ] };
            const site = loadSite(fallback);
            const budgets = site.budgets ?? fallback.budgets!;
            return budgets.map((b) => {
              const productInBudget = products.find(p => p.price >= b.min && p.price <= b.max);
              return { label: b.label, q: b.slug, image: productInBudget?.image };
            });
          })().map((b) => (
            <a key={b.q} href={`/shop?budget=${b.q}`} className="premium-card rounded-2xl overflow-hidden border bg-white/60 group">
              <div className="aspect-[3/4] bg-gradient-to-br from-pink-50 via-white to-peach-50 flex items-center justify-center overflow-hidden">
                {b.image ? (
                  <img src={b.image} alt={b.label} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
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
        <section className="py-20 px-6 lg:px-12 max-w-screen-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl mb-6 text-hot-pink">Homepage Animations</h2>
            <p className="text-sm tracking-[0.3em] uppercase text-rose-gold">Auto‑playing showcase from Admin</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
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
      <NewArrivalsGallery />
      <ProductShowcase />
    </main>
  );
}
