import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService, Product } from '../services/productService';
import { formatAUD } from '../utils/storage';

interface SimilarProductsProps {
  currentId: string | number;
  categoryId?: string;
  categoryName?: string;
}

export default function SimilarProducts({ currentId, categoryId, categoryName }: SimilarProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params: any = {};
    if (categoryId) params.categoryId = categoryId;
    else if (categoryName) params.category = categoryName;

    productService.getAllProducts(params)
      .then(all => {
        console.log("SimilarProducts fetch all:", all.length, "params:", params);
        const filtered = all.filter(p => (p.id || p._id) !== currentId);
        console.log("SimilarProducts filtered:", filtered.length, "currentId:", currentId);
        setProducts(filtered.slice(0, 3));
      })
      .catch(err => {
        console.error("Failed to fetch similar products", err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [currentId, categoryId, categoryName]);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 animate-pulse min-h-[400px]">
      {[1, 2, 3].map(i => (
        <div key={i} className="aspect-[3/4] bg-gray-200" />
      ))}
    </div>
  );

  if (products.length === 0) {
    return (
      <div className="py-20 text-center border border-dashed border-gray-200 bg-gray-50/50 rounded-lg">
        <p className="text-gray-400 uppercase tracking-widest text-[10px] font-bold mb-4">
          No similar items found {categoryName ? `in ${categoryName}` : ''}
        </p>
        <Link to="/shop" className="text-[10px] tracking-widest uppercase text-hot-pink font-bold underline">
          Explore All Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 min-h-[200px]">
      {products.map((p) => (
        <a key={p.id || p._id} href={`/product/${p.slug || p.id || p._id}`} className="group block">
          <div className="relative overflow-hidden aspect-[3/4] mb-8 bg-gray-100">
            {p.image ? (
              <img 
                src={p.image} 
                alt={p.name} 
                className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" 
                loading="lazy" 
              />
            ) : (
              <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                 <div className="w-12 h-16 rounded-xl bg-white/70 border" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <h4 className="font-headline text-xl text-gray-900 uppercase tracking-tight">{p.name || 'Untitled Product'}</h4>
            <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-bold">{categoryName || 'Collection'}</p>
            <p className="text-sm text-gray-900 font-light">{formatAUD(Number(p.price) || 0)}</p>
          </div>
        </a>
      ))}
    </div>
  );
}
