import { useMemo, useState, useEffect } from 'react';
import { loadSite, type SiteSettings } from '../utils/storage';
import { Link, useLocation } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext';

const ageFilters = ['All','7-9','8-10','9-11','10-12','11-13'];

export default function Shop() {
  const { products: catalog, loadingProducts: loading } = useProductContext();
  const [age, setAge] = useState<string>('All');
  const [color, setColor] = useState<string>('All');
  const [type, setType] = useState<string>('All');
  const [occasion, setOccasion] = useState<string>('All');
  const [size, setSize] = useState<string>('All');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(3000);
  const [q, setQ] = useState('');
  const [hoverId, setHoverId] = useState<number | null>(null);
  const location = useLocation();

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const b = sp.get('budget');
    if (b) {
      const fallback: SiteSettings = { hero: {} as any, editorial: {} as any, collections: [], footerGroups: [], social: [], newsletter: { heading: '', subtext: '' }, legalLabels: { privacy: '', terms: '', cookies: '' }, infoPages: {}, budgets: [] };
      const site = loadSite(fallback);
      const match = (site.budgets ?? []).find((x) => x.slug === b);
      if (match) { setMinPrice(match.min); setMaxPrice(match.max); }
      else {
        if (b === 'under499') { setMinPrice(0); setMaxPrice(499); }
        else if (b === 'under799') { setMinPrice(0); setMaxPrice(799); }
        else if (b === 'under999') { setMinPrice(0); setMaxPrice(999); }
        else if (b === '1000-1499') { setMinPrice(1000); setMaxPrice(1499); }
        else if (b === '1500-1999') { setMinPrice(1500); setMaxPrice(1999); }
        else if (b === '2000plus') { setMinPrice(2000); setMaxPrice(3000); }
      }
    }
    const qParam = sp.get('q');
    if (qParam) setQ(qParam);
    const tParam = sp.get('type');
    if (tParam) setType(tParam);
  }, [location.search]);

  const filtered = useMemo(() => {
    return catalog.filter((p) => {
      const priceVal = p.price;
      if (priceVal < minPrice || priceVal > maxPrice) return false;
      if (age !== 'All' && !p.category?.includes(age)) return false;
      
      if (color !== 'All') {
        const colorStr = Array.isArray(p.color) 
          ? p.color.join(',').toLowerCase() 
          : (p.color ?? '').toLowerCase();
        if (!colorStr.includes(color.toLowerCase())) return false;
      }
      
      const sizeArray = p.size || p.sizes;
      if (size !== 'All' && !Array.isArray(sizeArray)) return false;
      if (size !== 'All' && Array.isArray(sizeArray) && !sizeArray.includes(size)) return false;
      
      if (q) {
        const text = `${p.name} ${p.description ?? ''}`.toLowerCase();
        const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
        if (!tokens.every(t => text.includes(t))) return false;
      }
      return true;
    });
  }, [age, color, type, occasion, size, minPrice, maxPrice, q, catalog]);


  return (
    <main className="bg-white scroll-gradient-blur page-enter">
      <section className="py-24 px-6 lg:px-12 max-w-screen-2xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl mb-6 text-hot-pink">Girls Dresses</h1>
          <p className="text-sm tracking-[0.3em] uppercase text-rose-gold">Premium selection for ages 7-13</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="md:col-span-1 p-4 border rounded-2xl bg-white/60">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="w-full mb-4 px-3 py-2 border rounded" />
            <div className="mb-3">
              <label className="block text-xs text-gray-600 mb-1">Age</label>
              <select value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-3 py-2 border rounded">
                {ageFilters.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-600 mb-1">Color</label>
              <select value={color} onChange={(e) => setColor(e.target.value)} className="w-full px-3 py-2 border rounded">
                {['All','Pink','Lavender','Sky Blue','Red'].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-600 mb-1">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 border rounded">
                {['All','Party','Western','Ethnic','Casual','Winter'].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-600 mb-1">Occasion</label>
              <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className="w-full px-3 py-2 border rounded">
                {['All','Birthday','Wedding','School Event'].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-600 mb-1">Size</label>
              <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full px-3 py-2 border rounded">
                {['All','7-8','9-10','11-12','12-13'].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-xs text-gray-600 mb-2">Price Budget</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-700">₹{minPrice}</span>
                <input type="range" min={0} max={3000} value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value))} className="flex-1" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-gray-700">₹{maxPrice}</span>
                <input type="range" min={0} max={3000} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="flex-1" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <button className="border px-2 py-1 rounded" onClick={() => { setMinPrice(0); setMaxPrice(499); }}>₹499 Deals</button>
                <button className="border px-2 py-1 rounded" onClick={() => { setMinPrice(0); setMaxPrice(799); }}>₹799 Bestsellers</button>
                <button className="border px-2 py-1 rounded" onClick={() => { setMinPrice(1500); setMaxPrice(1999); }}>₹1500 Luxury</button>
              </div>
            </div>
          </div>
          <div className="md:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <p className="text-gray-600">Loading products...</p>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <p className="text-gray-600">No products found matching your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-10 md:gap-y-16">
                {filtered.map((p, idx) => {
                  const productId = p._id || p.id;
                  return (
                    <div key={productId} className="group text-left premium-card glass-card p-4">
                      <div className="relative overflow-hidden aspect-[3/4] mb-4 bg-gray-100 spotlight-under" onMouseEnter={() => setHoverId(productId as any)} onMouseLeave={(e) => { const img = e.currentTarget.querySelector('img') as HTMLImageElement | null; if (img) img.style.transform = ''; setHoverId(null); }} onMouseMove={(e) => { const rect = (e.currentTarget as HTMLElement).getBoundingClientRect(); const px = (e.clientX - rect.left) / rect.width - 0.5; const py = (e.clientY - rect.top) / rect.height - 0.5; const img = e.currentTarget.querySelector('img') as HTMLImageElement | null; if (img) img.style.transform = `rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) scale(1.02)`; }} style={{ perspective: 1000 }}>
                        <Link to={`/product/${productId}`}>
                          <img src={hoverId === productId && p.images?.[1] ? p.images[1] : p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 ease-out cursor-pointer" />
                        </Link>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 pointer-events-none" />
                        {idx < 3 && (
                          <div className="absolute top-3 left-3 bg-black text-white text-[10px] tracking-widest uppercase px-2 py-1">New</div>
                        )}
                      </div>
                      <h3 className="font-serif text-lg md:text-xl text-gray-800">{p.name}</h3>
                      <p className="text-base text-hot-pink font-semibold">₹{p.price}</p>
                      <div className="flex flex-wrap gap-3 mt-3">
                        <Link to={`/product/${productId}`} className="premium-button cta-glow w-full sm:w-auto">View Details</Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        

        
      </section>
    </main>
  );
}
