import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import Gallery from '../components/Gallery';
import Reviews from '../components/Reviews';
import SimilarProducts from '../components/SimilarProducts';
import RecentlyViewed from '../components/RecentlyViewed';
import TrustBadges from '../components/TrustBadges';
import Accordion from '../components/Accordion';
import StickyBuyBar from '../components/StickyBuyBar';
import { Star, Sparkles, Scissors, Ruler, X, Heart } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { productService } from '../services/productService';
import { useProductContext } from '../context/ProductContext';
import { formatAUD } from '../utils/storage';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState<string | null>(null);
  const [pin, setPin] = useState<string>('');
  const [pinMsg, setPinMsg] = useState<string>('');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const { addItem } = useCart();
  const { showToast } = useToast();
  const { toggleWishlist, isWishlisted } = useProductContext();
  const reviewsCount = product?.reviews?.length || 0;
  const avgRating = reviewsCount > 0 
    ? (product.reviews ?? []).reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviewsCount
    : 0;

  useEffect(() => {
    setLoading(true);
    productService.getProduct(String(id))
      .then((p) => {
        if (p) {
          const normalized = {
            ...p,
            name: p.name || (p as any).title,
            images: (p.images && p.images.length > 0) ? p.images : (p.image ? [p.image] : []),
            image: p.image || (p.images && p.images[0] ? p.images[0] : '')
          };
          setProduct(normalized);
        } else {
          setProduct(null);
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (product?.id) {
      const stored = localStorage.getItem('recently_viewed');
      let ids: (string | number)[] = stored ? JSON.parse(stored) : [];
      ids = [product.id, ...ids.filter(i => i !== product.id)].slice(0, 10);
      localStorage.setItem('recently_viewed', JSON.stringify(ids));
    }
  }, [product]);

  if (loading) {
    return (
      <main className="bg-white">
        <section className="py-24 px-6 lg:px-12 max-w-screen-2xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl mb-6 text-hot-pink">Loading</h1>
          <p className="text-sm tracking-[0.3em] uppercase text-rose-gold">Please wait</p>
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

  const handleAdd = () => {
    addItem({ id: product.id || product._id, name: product.name, price: product.price, originalPrice: product.originalPrice, image: product.image, size: size ?? undefined }, 1);
    showToast('Added to bag');
  };

  const handleReviewSubmit = async (name: string, rating: number, comment: string, orderId: string, contact: string) => {
    try {
      await productService.addReview(product._id || product.id, name, rating, comment, orderId, contact);
      showToast('Review submitted for approval!');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to submit review', 'error');
      throw err;
    }
  };

  return (
    <main className="bg-white">
      <section className="pt-24 pb-12 md:py-24 px-4 sm:px-6 lg:px-12 max-w-screen-2xl mx-auto">
        <div className="mb-6 text-[10px] md:text-xs text-gray-600 overflow-x-auto whitespace-nowrap">
          <a href="/" className="hover:underline">Home</a>
          <span className="mx-2">/</span>
          <a href="/shop" className="hover:underline">Shop</a>
          <span className="mx-2">/</span>
          <span className="text-gray-800">{product.category}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div>
            <Gallery images={product.images ?? []} onImageClick={() => {
              const el = document.getElementById('details-top');
              el?.scrollIntoView({ behavior: 'smooth' });
            }} />
          </div>
          <div id="details-top" className="premium-card p-5 sm:p-6 md:p-8">
            <p className="text-[10px] md:text-xs tracking-widest uppercase text-millennial-pink mb-2">{product.category}</p>
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl mb-2 text-gray-800 leading-tight">{product.name}</h1>
              <button
                aria-label="Toggle wishlist"
                onClick={() => toggleWishlist(product.id)}
                className="mt-1 bg-white/80 hover:bg-white rounded-full p-2 shadow flex-shrink-0"
              >
                <Heart
                  className={isWishlisted(product.id) ? 'text-hot-pink' : 'text-gray-700'}
                  fill={isWishlisted(product.id) ? 'currentColor' : 'none'}
                  size={18}
                />
              </button>
            </div>
            <div className="flex items-baseline gap-3 mb-3">
              <p className="text-xl md:text-2xl font-semibold text-hot-pink">{formatAUD(product.price)}</p>
              {product.originalPrice && (
                <p className="text-base md:text-lg text-gray-400 line-through decoration-hot-pink/30">{formatAUD(product.originalPrice)}</p>
              )}
              {product.sku && (
                <span className="text-[10px] md:text-xs tracking-widest uppercase text-gray-500 ml-auto">Inclusive of taxes</span>
              )}
            </div>
            <div className="text-xs md:text-sm text-hot-pink mb-4">Extra 10% off with code MAGIC10</div>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-[10px] md:text-[11px] px-3 py-1 border rounded-full">Free shipping over $100</span>
              <span className="text-[10px] md:text-[11px] px-3 py-1 border rounded-full">30-day easy returns</span>
              <span className="text-[10px] md:text-[11px] px-3 py-1 border rounded-full">Ships in 2–3 days</span>
            </div>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.round(avgRating) ? 'text-hot-pink' : 'text-gray-300'}`} fill={i < Math.round(avgRating) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span className="text-sm text-gray-600">{reviewsCount} reviews</span>
            </div>

            <p className="text-gray-700 leading-relaxed mb-8">{product.description}</p>
            <div className="mb-6">
              <p className="text-xs tracking-widest uppercase text-gray-600 mb-3">Color: <span className="text-gray-900 font-medium">{product.color || 'Multi'}</span></p>
              <div className="flex gap-2">
                {(product.images ?? []).slice(0,3).map((img: string, idx: number) => (
                  <div key={idx} className={`border-2 rounded-sm p-0.5 cursor-pointer ${idx === 0 ? 'border-gray-900' : 'border-transparent hover:border-gray-300'}`}>
                    <img src={img} alt="color variant" className="w-10 h-10 object-cover" loading="lazy" decoding="async" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <p className="text-xs tracking-widest uppercase text-gray-600 mb-3">Select Size</p>
              <div className="flex flex-wrap gap-2 max-w-xs">
                {(product.sizes && product.sizes.length > 0 ? product.sizes : (product.size ? [product.size] : [])).map((s: string) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-[3rem] h-10 px-3 text-sm transition-all duration-300 border ${size===s ? 'bg-black text-white border-black' : 'border-gray-900 text-gray-900 hover:bg-black hover:text-white'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {size && (
                <p className="mt-3 text-sm text-gray-600">Selected size: {size}</p>
              )}
              <div className="mt-3">
                <button onClick={() => setShowSizeGuide(true)} className="text-sm text-gray-700 underline flex items-center gap-2 hover:text-hot-pink transition-colors">
                  <Ruler className="w-4 h-4" /> Size Guide
                </button>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs tracking-widest uppercase text-gray-600 mb-2">Check Delivery</p>
              <div className="flex gap-2 max-w-sm">
                <input value={pin} onChange={(e) => setPin(e.target.value)} className="border px-4 py-2 flex-1 min-w-0" placeholder="PIN code" />
                <button className="premium-button px-4 py-2 w-auto sm:w-[140px] flex-shrink-0" onClick={() => {
                  if (/^\d{6}$/.test(pin)) setPinMsg('Delivers in 3–5 days to your area'); else setPinMsg('Enter a valid 6-digit PIN');
                }}>Check</button>
              </div>
              {!!pinMsg && <p className="text-sm text-gray-700 mt-2">{pinMsg}</p>}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button onClick={() => { if (!size) { showToast('Please select a size', 'error'); return; } handleAdd(); }} className="premium-button inverse w-full sm:w-auto">Add to Bag</button>
              <button onClick={() => { 
                if (!size) { showToast('Please select a size', 'error'); return; } 
                const buyNowItem = { id: product.id || product._id, name: product.name, price: product.price, originalPrice: product.originalPrice, image: product.image, size: size ?? undefined, qty: 1 };
                navigate('/checkout', { state: { buyNowItem } }); 
              }} className="premium-button w-full sm:w-auto text-center">Buy Now</button>
              <button onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: product.name, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied');
                }
              }} className="text-gray-700 underline text-sm text-center py-2">Share</button>
            </div>

            <div className="mt-4 text-xs text-gray-700">
              <p>Free shipping over $100 • Easy 30-day returns</p>
            </div>

          </div>
        </div>

        <TrustBadges />

        <div className="mt-12 bg-rose-50 p-6 md:p-8 rounded-2xl border border-rose-100">
          <h3 className="font-serif text-xl md:text-2xl text-gray-800 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-hot-pink fill-current" /> Why We Love It
          </h3>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-6">
            This piece is designed with both style and comfort in mind. The {product.materials?.toLowerCase() || 'premium fabric'} ensures a soft touch against delicate skin, while the attention to detail in the {product.care?.toLowerCase().includes('hand') ? 'hand-finished' : 'high-quality'} construction guarantees it stands up to every adventure.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-white p-4 rounded shadow-sm">
              <Sparkles className="w-5 h-5 text-hot-pink" />
              <span className="text-sm font-medium text-gray-800">Premium Quality</span>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded shadow-sm">
              <Scissors className="w-5 h-5 text-hot-pink" />
              <span className="text-sm font-medium text-gray-800">Expertly Crafted</span>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded shadow-sm">
              <Star className="w-5 h-5 text-hot-pink" />
              <span className="text-sm font-medium text-gray-800">Top Rated</span>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <Accordion items={[
            { title: 'Details', content: product.description },
            { title: 'Fabric & Care', content: (
              <div>
                <p className="mb-2">{product.materials}</p>
                <p>{product.care}</p>
              </div>
            ) },
            { title: 'Shipping & Returns', content: (
              <div>
                <p>Ships in 2-3 business days. Free shipping over $100.</p>
                <p>30-day returns for unworn items with tags.</p>
              </div>
            ) },
          ]} />
        </div>

        <div className="mt-16">
          <h2 className="font-serif text-2xl mb-6 text-gray-800">Reviews</h2>
          <Reviews initialReviews={product.reviews} onSubmit={handleReviewSubmit} />
        </div>

        <SimilarProducts currentId={product.id} category={product.category} />
        
        <RecentlyViewed />
        
        <StickyBuyBar name={product.name} price={product.price} disabled={!size} onAdd={() => { if (!size) { showToast('Please select a size', 'error'); return; } handleAdd(); }} />

        {/* Size Guide Modal */}
        {showSizeGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white p-8 max-w-lg w-full rounded-lg shadow-xl relative animate-slideUp">
              <button 
                onClick={() => setShowSizeGuide(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="font-serif text-2xl mb-2 text-center">Size Guide</h3>
              <p className="text-center text-gray-500 text-sm mb-6">Find the perfect fit for your little one</p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                    <tr>
                      <th className="px-4 py-3">Size</th>
                      <th className="px-4 py-3">Height (cm)</th>
                      <th className="px-4 py-3">Chest (cm)</th>
                      <th className="px-4 py-3">Waist (cm)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr><td className="px-4 py-3 font-medium">7-8 Years</td><td className="px-4 py-3">122-128</td><td className="px-4 py-3">63-66</td><td className="px-4 py-3">57-59</td></tr>
                    <tr><td className="px-4 py-3 font-medium">9-10 Years</td><td className="px-4 py-3">134-140</td><td className="px-4 py-3">69-72</td><td className="px-4 py-3">61-63</td></tr>
                    <tr><td className="px-4 py-3 font-medium">11-12 Years</td><td className="px-4 py-3">146-152</td><td className="px-4 py-3">75-78</td><td className="px-4 py-3">65-67</td></tr>
                    <tr><td className="px-4 py-3 font-medium">12-13 Years</td><td className="px-4 py-3">152-158</td><td className="px-4 py-3">78-81</td><td className="px-4 py-3">67-69</td></tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 text-xs text-gray-500">
                <p className="font-medium mb-1">How to Measure:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>Height:</strong> Measure from the top of the head to the floor.</li>
                  <li><strong>Chest:</strong> Measure around the fullest part of the chest.</li>
                  <li><strong>Waist:</strong> Measure around the natural waistline.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
