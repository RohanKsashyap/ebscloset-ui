import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductModal from './ProductModal';
import { useProductContext } from '../context/ProductContext';

export default function ProductShowcase() {
  const [selected, setSelected] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { newArrivals: catalog, loadingArrivals: loading } = useProductContext();
  const product = selected ? catalog.find((p) => (p._id || p.id) === selected) ?? null : null;
  return (
    <section className="py-24 px-6 lg:px-12 max-w-screen-2xl mx-auto">
      <div className="text-center mb-20">
        <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl mb-6 text-hot-pink">
          Magical New Arrivals
        </h2>
        <p className="text-sm tracking-[0.3em] uppercase text-rose-gold">
          Fresh & Fun for Growing Girls
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-600">Loading arrivals...</p>
        </div>
      ) : catalog.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-600">No arrivals available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-10 md:gap-y-16">
          {catalog.map((product) => {
            const productId = product._id || product.id;
            return (
              <div
                key={productId}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden aspect-[3/4] mb-6 bg-gray-100" onClick={() => navigate(`/product/${productId}`)} onMouseEnter={() => setHoverId(productId as any)} onMouseLeave={(e) => { const img = e.currentTarget.querySelector('img') as HTMLImageElement | null; if (img) img.style.transform = ''; setHoverId(null); }} onMouseMove={(e) => { const rect = (e.currentTarget as HTMLElement).getBoundingClientRect(); const px = (e.clientX - rect.left) / rect.width - 0.5; const py = (e.clientY - rect.top) / rect.height - 0.5; const img = e.currentTarget.querySelector('img') as HTMLImageElement | null; if (img) img.style.transform = `rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) scale(1.02)`; }} style={{ perspective: 1000 }}>
                  <img
                    src={hoverId === productId && product.images?.[1] ? product.images[1] : product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 ease-out cursor-pointer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black bg-opacity-20">
                    <button className="border-2 border-white text-white px-10 py-4 text-sm tracking-widest uppercase hover:bg-hot-pink hover:border-hot-pink transition-all duration-500" onClick={() => setSelected(productId as any)}>
                      Try It On
                    </button>
                  </div>
                </div>

                {product.category && (
                  <p className="text-xs tracking-widest uppercase text-millennial-pink mb-2">
                    {product.category}
                  </p>
                )}
                <h3 className="font-serif text-xl md:text-2xl mb-3 text-gray-800">
                  {product.name}
                </h3>
                <p className="text-lg text-hot-pink font-semibold">
                  ₹{product.price}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="text-center mt-14 md:mt-20">
        <button className="premium-button w-full sm:w-auto" onClick={() => navigate('/shop')}>
          See All Magic Dresses
        </button>
      </div>
      {product && (
        <ProductModal product={product} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
