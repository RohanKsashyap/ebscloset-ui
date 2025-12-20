import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import Gallery from './Gallery';
import Reviews from './Reviews';
import type { Product } from '../services/productService';
import { useEffect, useRef } from 'react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  if (!product) return null;
  const { addItem } = useCart();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    containerRef.current?.focus();
    return () => { document.body.style.overflow = prev; };
  }, []);
  const handleAdd = () => {
    const productId = product._id || product.id;
    addItem({ id: productId as any, name: product.name, price: Number(product.price), image: product.image }, 1);
    onClose();
  };

  const galleryImages = (product.images && product.images.length > 0) ? product.images : [product.image];
  return (
    <div ref={containerRef} tabIndex={-1} className="fixed inset-0 z-[100] flex items-center justify-center animate-fadeIn p-4" role="dialog" aria-modal="true" style={{ touchAction: 'none' }}>
      <div
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white w-[92%] max-w-3xl mx-4 animate-scaleIn max-h-[85vh] overflow-y-auto shadow-2xl rounded-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-black hover:opacity-60 transition-opacity duration-300 z-10"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="grid md:grid-cols-2">
          <div className="p-4">
            <Gallery images={galleryImages} onImageClick={() => { navigate(`/product/${product.id}`); onClose(); }} />
          </div>

          <div className="p-8 md:p-12">
            <p className="text-xs tracking-widest uppercase text-millennial-pink mb-2">
              {product.category}
            </p>
            <h3 className="font-serif text-2xl md:text-3xl mb-3 text-gray-800">
              {product.name}
            </h3>
            <p className="text-xl text-hot-pink font-semibold mb-6">
              ${product.price}
            </p>

            {(product.size || product.sizes) && (product.size?.length || product.sizes?.length) ? (
              <div className="mb-8">
                <p className="text-xs tracking-widest uppercase text-gray-600 mb-3">Select Size</p>
                <div className="flex flex-wrap gap-3">
                  {(product.size || product.sizes)?.map((size: string) => (
                    <button
                      key={size}
                      className="border border-gray-300 px-4 py-2 text-sm hover:border-hot-pink hover:text-hot-pink transition-colors duration-300"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex items-center gap-4">
              <button className="border-2 border-hot-pink text-hot-pink px-10 py-4 text-sm tracking-widest uppercase hover:bg-hot-pink hover:text-white transition-all duration-500" onClick={handleAdd}>
                Add to Bag
              </button>
              <button className="border-2 border-gray-900 text-gray-900 px-8 py-4 text-sm tracking-widest uppercase hover:bg-gray-900 hover:text-white transition-all duration-500" onClick={() => { handleAdd(); navigate('/checkout'); }}>
                Buy Now
              </button>
            </div>

            {product.reviews && product.reviews.length > 0 && (
              <div className="mt-8">
                <h4 className="font-serif text-xl mb-4 text-gray-800">Reviews</h4>
                <Reviews initialReviews={product.reviews} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
