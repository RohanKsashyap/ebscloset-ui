import { useEffect, useMemo, useRef, useState } from 'react';
import { products as defaultProducts } from '../data/products';
import { loadProducts, formatAUD } from '../utils/storage';

interface SimilarProductsProps {
  currentId: number;
  category: string;
}

export default function SimilarProducts({ currentId, category }: SimilarProductsProps) {
  const catalog = useMemo(() => loadProducts(defaultProducts), []);
  const list = useMemo(() => {
    const same = catalog.filter((p) => p.id !== currentId && p.category === category);
    if (same.length >= 4) return same.slice(0, 4);
    const others = catalog.filter((p) => p.id !== currentId && p.category !== category);
    return [...same, ...others].slice(0, 4);
  }, [currentId, category, catalog]);

  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setVisible(true);
      });
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className={`mt-16 ${visible ? 'animate-fadeIn' : 'opacity-0'}`}>
      <h3 className="font-serif text-2xl mb-6 text-gray-800">You May Also Love</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {list.map((p) => (
          <a key={p.id} href={`/product/${p.id}`} className="group block">
            <div className="relative overflow-hidden aspect-[3/4] mb-3 bg-gray-100">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105" loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </div>
            <p className="text-xs tracking-widest uppercase text-millennial-pink">{p.category}</p>
            <h4 className="font-serif text-base text-gray-800">{p.name}</h4>
            <p className="text-sm text-hot-pink font-semibold">{formatAUD(p.price)}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
