import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext';
import { loadSite, formatAUD, type SiteSettings } from '../utils/storage';
import { getOptimizedUrl } from '../utils/imageKit';
import { ArrowRight, Diamond, ShoppingBag, Star, Zap } from 'lucide-react';

export default function BudgetSection() {
  const { products } = useProductContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

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
        { label: 'The Essentials', slug: 'under20', min: 0, max: 2000 },
        { label: 'Playground Chic', slug: 'under40', min: 0, max: 4000 },
        { label: 'Weekend Luxury', slug: 'under60', min: 0, max: 6000 },
        { label: 'Party Ready', slug: '60-80', min: 6000, max: 8000 },
        { label: 'Premium Picks', slug: '80-100', min: 8000, max: 10000 },
      ] 
    };
    const site = loadSite(fallback);
    const budgets = site.budgets?.length ? site.budgets : fallback.budgets!;
    
    const items: any[] = [];
    budgets.forEach((b) => {
      const matchingProducts = products.filter(p => p.price >= b.min && p.price <= b.max);
      
      if (matchingProducts.length === 0) {
        const priceLabel = b.slug.startsWith('under')
          ? `Under ${formatAUD(b.max / 100)}`
          : b.slug === '100plus'
            ? `${formatAUD(b.min / 100)}+`
            : `${formatAUD(b.min / 100)} – ${formatAUD(b.max / 100)}`;
            
        items.push({ ...b, priceLabel, img: null, badge: 'Essentials' });
      } else {
        // Show up to 3 different products for each budget tier to provide variety
        matchingProducts.slice(0, 3).forEach((p, idx) => {
          const priceLabel = b.slug.startsWith('under')
            ? `Under ${formatAUD(b.max / 100)}`
            : b.slug === '100plus'
              ? `${formatAUD(b.min / 100)}+`
              : `${formatAUD(b.min / 100)} – ${formatAUD(b.max / 100)}`;
          
          items.push({
            ...b,
            id: p._id || p.id,
            label: p.name, // Show product name for variety
            categoryLabel: b.label, // Keep original budget label (e.g. Playground Chic)
            priceLabel,
            img: p.image || (p.images && p.images[0]) || null,
            badge: idx === 0 ? 'Best Deal' : idx === 1 ? 'Trending' : 'New'
          });
        });
      }
    });
    return items;
  }, [products]);

  // Auto-scroll logic
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        const cardWidth = window.innerWidth >= 768 ? 350 + 24 : 280 + 24;
        
        if (scrollLeft >= maxScroll - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="py-12 md:py-24 bg-[#FAF9F6] overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-4">
            THE CURATION <br />
            <span className="text-hot-pink italic">OF VALUE</span>
          </h2>
          <p className="text-gray-600 max-w-xl text-sm md:text-base leading-relaxed">
            Elevating children's fashion through accessible luxury. Explore our meticulously tiered budget selections for every occasion.
          </p>
        </div>

        <div 
          className="relative group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {budgetItems.map((item, idx) => (
              <Link 
                key={`${item.slug}-${item.id || idx}`}
                to={`/shop?budget=${item.slug}`}
                className="flex-shrink-0 w-[260px] sm:w-[280px] md:w-[350px] snap-start"
              >
                <div className="relative aspect-[3/4] rounded-[40px] overflow-hidden bg-white shadow-sm border border-gray-100 group/card transition-transform duration-500 hover:-translate-y-2">
                  {item.img ? (
                    <img 
                      src={getOptimizedUrl(item.img, 600)} 
                      alt={item.label}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
                      <ShoppingBag className="w-12 h-12 text-hot-pink/20" />
                    </div>
                  )}
                  
                  {/* Badge */}
                  <div className="absolute top-6 right-6">
                    <span className="bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      {item.badge}
                    </span>
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-white via-white/80 to-transparent">
                    <h3 className="text-hot-pink text-2xl md:text-3xl font-black mb-1 uppercase italic">
                      {item.priceLabel}
                    </h3>
                    <p className="text-gray-900 font-bold text-lg leading-tight mb-1">{item.label}</p>
                    <p className="text-gray-500 text-sm mb-4 uppercase tracking-widest">{item.categoryLabel}</p>
                    <div className="flex items-center gap-2 text-hot-pink font-bold text-sm uppercase tracking-widest group-hover/card:gap-4 transition-all">
                      Explore Budget Deals <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Premium Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white border border-gray-100 shadow-sm rounded-[40px] p-6 md:p-12 text-gray-900 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-hot-pink/10 blur-[100px] rounded-full -mr-32 -mt-32" />
          
          <div className="relative z-10 flex flex-col justify-center">
            <span className="text-hot-pink text-xs font-bold uppercase tracking-[0.3em] mb-4 block">Premium Selection</span>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">
              EB'S CLOSET <br />
              SELECTS
            </h2>
            <p className="text-gray-600 mb-8 max-w-md text-sm md:text-base leading-relaxed">
              Our signature high-end casual wear and formal wear for the most distinguished young wardrobes. Precision-crafted, limited edition pieces.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-3xl font-black text-hot-pink">$100+</span>
              <Link 
                to="/shop?budget=100plus" 
                className="px-8 py-4 bg-hot-pink text-white font-bold uppercase tracking-widest text-xs rounded-full transition-all duration-300 hover:bg-black"
              >
                Explore Premium
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="aspect-square bg-gray-50 rounded-3xl flex items-center justify-center border border-gray-100 hover:border-hot-pink/30 transition-colors">
              <Diamond className="w-10 h-10 text-hot-pink" />
            </div>
            <div className="aspect-square bg-gray-50 rounded-3xl flex items-center justify-center border border-gray-100 hover:border-hot-pink/30 transition-colors">
              <Star className="w-10 h-10 text-hot-pink" />
            </div>
            <div className="aspect-square bg-gray-50 rounded-3xl flex items-center justify-center border border-gray-100 hover:border-hot-pink/30 transition-colors">
              <Zap className="w-10 h-10 text-hot-pink" />
            </div>
            <div className="aspect-square bg-hot-pink rounded-3xl flex flex-col items-center justify-center text-center p-4 text-white">
              <span className="text-2xl font-black">E.B'S</span>
              <span className="text-[10px] uppercase font-bold tracking-widest">Limited</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
