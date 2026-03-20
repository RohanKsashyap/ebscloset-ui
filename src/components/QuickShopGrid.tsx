import { useMemo, useState } from 'react';
import ProductModal from './ProductModal';
import { products as defaultProducts } from '../data/products';
import { loadProducts } from '../utils/storage';

const ageFilters = ['All','7-9','8-10','9-11','10-12','11-13'];

export default function QuickShopGrid() {
  const [filter, setFilter] = useState<string>('All');
  const [selected, setSelected] = useState<number | null>(null);
  const catalog = useMemo(() => loadProducts(defaultProducts), []);

  const filtered = useMemo(() => {
    if (filter === 'All') return catalog;
    return catalog.filter(p => p.category.includes(filter));
  }, [filter, catalog]);

  const product = selected ? catalog.find(p => p.id === selected) ?? null : null;

  return (
    <section className="py-24 px-6 lg:px-12 max-w-screen-2xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl mb-6 text-hot-pink">
          Quick Shop
        </h2>
        <p className="text-sm tracking-[0.3em] uppercase text-rose-gold">
          Click a box to view and purchase
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
        {ageFilters.map(a => (
          <button
            key={a}
            className={`border px-4 py-2 text-xs tracking-widest uppercase transition-all duration-300 ${filter===a ? 'border-hot-pink text-hot-pink' : 'border-gray-300 text-gray-700 hover:border-hot-pink hover:text-hot-pink'}`}
            onClick={() => setFilter(a)}
          >
            {a}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-10">
        {filtered.map((p) => (
          <button
            key={p.id}
            className="group cursor-pointer text-left"
            onClick={() => setSelected(p.id)}
          >
            <div className="relative overflow-hidden aspect-[3/4] mb-4 bg-gray-100">
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </div>
            <p className="text-xs tracking-widest uppercase text-millennial-pink mb-1">{p.category}</p>
            <h3 className="font-serif text-lg md:text-xl text-gray-800">{p.name}</h3>
            <p className="text-base text-hot-pink font-semibold">${p.price}</p>
          </button>
        ))}
      </div>

      {product && (
        <ProductModal product={product} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
