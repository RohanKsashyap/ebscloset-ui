import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../services/productService';
import { productService } from '../services/productService';
import { formatAUD } from '../utils/storage';
import { getOptimizedUrl } from '../utils/imageKit';

export default function Casual() {
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const all = await productService.getAllProducts();
        setCatalog((all || []).filter((p) => (p.type || '').toLowerCase() === 'casual' || (p.occasion || '').toLowerCase().includes('casual')));
      } catch {
        setError('Failed to load casual dresses');
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
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl mb-6 text-hot-pink">Casual Dresses</h1>
          <p className="text-sm tracking-[0.3em] uppercase text-rose-gold">Comfort with style</p>
        </div>
        {loading && (
          <div className="text-center text-gray-700">Loading...</div>
        )}
        {error && !loading && (
          <div className="text-center text-red-600">{error}</div>
        )}
        {!loading && catalog.length === 0 ? (
          <div className="text-center text-gray-700">
            <p className="mb-3">No casual dresses yet.</p>
            <a href="/admin" className="premium-button">Add Items in Admin</a>
          </div>
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {catalog.map((p, idx) => {
            const productId = p._id || p.id;
            return (
              <div key={`${productId}-${idx}`} className="premium-card glass-card overflow-hidden">
                <Link to={`/product/${productId}`}>
                  <div className="aspect-[3/4] bg-gray-100 spotlight-under">
                    <img src={getOptimizedUrl(p.image, 400)} alt={p.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  </div>
                </Link>
                <div className="p-3 text-center">
                  <p className="text-sm text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-600">{formatAUD(p.price)}</p>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </section>
    </main>
  );
}
