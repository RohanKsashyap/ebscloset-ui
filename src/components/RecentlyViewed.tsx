import { useEffect, useState } from 'react';
import { Product } from '../data/products';
import { loadProducts } from '../utils/storage';
import { products as defaultProducts } from '../data/products';

export default function RecentlyViewed() {
  const [recent, setRecent] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('recently_viewed');
      if (stored) {
        const ids = JSON.parse(stored) as number[];
        const allProducts = loadProducts(defaultProducts);
        // Filter out products that might have been deleted and limit to 4
        const found = ids.map(id => allProducts.find(p => p.id === id)).filter((p): p is Product => !!p).slice(0, 4);
        setRecent(found);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  if (recent.length === 0) return null;

  return (
    <section className="mt-16 border-t pt-16">
      <h3 className="font-serif text-2xl mb-8 text-gray-800 text-center">Recently Viewed</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {recent.map((p) => (
          <a key={p.id} href={`/product/${p.id}`} className="group block">
            <div className="relative overflow-hidden aspect-[3/4] mb-3 bg-gray-100 rounded-lg">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105" loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </div>
            <p className="text-xs tracking-widest uppercase text-millennial-pink">{p.category}</p>
            <h4 className="font-serif text-base text-gray-800 group-hover:text-hot-pink transition-colors">{p.name}</h4>
            <p className="text-sm text-gray-900 font-semibold">${p.price}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
