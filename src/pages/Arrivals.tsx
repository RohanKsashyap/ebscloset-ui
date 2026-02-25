import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../services/productService';
import { productService } from '../services/productService';
import { useProductContext } from '../context/ProductContext';
import { Heart } from 'lucide-react';
import { formatAUD } from '../utils/storage';

export default function Arrivals() {
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toggleWishlist, isWishlisted } = useProductContext();
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await productService.getNewArrivals();
        setCatalog(list || []);
      } catch {
        setError('Failed to load new arrivals');
        setCatalog([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const hasCatalog = catalog && catalog.length > 0;
  const visible = Array.from({ length: 12 }).map((_, i) => ({ id: i, image: '', name: `Dress ${i+1}`, ageGroup: 'Ages 3–13' }));

  return (
    <main className="bg-white scroll-gradient-blur page-enter">
      <section className="py-24 px-6 lg:px-12 max-w-screen-2xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl mb-6 text-hot-pink">New Arrivals</h1>
          <p className="text-sm tracking-[0.3em] uppercase text-rose-gold">Latest Dresses and Editor's Picks</p>
        </div>

        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="overflow-hidden p-2">
                <div className="aspect-[3/4] bg-gray-200 rounded animate-pulse" />
                <div className="mt-3 h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="mt-2 h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
              </div>
            ))}
          </div>
        )}
        {error && !loading && (
          <div className="text-center text-red-600">{error}</div>
        )}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {hasCatalog ? (
              catalog.map((p, idx) => {
                const productId = p._id || p.id;
                return (
                  <div key={`${productId}-${idx}`} className="premium-card glass-card overflow-hidden">
                    <Link to={`/arrivals/${productId}`}>
                      <div className="relative aspect-[3/4] bg-gray-100 spotlight-under">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        <button
                          aria-label="Toggle wishlist"
                          onClick={() => toggleWishlist(productId)}
                          className="absolute top-3 right-3 bg-white/80 hover:bg-white rounded-full p-2 shadow"
                        >
                          <Heart
                            size={18}
                            className={isWishlisted(productId) ? 'text-hot-pink' : 'text-gray-700'}
                            fill={isWishlisted(productId) ? 'currentColor' : 'none'}
                          />
                        </button>
                      </div>
                    </Link>
                    <div className="p-3 text-center">
                      <p className="text-sm text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-600">{formatAUD(p.price)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              visible.map((it, i) => (
                <div key={i} className="premium-card glass-card overflow-hidden">
                  <Link to="/shop">
                    <div className="aspect-[3/4] bg-gradient-to-br from-pink-50 via-white to-peach-50 flex items-center justify-center">
                      <div className="w-24 h-32 rounded-2xl bg-white/70 border" />
                    </div>
                  </Link>
                  <div className="p-3 text-center">
                    <p className="text-sm text-gray-800">{it.name}</p>
                    <p className="text-xs text-gray-600">{it.ageGroup}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </main>
  );
}
