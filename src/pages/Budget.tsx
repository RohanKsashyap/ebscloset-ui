import { useNavigate } from 'react-router-dom';
import { loadSite, type SiteSettings, formatAUD } from '../utils/storage';
import { useProductContext } from '../context/ProductContext';
import { getOptimizedUrl } from '../utils/imageKit';
import { useMemo } from 'react';

export default function Budget() {
  const navigate = useNavigate();
  const { products } = useProductContext();

  const fallback: SiteSettings = { 
    hero: {} as any, 
    editorial: {} as any, 
    collections: [], 
    footerGroups: [], 
    social: [], 
    newsletter: { heading: '', subtext: '' }, 
    legalLabels: { privacy: '', terms: '', cookies: '' }, 
    infoPages: {}, 
    budgets: [
      { label: 'Under $20', slug: 'under20', min: 0, max: 2000 },
      { label: 'Under $40', slug: 'under40', min: 0, max: 4000 },
      { label: 'Under $60', slug: 'under60', min: 0, max: 6000 },
      { label: '$60 – $80', slug: '60-80', min: 6000, max: 8000 },
      { label: '$80 – $100', slug: '80-100', min: 8000, max: 10000 },
      { label: '$100+ Premium', slug: '100plus', min: 10000, max: 1000000 },
    ] 
  };

  const site = loadSite(fallback);
  const budgets = site.budgets ?? fallback.budgets!;

  const boxes = useMemo(() => {
    return budgets.map((b) => {
      const label = b.slug.startsWith('under')
        ? `Under ${formatAUD(b.max)}`
        : b.slug === '100plus'
          ? `${formatAUD(b.min)}+ Premium`
          : `${formatAUD(b.min)} – ${formatAUD(b.max)}`;
      
      const p = products.find(p => p.price >= b.min && p.price <= b.max);
      const img = p?.image || (p?.images && p.images[0]) || null;
      
      return { 
        label, 
        q: b.slug, 
        img,
        color: 'from-pink-50 via-white to-peach-50' 
      };
    });
  }, [budgets, products]);

  return (
    <main className="bg-white">
      <section className="py-24 px-6 lg:px-12 max-w-screen-2xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl mb-6 text-hot-pink">Shop by Budget</h1>
          <p className="text-sm tracking-[0.3em] uppercase text-rose-gold">Quick picks for parents</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-10">
          {boxes.map((b) => (
            <button key={b.q} className="premium-card rounded-2xl overflow-hidden border bg-white/60" onClick={() => navigate(`/shop?budget=${b.q}`)}>
              <div className={`aspect-[4/3] bg-gradient-to-br ${b.color} flex items-center justify-center overflow-hidden`}> 
                {b.img ? (
                  <img src={getOptimizedUrl(b.img, 400)} alt={b.label} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-white/70 border" />
                )}
              </div>
              <div className="p-4 text-center">
                <p className="text-sm text-gray-800">{b.label}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
