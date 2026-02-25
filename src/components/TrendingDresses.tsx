import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { loadTrendingDresses, type TrendingDress } from '../utils/storage';

export default function TrendingDresses() {
  const [items, setItems] = useState<TrendingDress[]>(() => loadTrendingDresses());
  const [idx, setIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    setItems(loadTrendingDresses());
  }, []);

  const visible: TrendingDress[] = items.length > 0 ? items : Array.from({ length: 6 }).map((_, i) => ({ id: i, image: '', name: `Dress ${i+1}`, link: '' }));

  const go = (n: number) => setIdx((i) => (i + n + visible.length) % visible.length);

  return (
    <section className="py-20 px-6 lg:px-12 max-w-screen-2xl mx-auto">
      <div className="rounded-3xl p-6 bg-white/40 backdrop-blur-xl border border-white/30 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl md:text-3xl text-gray-800">Trending Dresses</h2>
          <div className="text-sm text-gray-600">{visible.length} items</div>
        </div>

        <div className="relative">
          <button aria-label="prev" onClick={() => go(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/60 backdrop-blur-md border border-white/50 rounded-full p-3 shadow-md hover:bg-white ease-lux">
            <ChevronLeft className="w-5 h-5 text-hot-pink" />
          </button>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative">
              <div className="relative w-full max-w-lg md:max-w-xl mx-auto">
                <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-gradient-to-br from-pink-50 via-white to-peach-50 shadow-2xl" onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }} onTouchEnd={(e) => { const sx = touchX.current ?? e.changedTouches[0].clientX; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) { go(dx < 0 ? 1 : -1); } touchX.current = null; }}>
                  {visible[idx].image ? (
                    <img src={visible[idx].image} alt={visible[idx].name || 'Dress'} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-24 h-32 rounded-2xl bg-white/70 border" />
                    </div>
                  )}
                </div>
                <div className="pointer-events-none absolute inset-0 rounded-3xl" style={{ background: 'radial-gradient(140px 160px at 50% 30%, rgba(255,255,255,0.35), transparent), linear-gradient(to bottom, rgba(255,255,255,0.25), transparent 40%)' }} />
                <div className="absolute inset-x-16 bottom-2 h-6 rounded-full bg-black/5 blur-sm" />
              </div>
            </div>

            <div className="md:pl-6">
              <h3 className="text-xl md:text-2xl text-hot-pink mb-2">{visible[idx].name || 'Premium Dress'}</h3>
              <p className="text-sm text-gray-700">Explore our curated selection of premium girls’ dresses. Soft pastels, gentle highlights, and a modern premium feel.</p>
              <div className="mt-4">
                {visible[idx].link ? (
                  visible[idx].link.startsWith('http') ? (
                    <a href={visible[idx].link} className="inline-block border-2 border-hot-pink text-hot-pink px-6 py-3 text-sm tracking-widest uppercase rounded-full hover:bg-hot-pink hover:text-white ease-lux">Limited Edition — Buy Now</a>
                  ) : (
                    <Link to={visible[idx].link} className="inline-block border-2 border-hot-pink text-hot-pink px-6 py-3 text-sm tracking-widest uppercase rounded-full hover:bg-hot-pink hover:text-white ease-lux">Limited Edition — Buy Now</Link>
                  )
                ) : (
                  <Link to="/shop" className="inline-block border-2 border-hot-pink text-hot-pink px-6 py-3 text-sm tracking-widest uppercase rounded-full hover:bg-hot-pink hover:text-white ease-lux">Limited Edition — Buy Now</Link>
                )}
              </div>
            </div>
          </div>

          <button aria-label="next" onClick={() => go(1)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/60 backdrop-blur-md border border-white/50 rounded-full p-3 shadow-md hover:bg-white ease-lux">
            <ChevronRight className="w-5 h-5 text-hot-pink" />
          </button>
        </div>

        <div ref={trackRef} className="mt-8 flex md:grid md:grid-cols-6 gap-3 overflow-x-auto">
          {visible.map((d, i) => (
            <button key={d.id} onClick={() => setIdx(i)} className={`rounded-2xl overflow-hidden border ${i===idx ? 'border-hot-pink' : ''} hover:border-hot-pink ease-lux`}>
              <div className="aspect-square bg-white/60">
                {d.image ? (
                  <img src={d.image} alt={d.name || 'Dress'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-8 h-10 rounded-lg bg-white/80 border" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <button aria-label="scroll" onClick={() => { go(1); trackRef.current?.scrollBy({ left: 240, behavior: 'smooth' }); }} className="mt-6 ml-auto flex items-center gap-2 px-4 py-3 rounded-full bg-white/60 backdrop-blur-md border border-white/50 shadow-md hover:bg-white ease-lux">
          <span className="text-sm text-gray-800">Scroll</span>
          <ChevronRight className="w-5 h-5 text-hot-pink" />
        </button>
      </div>
    </section>
  );
}
