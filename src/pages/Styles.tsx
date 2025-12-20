import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../services/productService';
import { loadStyleProducts } from '../utils/storage';

export default function Styles() {
  const catalog = useMemo<Product[]>(() => loadStyleProducts(), []);
  return (
    <main className="bg-white">
      <section className="py-24 px-6 lg:px-12 max-w-screen-2xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl mb-6 text-hot-pink">Styles</h1>
          <p className="text-sm tracking-[0.3em] uppercase text-rose-gold">Princess, sparkle, floral and more</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {catalog.map((p) => (
            <div key={p.id} className="premium-card overflow-hidden">
              <Link to={`/product/${p.id}`}>
                <div className="aspect-[3/4] bg-gray-100">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
              </Link>
              <div className="p-3 text-center">
                <p className="text-sm text-gray-800">{p.name}</p>
                <p className="text-xs text-gray-600">${p.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
