import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { loadArrivals, type ArrivalItem } from '../utils/storage';
import { useProductContext } from '../context/ProductContext';

export default function NewArrivalsGallery() {
  const [items, setItems] = useState<ArrivalItem[]>(() => loadArrivals());
  const { newArrivals: catalog } = useProductContext();
  const trackRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setItems(loadArrivals());
    const onArrivals = () => setItems(loadArrivals());
    window.addEventListener('arrivals-updated', onArrivals as any);
    return () => {
      window.removeEventListener('arrivals-updated', onArrivals as any);
    };
  }, []);

  const visible: ArrivalItem[] = items.length > 0 ? items : Array.from({ length: 8 }).map((_, i) => ({ id: i, image: '', name: `Dress ${i+1}`, ageGroup: 'Ages 3–13' }));

  const scrollBy = (n: number) => {
    const el = trackRef.current; if (!el) return;
    el.scrollBy({ left: n, behavior: 'smooth' });
  };

  return (
    <section className="relative py-20 px-6 lg:px-12 max-w-screen-2xl mx-auto" onClick={() => navigate('/arrivals')}>
      <div className="flex items-center justify-between mb-6">
        <Link to="/arrivals" className="group">
          <h2 className="font-serif text-2xl md:text-3xl text-gray-800 group-hover:text-hot-pink transition-colors">New Arrivals</h2>
          <p className="text-xs tracking-widest uppercase text-gray-600">Editor's Picks</p>
        </Link>
        <div className="flex items-center gap-3">
          <button aria-label="prev" onClick={(e) => { e.stopPropagation(); scrollBy(-360); }} className="px-4 py-3 rounded-full bg-white border shadow-sm hover:shadow-md ease-lux">
            <ChevronLeft className="w-5 h-5 text-hot-pink" />
          </button>
          <button aria-label="next" onClick={(e) => { e.stopPropagation(); scrollBy(360); }} className="px-4 py-3 rounded-full bg-white border shadow-sm hover:shadow-md ease-lux">
            <ChevronRight className="w-5 h-5 text-hot-pink" />
          </button>
          <Link to="/arrivals" className="premium-button">View All</Link>
        </div>
      </div>

      <div className="pointer-events-none absolute left-0 top-28 bottom-4 w-12 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute right-0 top-28 bottom-4 w-12 bg-gradient-to-l from-white to-transparent" />

      <div
        ref={trackRef}
        className="gallery-track flex gap-6 md:gap-8 overflow-x-auto snap-x snap-mandatory pb-4"
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => { const sx = touchX.current ?? e.changedTouches[0].clientX; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) scrollBy(dx < 0 ? 360 : -360); touchX.current = null; }}
        style={{ scrollBehavior: 'smooth' }}
      >
        {(catalog && catalog.length > 0 ? catalog : visible).map((it: any, i: number) => (
          <div key={it.id} className="snap-start shrink-0 w-[220px] sm:w-[280px] md:w-[340px]">
            <Link to="/arrivals" className="block overflow-hidden bg-white">
              <div className="aspect-[3/4] overflow-hidden">
                {it.image ? (
                  <img src={it.image} alt={it.name || `Dress ${i+1}`} className="w-full h-full object-cover transition-transform duration-300 ease-out hover:scale-[1.05]" />
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
              </div>
              <div className="px-3 py-3">
                <p className="text-sm font-medium text-gray-900">{it.name || `Dress ${i+1}`}</p>
                <p className="text-xs text-gray-600">{catalog && catalog.length > 0 ? `$${it.price}` : (it.ageGroup || 'Ages 3–13')}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
