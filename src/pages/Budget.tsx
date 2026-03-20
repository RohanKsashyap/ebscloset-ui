import { useNavigate } from 'react-router-dom';
import { loadSite, type SiteSettings, formatAUD } from '../utils/storage';

export default function Budget() {
  const navigate = useNavigate();
  const fallback: SiteSettings = { hero: {} as any, editorial: {} as any, collections: [], footerGroups: [], social: [], newsletter: { heading: '', subtext: '' }, legalLabels: { privacy: '', terms: '', cookies: '' }, infoPages: {}, budgets: [
    { label: 'Under $20', slug: 'under20', min: 0, max: 20 },
    { label: 'Under $40', slug: 'under40', min: 0, max: 40 },
    { label: 'Under $60', slug: 'under60', min: 0, max: 60 },
    { label: '$60 – $80', slug: '60-80', min: 60, max: 80 },
    { label: '$80 – $100', slug: '80-100', min: 80, max: 100 },
    { label: '$100+ Premium', slug: '100plus', min: 100, max: 10000 },
  ] };
  const site = loadSite(fallback);
  const boxes = (site.budgets ?? fallback.budgets!).map((b) => {
    const label = b.slug.startsWith('under')
      ? `Under ${formatAUD(b.max)}`
      : b.slug === '100plus'
        ? `${formatAUD(100)}+ Premium`
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
