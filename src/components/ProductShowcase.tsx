import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductModal from './ProductModal';
import { products as defaultProducts } from '../data/products';
import { loadProducts } from '../utils/storage';
import { useProductContext } from '../context/ProductContext';

export default function ProductShowcase() {
  const { products } = useProductContext();
  const [selected, setSelected] = useState<any | null>(null);
  const [hoverId, setHoverId] = useState<any | null>(null);
  const navigate = useNavigate();
  
  const catalog = useMemo(() => {
    return products.length > 0 ? products : loadProducts(defaultProducts);
  }, [products]);

  const selectedProduct = selected ? catalog.find((p: any) => (p._id || p.id) === selected) ?? null : null;
  return (
    <section className="py-12 md:py-24 px-4 sm:px-6 lg:px-12 max-w-screen-2xl mx-auto">
      <div className="text-center mb-12 md:mb-20">
        <h2 className="font-serif text-3xl md:text-6xl lg:text-7xl mb-4 md:mb-6 text-hot-pink">
          Magical New Arrivals
        </h2>
        <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-rose-gold">
          Fresh & Fun for Growing Girls
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-8 md:gap-y-16">
        {catalog.map((product: any) => {
          const id = product._id || product.id;
          const name = product.name || product.title;
          const img = product.image || (product.images && product.images[0]);
          const hoverImg = (product.images && product.images[1]) || img;

          return (
            <div
              key={id}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden aspect-[3/4] mb-4 md:mb-6 bg-gray-100" onClick={() => navigate(`/product/${id}`)} onMouseEnter={() => setHoverId(id)} onMouseLeave={(e) => { const imgEl = e.currentTarget.querySelector('img') as HTMLImageElement | null; if (imgEl) imgEl.style.transform = ''; setHoverId(null); }} onMouseMove={(e) => { const rect = (e.currentTarget as HTMLElement).getBoundingClientRect(); const px = (e.clientX - rect.left) / rect.width - 0.5; const py = (e.clientY - rect.top) / rect.height - 0.5; const imgEl = e.currentTarget.querySelector('img') as HTMLImageElement | null; if (imgEl) imgEl.style.transform = `rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) scale(1.02)`; }} style={{ perspective: 1000 }}>
                <img
                  src={hoverId === id ? hoverImg : img}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-300 ease-out cursor-pointer"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black bg-opacity-20">
                  <button className="hidden md:block border-2 border-white text-white px-10 py-4 text-sm tracking-widest uppercase hover:bg-hot-pink hover:border-hot-pink transition-all duration-500" onClick={(e) => { e.stopPropagation(); setSelected(id); }}>
                    Try It On
                  </button>
                </div>
              </div>

              <p className="text-[10px] md:text-xs tracking-widest uppercase text-millennial-pink mb-1 md:mb-2">
                {product.category}
              </p>
              <h3 className="font-serif text-base md:text-2xl mb-1 md:mb-3 text-gray-800 line-clamp-1 md:line-clamp-none">
                {name}
              </h3>
              <p className="text-base md:text-lg text-hot-pink font-semibold">
                ₹{product.price}
              </p>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-14 md:mt-20">
        <button className="premium-button w-full sm:w-auto" onClick={() => navigate('/shop')}>
          See All Magic Dresses
        </button>
      </div>
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
