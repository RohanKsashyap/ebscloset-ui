import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import Gallery from '../components/Gallery';
import Reviews from '../components/Reviews';
import SimilarProducts from '../components/SimilarProducts';
import RecentlyViewed from '../components/RecentlyViewed';
import TrustBadges from '../components/TrustBadges';
import Accordion from '../components/Accordion';
import StickyBuyBar from '../components/StickyBuyBar';
import { Star, Sparkles, Scissors, Ruler, X, Heart, Truck, RefreshCw } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { productService } from '../services/productService';
import { useProductContext } from '../context/ProductContext';
import { formatAUD } from '../utils/storage';
import SEO from '../components/SEO';
import { Helmet } from 'react-helmet-async';

export default function ProductDetail() {
  const { slug } = useParams();
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

  const totalStock = (() => {
    if (product?.variants && product.variants.length > 0) {
      return product.variants.reduce((a: any, b: any) => a + (Number(b.inStock) || 0), 0);
    }
    if (product?.stock && Object.keys(product.stock).length > 0) {
      return Object.values(product.stock).reduce((a: any, b: any) => a + (Number(b) || 0), 0);
    }
    return (Number(product?.inStock) || 0);
  })();
  
  const isOutOfStock = product && totalStock === 0;
  const selectedSizeStock = (() => {
    if (!size || !product) return 0;
    
    // 1. Check variants
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants.find((v: any) => v.size?.toLowerCase() === size.toLowerCase());
      if (variant) return Number(variant.inStock) || 0;
    }
    
    // 2. Check stock object (case-insensitive)
    if (product.stock) {
      const stockKey = Object.keys(product.stock).find(k => k.toLowerCase() === size.toLowerCase());
      if (stockKey) return Number(product.stock[stockKey]) || 0;
    }
    
    // 3. Fallback to inStock if size matches legacy size
    if (product.size?.toLowerCase() === size.toLowerCase()) {
      return Number(product.inStock) || 0;
    }

    // 4. Fallback to inStock if size is in sizes array
    if (product.sizes && product.sizes.some((s: string) => s.toLowerCase() === size.toLowerCase())) {
      return Number(product.inStock) || 0;
    }

    return 0;
  })();
  const isSelectedSizeOutOfStock = size ? selectedSizeStock === 0 : false;

  useEffect(() => {
    setLoading(true);
    productService.getProduct(String(slug))
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
  }, [slug]);

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
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl mb-6 text-hot-pink">Loading</h1>
          <p className="text-sm tracking-[0.3em] uppercase text-rose-gold">Please wait</p>
        </section>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="bg-white">
        <section className="py-24 px-6 lg:px-12 max-w-screen-2xl mx-auto text-center">
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl mb-6 text-hot-pink">Product Not Found</h1>
          <p className="text-sm tracking-[0.3em] uppercase text-rose-gold">Please return to the shop</p>
          <Link to="/shop" className="inline-block mt-8 border-2 border-hot-pink text-hot-pink px-10 py-4 text-sm tracking-widest uppercase hover:bg-hot-pink hover:text-white transition-all duration-500">Back to Shop</Link>
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
      <SEO 
        title={product.name}
        description={product.description?.substring(0, 160)}
        ogImage={product.image}
        ogType="product"
        canonical={`https://www.ebscloset.com.au/product/${product.slug || product.id}`}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": product.images || [product.image],
            "description": product.description,
            "sku": product.sku || product.id,
            "brand": {
              "@type": "Brand",
              "name": "EB's Closet"
            },
            "offers": {
              "@type": "Offer",
              "url": `https://www.ebscloset.com.au/product/${product.slug || product.id}`,
              "priceCurrency": "AUD",
              "price": product.price,
              "availability": "https://schema.org/InStock",
              "itemCondition": "https://schema.org/NewCondition"
            },
            "aggregateRating": reviewsCount > 0 ? {
              "@type": "AggregateRating",
              "ratingValue": avgRating,
              "reviewCount": reviewsCount
            } : undefined
          })}
        </script>
      </Helmet>

      {/* Main Product Section */}
      <section className="pt-24 pb-20 md:pt-32 px-4 sm:px-6 lg:px-12 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Gallery */}
          <div className="lg:sticky lg:top-32 h-fit">
            <Gallery 
              images={product.images ?? []} 
              productName={product.name} 
              layout="grid"
            />
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            <div className="flex flex-col gap-2 mb-6">
              <span className="text-[10px] tracking-[0.4em] uppercase text-gray-400 font-semibold border-l-2 border-hot-pink pl-3 h-3 flex items-center">
                Atelier Series No. {String(product.sku || '').slice(-3) || '062'}
              </span>
              <h1 className="font-headline text-5xl md:text-6xl lg:text-7xl text-gray-900 leading-[1.05] tracking-tight uppercase">
                {(() => {
                  const name = String(product.name || '');
                  const parts = name.split(' ');
                  if (parts.length > 1) {
                    return (
                      <>
                        {parts[0]} <span className="italic text-hot-pink font-light">{parts[1]}</span> {parts.slice(2).join(' ')}
                      </>
                    );
                  }
                  return name;
                })()}
              </h1>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-light text-gray-900">{formatAUD(product.price)}</span>
              {isOutOfStock ? (
                <span className="bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm">
                  Sold Out
                </span>
              ) : (
                <span className="bg-hot-pink text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm">
                  In Stock
                </span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-10 text-lg max-w-xl font-light">
              {product.description}
            </p>

            {/* Colors */}
            <div className="mb-8">
              <p className="text-[10px] tracking-[0.2em] uppercase text-gray-500 font-bold mb-4">Color / {product.color || 'Charcoal Black'}</p>
              <div className="flex gap-4">
                <button className="w-8 h-8 rounded-full bg-gray-900 ring-2 ring-offset-2 ring-gray-900" />
                <button className="w-8 h-8 rounded-full bg-gray-300 ring-1 ring-gray-200" />
                <button className="w-8 h-8 rounded-full bg-[#1a2b3c] ring-1 ring-[#1a2b3c]" />
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-10">
              <div className="flex justify-between items-end mb-4">
                <p className="text-[10px] tracking-[0.2em] uppercase text-gray-500 font-bold">Size Selection</p>
                <button onClick={() => setShowSizeGuide(true)} className="text-[10px] tracking-widest uppercase text-gray-900 underline font-bold">Size Chart</button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {(() => {
                  const availableSizes = [
                    ...(product.sizes && product.sizes.length > 0 ? product.sizes : []),
                    ...(product.size ? [product.size] : []),
                    ...(product.variants ? product.variants.map((v: any) => v.size).filter(Boolean) : [])
                  ];
                  const uniqueSizes = Array.from(new Set(availableSizes)) as string[];
                  
                  return uniqueSizes.map((s: string) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`h-14 border text-sm transition-all duration-300 ${
                        size === s 
                          ? 'bg-hot-pink text-white border-hot-pink font-bold' 
                          : 'border-gray-100 text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      {s}
                    </button>
                  ));
                })()}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 mb-12">
              <button 
                disabled={isOutOfStock || (size ? isSelectedSizeOutOfStock : false)}
                onClick={() => { if (!size) { showToast('Please select a size', 'error'); return; } handleAdd(); }} 
                className="w-full h-16 bg-hot-pink text-white text-[10px] tracking-[0.3em] font-bold uppercase hover:opacity-90 transition-all duration-500 disabled:opacity-50"
              >
                Add to Bag — {formatAUD(product.price)}
              </button>
              <button 
                disabled={isOutOfStock || (size ? isSelectedSizeOutOfStock : false)}
                onClick={() => { 
                  if (!size) { showToast('Please select a size', 'error'); return; } 
                  handleAdd();
                  navigate('/checkout');
                }} 
                className="w-full h-16 bg-gray-900 text-white text-[10px] tracking-[0.3em] font-bold uppercase hover:opacity-90 transition-all duration-500 disabled:opacity-50"
              >
                Buy Now
              </button>
              <button 
                onClick={() => toggleWishlist(product.id)}
                className="w-full h-16 border border-hot-pink text-hot-pink text-[10px] tracking-[0.3em] font-bold uppercase hover:bg-hot-pink hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isWishlisted(product.id) ? (
                  <>In Wishlist <Heart size={14} fill="currentColor" /></>
                ) : (
                  <>Add to Wishlist <Heart size={14} /></>
                )}
              </button>
            </div>

            {/* Service Icons */}
            <div className="grid grid-cols-2 gap-8 border-t border-gray-100 pt-8">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-hot-pink" />
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase mb-1">Global Courier</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Complimentary</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-hot-pink" />
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase mb-1">Exchanges</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-tighter">30-Day Window</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curation of Comfort Section */}
      <section className="bg-[#FAF9F6] text-gray-900 py-24 px-4 sm:px-6 lg:px-12 border-y border-gray-100">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-headline text-5xl md:text-6xl lg:text-7xl leading-none mb-8">
              THE <span className="text-hot-pink">CURATION</span> OF COMFORT
            </h2>
            <p className="text-gray-600 text-lg md:text-xl font-light leading-relaxed max-w-md">
              A dialogue between artisanal heritage and modern wearability. Every stitch is a testament to our commitment to luxury.
            </p>
          </div>
          <div className="space-y-12">
            {[
              { label: 'FABRICATION', text: 'Masterful blend of 70% Virgin Wool and 30% Grade-A Mongolian Cashmere. Sourced from sustainable heritage mills.' },
              { label: 'ARCHITECTURE', text: "Silk-viscose lining featuring our signature 'Cloud Stitch' for frictionless layering and superior breathability." },
              { label: 'FINISHING', text: 'Double-breasted tailored closure. Hand-polished horn buttons. Reinforced welt pockets.' }
            ].map((item, idx) => (
              <div key={idx} className="border-l border-hot-pink/30 pl-8">
                <p className="text-[10px] tracking-[0.3em] text-hot-pink font-bold mb-4 uppercase">{item.label}</p>
                <p className="text-gray-600 font-light leading-relaxed uppercase text-sm tracking-widest">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Voices Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-12 max-w-screen-2xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <h2 className="font-headline text-5xl md:text-6xl mb-4 uppercase">
              COMMUNITY <span className="text-hot-pink italic font-light">VOICES</span>
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex text-hot-pink">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < 4.9 ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-bold">
                {avgRating.toFixed(1)} BASED ON {reviewsCount} ATELIER REVIEWS
              </span>
            </div>
          </div>
          <button 
            onClick={() => {
              const el = document.getElementById('reviews-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-12 py-5 bg-hot-pink text-white text-[10px] tracking-[0.3em] font-bold uppercase hover:bg-gray-900 transition-all duration-500"
          >
            Write Review
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {(product.reviews ?? []).slice(0, 3).map((r: any, idx: number) => (
            <div key={idx} className="border-l-4 border-hot-pink/20 pl-8 py-4">
               <div className="flex text-gray-900 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} fill={i < r.rating ? 'currentColor' : 'none'} />
                ))}
              </div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-bold mb-4">VERIFIED ATELIER BUYER</p>
              <h3 className="font-headline text-2xl mb-4 italic uppercase">"{r.comment.split(' ').slice(0,2).join(' ')}"</h3>
              <p className="text-gray-500 font-light leading-relaxed mb-8 uppercase text-xs tracking-widest">
                {r.comment}
              </p>
              <p className="text-[10px] tracking-[0.3em] uppercase text-gray-900 font-bold">
                {r.name} — {r.location || 'LONDON, UK'}
              </p>
            </div>
          ))}
        </div>
        
        <div id="reviews-section">
          <Reviews initialReviews={product.reviews || []} onSubmit={handleReviewSubmit} />
        </div>
      </section>

      {/* Complete the Look Section */}
      <section className="py-24 bg-gray-50 px-4 sm:px-6 lg:px-12 overflow-hidden">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex justify-between items-end mb-16">
             <h2 className="font-headline text-5xl md:text-6xl uppercase leading-none">
              COMPLETE THE <br /><span className="text-hot-pink italic font-light">LOOK</span>
            </h2>
          </div>
          
          <SimilarProducts 
            currentId={product.id || product._id} 
            categoryId={product.categoryId?._id || (typeof product.categoryId === 'string' ? product.categoryId : undefined)} 
            categoryName={product.categoryId?.name || (typeof product.categoryId === 'string' ? undefined : product.category)} 
          />
        </div>
      </section>

      <div className="py-12">
        <RecentlyViewed />
      </div>

      <StickyBuyBar 
        name={product.name} 
        price={product.price} 
        disabled={!size || isSelectedSizeOutOfStock || isOutOfStock} 
        onAdd={() => { if (!size) { showToast('Please select a size', 'error'); return; } handleAdd(); }} 
        onBuyNow={() => { 
          if (!size) { showToast('Please select a size', 'error'); return; } 
          handleAdd(); 
          navigate('/checkout');
        }}
      />

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
            
            <h3 className="font-headline text-2xl mb-2 text-center">Size Guide</h3>
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
    </main>
  );
}
