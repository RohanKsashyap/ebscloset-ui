import { useNavigate } from 'react-router-dom';
import { loadSite, type SiteSettings, formatAUD } from '../utils/storage';

export default function Budget() {
  const navigate = useNavigate();
  const fallback: SiteSettings = { hero: {} as any, editorial: {} as any, collections: [], footerGroups: [], social: [], newsletter: { heading: '', subtext: '' }, legalLabels: { privacy: '', terms: '', cookies: '' }, infoPages: {}, budgets: [
    { label: 'Under ₹499', slug: 'under499', min: 0, max: 499 },
    { label: 'Under ₹799', slug: 'under799', min: 0, max: 799 },
    { label: 'Under ₹999', slug: 'under999', min: 0, max: 999 },
    { label: '₹1000 – ₹1499', slug: '1000-1499', min: 1000, max: 1499 },
    { label: '₹1500 – ₹1999', slug: '1500-1999', min: 1500, max: 1999 },
    { label: '₹2000+ Premium', slug: '2000plus', min: 2000, max: 3000 },
  ] };
  const site = loadSite(fallback);
  const boxes = (site.budgets ?? fallback.budgets!).map((b) => {
    const label = b.slug.startsWith('under')
      ? `Under ${formatAUD(b.max)}`
      : b.slug === '2000plus'
        ? `${formatAUD(2000)}+ Premium`
        : `${formatAUD(b.min)} – ${formatAUD(b.max)}`;
    return { label, q: b.slug, color: 'from-pink-50 via-white to-peach-50' };
  });
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
              <div className={`aspect-[4/3] bg-gradient-to-br ${b.color} flex items-center justify-center`}> 
                <div className="w-24 h-24 rounded-2xl bg-white/70 border" />
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
