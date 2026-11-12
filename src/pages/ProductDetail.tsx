import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [pin, setPin] = useState<string>('');
  const [pinMsg, setPinMsg] = useState<string>('');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const { addItem } = useCart();

  // ESC key to close size guide + lock body scroll when open
  useEffect(() => {
    if (!showSizeGuide) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSizeGuide(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [showSizeGuide]);
  const { showToast } = useToast();
  const { toggleWishlist, isWishlisted } = useProductContext();
  const reviewsCount = product?.reviews?.length || 0;
  const avgRating = reviewsCount > 0 
    ? (product.reviews ?? []).reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviewsCount
    : 0;

  const selectedVariant = product?.variants?.find((v: any) => {
    const colorMatch = !selectedColor || (v.attributes?.color || v.color) === selectedColor;
    const sizeMatch = !size || (v.attributes?.size || v.size) === size;
    return colorMatch && sizeMatch;
  });

  const displayPrice = selectedVariant?.price || product?.price;

  const totalStock = (() => {
    if (product?.variants && product.variants.length > 0) {
      return product.variants.reduce((a: any, b: any) => {
        const stock = b.stock?.quantity ?? b.inStock ?? 0;
        return a + Number(stock);
      }, 0);
    }
    return (Number(product?.inStock) || 0);
  })();
  
  const isOutOfStock = product && totalStock === 0;
  const selectedSizeStock = (() => {
    if (!size || !product) return 0;
    
    // 1. Check variants
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants.find((v: any) => {
        const sMatch = (v.attributes?.size || v.size)?.toLowerCase() === size.toLowerCase();
        const cMatch = !selectedColor || (v.attributes?.color || v.color) === selectedColor;
        return sMatch && cMatch;
      });
      if (variant) return Number(variant.stock?.quantity ?? variant.inStock ?? 0);
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
            images: (p.images && p.images.length > 0) 
              ? p.images 
              : [p.image, p.hoverImage, p.image3, p.image4].filter(Boolean),
            videos: [p.video, p.video2, p.video3].filter(Boolean),
            image: p.image || (p.images && p.images[0] ? p.images[0] : '')
          };
          setProduct(normalized);

          // Auto-select first color if available
          if (normalized.variants && normalized.variants.length > 0) {
            const firstColor = normalized.variants.find((v: any) => v.attributes?.color || v.color)?.attributes?.color || normalized.variants.find((v: any) => v.color)?.color;
            if (firstColor) setSelectedColor(firstColor);
          }
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
    addItem({ 
      id: product.id || product._id, 
      name: product.name, 
      price: displayPrice, 
      originalPrice: product.originalPrice, 
      image: (selectedVariant?.images && selectedVariant.images[0]) || product.image, 
      size: size ?? undefined,
      color: selectedColor ?? undefined,
      variantId: selectedVariant?._id || selectedVariant?.id,
      sku: selectedVariant?.sku || product.sku,
      selectedAttributes: selectedVariant?.attributes || {
        color: selectedColor,
        size: size
      }
    }, 1);
    showToast('Added to bag');
  };

  const handleReviewSubmit = async (formData: FormData) => {
    try {
      await productService.addReview(product._id || product.id, formData);
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
        ogImage={(selectedVariant?.images && selectedVariant.images[0]) || product.image}
        ogType="product"
        canonical={`https://www.ebscloset.com.au/product/${product.slug || product.id}`}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": (selectedVariant?.images && selectedVariant.images.length > 0) ? selectedVariant.images : (product.images || [product.image]),
            "description": product.description,
            "sku": selectedVariant?.sku || product.sku || product.id,
            "brand": {
              "@type": "Brand",
              "name": "EB's Closet"
            },
            "offers": {
              "@type": "Offer",
              "url": `https://www.ebscloset.com.au/product/${product.slug || product.id}`,
              "priceCurrency": "AUD",
              "price": displayPrice,
              "availability": isOutOfStock || isSelectedSizeOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
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
              images={(selectedVariant?.images && selectedVariant.images.length > 0) ? selectedVariant.images : (product.images ?? [])} 
              videos={product.videos ?? []}
              productName={product.name} 
              layout="grid"
            />
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            <div className="flex flex-col gap-2 mb-6">
              <span className="text-[10px] tracking-[0.4em] uppercase text-gray-400 font-semibold border-l-2 border-hot-pink pl-3 h-3 flex items-center">
                Eb's Closet Series No. {String(product.sku || '').slice(-3) || '062'}
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
              <span className="text-3xl font-light text-gray-900">{formatAUD(displayPrice)}</span>
              {isOutOfStock ? (
                <span className="bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm">
                  Sold Out
                </span>
              ) : isSelectedSizeOutOfStock ? (
                <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm">
                  Size Out of Stock
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
              <p className="text-[10px] tracking-[0.2em] uppercase text-gray-500 font-bold mb-4">Color / {selectedColor || product.color || 'Default'}</p>
              <div className="flex flex-wrap gap-4">
                {(() => {
                  const availableColors = Array.from(new Set([
                    ...(product.variants ? product.variants.map((v: any) => v.attributes?.color || v.color).filter(Boolean) : []),
                    ...(product.colors && product.colors.length > 0 ? product.colors : []),
                    ...(product.color ? [product.color] : [])
                  ])) as string[];

                  if (availableColors.length === 0) return <p className="text-xs text-gray-400 italic">No color options</p>;

                  return availableColors.map((c: string) => (
                    <button
                      key={c}
                      onClick={() => {
                        setSelectedColor(c);
                        // Reset size if it's not available in the new color
                        const variantsWithNewColor = product.variants?.filter((v: any) => (v.attributes?.color || v.color) === c);
                        const sizesForNewColor = variantsWithNewColor?.map((v: any) => v.attributes?.size || v.size);
                        if (size && sizesForNewColor && !sizesForNewColor.includes(size)) {
                          setSize(null);
                        }
                      }}
                      className={`px-4 py-2 border text-[10px] tracking-widest uppercase transition-all duration-300 ${
                        selectedColor === c 
                          ? 'bg-gray-900 text-white border-gray-900 font-bold' 
                          : 'border-gray-200 text-gray-400 hover:border-gray-400'
                      }`}
                    >
                      {c}
                    </button>
                  ));
                })()}
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
                  let availableSizes: string[] = [];
                  
                  if (selectedColor && product.variants && product.variants.length > 0) {
                    // Filter sizes by selected color
                    availableSizes = product.variants
                      .filter((v: any) => (v.attributes?.color || v.color) === selectedColor)
                      .map((v: any) => v.attributes?.size || v.size)
                      .filter(Boolean);
                  } else {
                    availableSizes = [
                      ...(product.sizes && product.sizes.length > 0 ? product.sizes : []),
                      ...(product.size ? [product.size] : []),
                      ...(product.variants ? product.variants.map((v: any) => v.attributes?.size || v.size).filter(Boolean) : [])
                    ];
                  }
                  
                  const uniqueSizes = Array.from(new Set(availableSizes)) as string[];
                  
                  if (uniqueSizes.length === 0) return <p className="text-xs text-gray-400 italic col-span-full">No sizes available for this color</p>;

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
                disabled={isOutOfStock || isSelectedSizeOutOfStock}
                onClick={() => { 
                  if (!size && (product.sizes?.length > 0 || product.variants?.some((v: any) => v.attributes?.size || v.size))) { 
                    showToast('Please select a size', 'error'); 
                    return; 
                  } 
                  handleAdd(); 
                }} 
                className="w-full h-16 bg-hot-pink text-white text-[10px] tracking-[0.3em] font-bold uppercase hover:opacity-90 transition-all duration-500 disabled:opacity-50"
              >
                Add to Bag — {formatAUD(displayPrice)}
              </button>
              <button 
                disabled={isOutOfStock || isSelectedSizeOutOfStock}
                onClick={() => { 
                  if (!size && (product.sizes?.length > 0 || product.variants?.some((v: any) => v.attributes?.size || v.size))) { 
                    showToast('Please select a size', 'error'); 
                    return; 
                  } 
                  handleAdd();
                  navigate('/checkout');
                }} 
                className="w-full h-16 bg-gray-900 text-white text-[10px] tracking-[0.3em] font-bold uppercase hover:opacity-90 transition-all duration-500 disabled:opacity-50"
              >
                Buy Now
              </button>
              {/* <button 
                onClick={() => toggleWishlist(product.id)}
                className="w-full h-16 border border-hot-pink text-hot-pink text-[10px] tracking-[0.3em] font-bold uppercase hover:bg-hot-pink hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isWishlisted(product.id) ? (
                  <>In Wishlist <Heart size={14} fill="currentColor" /></>
                ) : (
                  <>Add to Wishlist <Heart size={14} /></>
                )}
              </button> */}
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
          <Reviews productId={product._id || product.id} initialReviews={product.reviews || []} onSubmit={handleReviewSubmit} />
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

      {/* Size Guide Modal — rendered via portal to escape stacking contexts */}
      {showSizeGuide && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowSizeGuide(false); }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              position: 'relative',
              width: '100%',
              maxWidth: '520px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
            }}
          >
            <button
              onClick={() => setShowSizeGuide(false)}
              style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}
              aria-label="Close size guide"
            >
              <X style={{ width: '24px', height: '24px' }} />
            </button>

            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '22px', marginBottom: '4px', textAlign: 'center', paddingRight: '32px' }}>Size Guide</h3>
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>Find the perfect fit for your little one</p>

            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
              <table style={{ width: '100%', minWidth: '320px', fontSize: '14px', borderCollapse: 'collapse' as any }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    {['Size', 'Height (cm)', 'Chest (cm)', 'Waist (cm)'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left' as any, fontSize: '11px', textTransform: 'uppercase' as any, color: '#374151', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['7–8 Years',   '122–128', '63–66', '57–59'],
                    ['9–10 Years',  '134–140', '69–72', '61–63'],
                    ['11–12 Years', '146–152', '75–78', '65–67'],
                    ['12–13 Years', '152–158', '78–81', '67–69'],
                  ].map(([s, h, c, w], i) => (
                    <tr key={i} style={{ borderTop: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{s}</td>
                      <td style={{ padding: '10px 12px' }}>{h}</td>
                      <td style={{ padding: '10px 12px' }}>{c}</td>
                      <td style={{ padding: '10px 12px' }}>{w}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '20px', fontSize: '12px', color: '#6b7280' }}>
              <p style={{ fontWeight: 600, marginBottom: '6px' }}>How to Measure:</p>
              <ul style={{ paddingLeft: '16px', listStyleType: 'disc', lineHeight: '1.8' }}>
                <li><strong>Height:</strong> Measure from the top of the head to the floor.</li>
                <li><strong>Chest:</strong> Measure around the fullest part of the chest.</li>
                <li><strong>Waist:</strong> Measure around the natural waistline.</li>
              </ul>
            </div>
          </div>
        </div>,
        document.body
      )}
    </main>
  );
}
