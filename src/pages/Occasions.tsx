import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../services/productService';
import { productService } from '../services/productService';
import { formatAUD } from '../utils/storage';

export default function Occasions() {
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const all = await productService.getAllProducts();
        setCatalog((all || []).filter((p) => !!(p.occasion || '').trim()));
      } catch {
        setError('Failed to load occasions');
        setCatalog([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);
  return (
    <main className="bg-white scroll-gradient-blur page-enter">
      <section className="py-24 px-6 lg:px-12 max-w-screen-2xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl mb-6 text-hot-pink">Occasions</h1>
          <p className="text-sm tracking-[0.3em] uppercase text-rose-gold">Party-ready and special picks</p>
        </div>
        {loading && (
          <div className="text-center text-gray-700">Loading...</div>
        )}
        {error && !loading && (
          <div className="text-center text-red-600">{error}</div>
        )}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {catalog.map((p) => (
              <div key={p.id} className="premium-card glass-card overflow-hidden">
                <Link to={`/product/${p.id}`}>
                  <div className="aspect-[3/4] bg-gray-100 spotlight-under">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  </div>
                </Link>
                <div className="p-3 text-center">
                  <p className="text-sm text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-600">{formatAUD(p.price)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
