import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext';

export default function Age() {
  const { products, loadingProducts, error } = useProductContext();

  const catalog = useMemo(() => {
    return (products || []).filter((p) => (p.category || '').toLowerCase().startsWith('age'));
  }, [products]);

  return (
    <main className="bg-white scroll-gradient-blur page-enter">
      <section className="py-24 px-6 lg:px-12 max-w-screen-2xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl mb-6 text-black">By Age</h1>
          <p className="text-sm tracking-[0.3em] uppercase text-">Curated picks by age groups</p>
        </div>
        {loadingProducts && (
          <div className="text-center text-gray-700">Loading...</div>
        )}
        {error && !loadingProducts && (
          <div className="text-center text-red-600">{error}</div>
        )}
        {!loadingProducts && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {catalog.map((p) => (
              <div key={p._id || p.id} className="premium-card glass-card overflow-hidden">
                <Link to={`/product/${p._id || p.id}`}>
                  <div className="aspect-[3/4] bg-gray-100 spotlight-under">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  </div>
                </Link>
                <div className="p-3 text-center">
                  <p className="text-sm text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-600">${p.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
