import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useProductContext } from '../context/ProductContext';
import Gallery from '../components/Gallery';
import Reviews from '../components/Reviews';
import SimilarProducts from '../components/SimilarProducts';
import TrustBadges from '../components/TrustBadges';
import Accordion from '../components/Accordion';
import StickyBuyBar from '../components/StickyBuyBar';
import { Star } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loadingProducts } = useProductContext();
  const [size, setSize] = useState<string | null>(null);
  const [pin, setPin] = useState<string>('');
  const [pinMsg, setPinMsg] = useState<string>('');
  const { addItem } = useCart();

  const product = useMemo(() => {
    return products.find(p => (p._id || p.id) === id);
  }, [products, id]);

  if (loadingProducts) {
    return (
      <main className="bg-white">
        <section className="py-24 px-6 lg:px-12 max-w-screen-2xl mx-auto text-center">
          <p className="text-gray-600">Loading product...</p>
        </section>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="bg-white">
        <section className="py-24 px-6 lg:px-12 max-w-screen-2xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl mb-6 text-hot-pink">Product Not Found</h1>
          <p className="text-sm tracking-[0.3em] uppercase text-rose-gold">Please return to the shop</p>
          <a href="/shop" className="inline-block mt-8 border-2 border-hot-pink text-hot-pink px-10 py-4 text-sm tracking-widest uppercase hover:bg-hot-pink hover:text-white transition-all duration-500">Back to Shop</a>
        </section>
      </main>
    );
  }

  const avgRating = product.reviews ? (product.reviews.reduce((s, r) => s + r.rating, 0) / (product.reviews.length || 1)) : 0;

  const handleAdd = () => {
    const productId = product._id || product.id;
    addItem({ id: productId as any, name: product.name, price: product.price, image: product.image }, 1);
    alert('Added to bag');
  };

  const handleBuyNow = () => {
    if (!size) {
      alert('Please select a size');
      return;
    }
    const productId = product._id || product.id;
    addItem({ id: productId as any, name: product.name, price: product.price, image: product.image }, 1);
    navigate('/checkout');
  };

  return (
    <main className="bg-white">
      <section className="py-24 px-6 lg:px-12 max-w-screen-2xl mx-auto">
        <div className="mb-6 text-xs text-gray-600">
          <a href="/" className="hover:underline">Home</a>
          <span className="mx-2">/</span>
          <a href="/shop" className="hover:underline">Shop</a>
          <span className="mx-2">/</span>
          <span className="text-gray-800">{product.category || 'Products'}</span>
        </div>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <Gallery images={product.images || [product.image]} onImageClick={() => {
              const el = document.getElementById('details-top');
              el?.scrollIntoView({ behavior: 'smooth' });
            }} />
          </div>
          <div id="details-top" className="premium-card p-6 md:p-8">
            {product.category && (
              <p className="text-xs tracking-widest uppercase text-millennial-pink mb-2">{product.category}</p>
            )}
            <h1 className="font-serif text-3xl md:text-4xl mb-2 text-gray-800">{product.name}</h1>
            <div className="flex items-baseline gap-3 mb-3">
              <p className="text-2xl font-semibold">₹{product.price}</p>
              <span className="text-xs tracking-widest uppercase text-gray-500">Inclusive of taxes</span>
            </div>
            <div className="text-sm text-hot-pink mb-4">Extra 10% off with code MAGIC10</div>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-[11px] px-3 py-1 border rounded-full">Free shipping over ₹100</span>
              <span className="text-[11px] px-3 py-1 border rounded-full">30-day easy returns</span>
              <span className="text-[11px] px-3 py-1 border rounded-full">Ships in 2–3 days</span>
            </div>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.round(avgRating) ? 'text-hot-pink' : 'text-gray-300'}`} fill={i < Math.round(avgRating) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span className="text-sm text-gray-600">{product.reviews?.length || 0} reviews</span>
            </div>

            {product.description && (
              <p className="text-gray-700 leading-relaxed mb-8">{product.description}</p>
            )}
            {product.images && product.images.length > 0 && (
              <div className="mb-6">
                <p className="text-xs tracking-widest uppercase text-gray-600 mb-3">Color</p>
                <div className="flex gap-2">
                  {product.images.slice(0, 3).map((img, idx) => (
                    <img key={idx} src={img} alt="color" className="w-12 h-12 object-cover border" />
                  ))}
                </div>
              </div>
            )}

            {(product.size || product.sizes) && (product.size?.length || product.sizes?.length) ? (
              <div className="mb-8">
                <p className="text-xs tracking-widest uppercase text-gray-600 mb-3">Select Size</p>
                <div className="grid grid-cols-4 gap-2 max-w-xs">
                  {(product.size || product.sizes)?.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`h-10 text-sm transition-all duration-300 border ${size === s ? 'bg-black text-white border-black' : 'border-gray-900 text-gray-900 hover:bg-black hover:text-white'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {size && (
                  <p className="mt-3 text-sm text-gray-600">In stock</p>
                )}
                <div className="mt-3">
                  <a href="/size-guide" className="text-sm text-gray-700 underline">View Size Guide</a>
                </div>
              </div>
            ) : null}

            <div className="mb-6">
              <p className="text-xs tracking-widest uppercase text-gray-600 mb-2">Check Delivery</p>
              <div className="flex gap-2 max-w-sm">
                <input value={pin} onChange={(e) => setPin(e.target.value)} className="border px-4 py-2 flex-1" placeholder="PIN code" />
                <button className="premium-button w-[140px]" onClick={() => {
                  if (/^\d{6}$/.test(pin)) setPinMsg('Delivers in 3–5 days to your area'); else setPinMsg('Enter a valid 6-digit PIN');
                }}>Check</button>
              </div>
              {!!pinMsg && <p className="text-sm text-gray-700 mt-2">{pinMsg}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => { if (!size) { alert('Please select a size'); return; } handleAdd(); }} className="premium-button inverse w-full sm:w-auto">Add to Bag</button>
              <button onClick={handleBuyNow} className="premium-button w-full sm:w-auto">Buy Now</button>
              <button onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: product.name, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied');
                }
              }} className="text-gray-700 underline">Share</button>
            </div>

            <div className="mt-4 text-xs text-gray-700">
              <p>Free shipping over $100 • Easy 30-day returns</p>
            </div>

          </div>
        </div>

        <TrustBadges />

        <Accordion items={[
          { title: 'Details', content: product.description || 'No details available' },
          { title: 'Fabric & Care', content: (
            <div>
              {product.color && <p className="mb-2">{product.color}</p>}
              <p>Please contact us for care instructions.</p>
            </div>
          ) },
          { title: 'Shipping & Returns', content: (
            <div>
              <p>Ships in 2-3 business days. Free shipping over ₹100.</p>
              <p>30-day returns for unworn items with tags.</p>
            </div>
          ) },
        ]} />

        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl mb-6 text-gray-800">Reviews</h2>
            <Reviews initialReviews={product.reviews} />
          </div>
        )}

        <SimilarProducts currentId={product._id || product.id} category={product.category} />
        <StickyBuyBar name={product.name} price={product.price} disabled={!size} onAdd={() => { if (!size) { alert('Please select a size'); return; } handleAdd(); }} />
      </section>
    </main>
  );
}
