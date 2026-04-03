import { useMemo, useState, useEffect } from 'react';
import { loadSite, type SiteSettings, loadProducts } from '../utils/storage';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { productService, type Category } from '../services/productService';
import { useProductContext } from '../context/ProductContext';
import { Heart, SlidersHorizontal, X } from 'lucide-react';
import { formatAUD } from '../utils/storage';
import { products as defaultProducts } from '../data/products';
import { getOptimizedUrl } from '../utils/imageKit';
import SEO from '../components/SEO';

export default function Shop() {
  const [age, setAge] = useState<string>('All');
  const [color, setColor] = useState<string>('All');
  const [type, setType] = useState<string>('All');
  const [occasion, setOccasion] = useState<string>('All');
  const [size, setSize] = useState<string>('All');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [q, setQ] = useState('');
  const [hoverId, setHoverId] = useState<number | string | null>(null);
  const [products, setProducts] = useState<Array<any>>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const { toggleWishlist, isWishlisted } = useProductContext();

  const updateParams = (key: string, value: string) => {
    const sp = new URLSearchParams(location.search);
    if (value === 'All' || !value) sp.delete(key);
    else sp.set(key, value);
    navigate({ search: sp.toString() }, { replace: true });
  };

  useEffect(() => {
    // Fetch categories
    productService.getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const b = sp.get('budget');
    if (b) {
      const fallback: SiteSettings = { hero: {} as any, editorial: {} as any, collections: [], footerGroups: [], social: [], newsletter: { heading: '', subtext: '' }, legalLabels: { privacy: '', terms: '', cookies: '' }, infoPages: {}, budgets: [] };
      const site = loadSite(fallback);
      const match = (site.budgets ?? []).find((x) => x.slug === b);
      if (match) { setMinPrice(match.min); setMaxPrice(match.max); }
      else {
        if (b === 'under20') { setMinPrice(0); setMaxPrice(2000); }
        else if (b === 'under40') { setMinPrice(0); setMaxPrice(4000); }
        else if (b === 'under60') { setMinPrice(0); setMaxPrice(6000); }
        else if (b === '60-80') { setMinPrice(6000); setMaxPrice(8000); }
        else if (b === '80-100') { setMinPrice(8000); setMaxPrice(10000); }
        else if (b === '100plus') { setMinPrice(10000); setMaxPrice(1000000); }
      }
    }
    const qParam = sp.get('q');
    setQ(qParam || '');
    const tParam = sp.get('type');
    setType(tParam || 'All');
    const ageParam = sp.get('age');
    setAge(ageParam || 'All');
    const occParam = sp.get('occasion');
    setOccasion(occParam || 'All');
    const colorParam = sp.get('color');
    setColor(colorParam || 'All');
    const sizeParam = sp.get('size');
    setSize(sizeParam || 'All');
  }, [location.search]);

  useEffect(() => {
    const filters: Record<string, any> = {};
    if (age !== 'All') filters.age = age;
    if (color !== 'All') filters.color = color;
    if (type !== 'All') filters.type = type;
    if (occasion !== 'All') filters.occasion = occasion;
    if (size !== 'All') filters.size = size;
    if (q) filters.q = q;
    filters.minPrice = minPrice;
    filters.maxPrice = maxPrice;
    setLoading(true);
    setError(null);
    productService.getAllProducts(filters)
      .then((list) => setProducts(list))
      .catch(() => {
        setError(null);
        setProducts(loadProducts(defaultProducts));
      })
      .finally(() => setLoading(false));
  }, [age, color, type, occasion, size, minPrice, maxPrice, q]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const priceVal = p.price;
      if (priceVal < minPrice || priceVal > maxPrice) return false;
      if (age !== 'All' && !(p.category ?? '').includes(age)) return false;
      if (color !== 'All' && (p.color ?? '').toLowerCase() !== color.toLowerCase()) return false;
      
      if (type !== 'All') {
        const catName = p.categoryId?.name || p.category || '';
        if (catName.toLowerCase() !== type.toLowerCase()) return false;
      }

      if (occasion !== 'All' && (p.occasion ?? '').toLowerCase() !== occasion.toLowerCase()) return false;
      if (size !== 'All' && !(p.sizes ?? []).includes(size)) return false;
      if (q) {
        const text = `${p.name} ${p.description} ${p.materials ?? ''}`.toLowerCase();
        const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
        if (!tokens.every(t => text.includes(t))) return false;
      }
      return true;
    });
  }, [age, color, type, occasion, size, minPrice, maxPrice, q, products]);


  return (
    <main className="bg-white pt-32 pb-24">
      <SEO 
        title={`${type !== 'All' ? type : 'Shop All'} Dresses`}
        description={`Explore our collection of ${type !== 'All' ? type.toLowerCase() : 'beautiful'} dresses for girls aged 7-13. Find the perfect outfit for any occasion at EB's Closet.`}
        canonical="https://www.ebscloset.com.au/shop"
      />
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
        {/* Breadcrumbs & Header */}
        <div className="mb-12">
          <nav className="flex items-center space-x-2 text-xs text-gray-400 mb-6 uppercase tracking-widest">
            <Link to="/" className="hover:text-black">Home</Link>
            <span>/</span>
            <span className="text-black">Shop</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Collection</h1>
              <p className="text-gray-500 max-w-xl text-sm md:text-base leading-relaxed">
                A curated selection of premium dresses for girls, designed for every magical moment and timeless style.
              </p>
            </div>
            <div className="flex items-center justify-between md:justify-end gap-4 border-b border-gray-100 pb-4 md:pb-0 md:border-none">
              <button 
                onClick={() => setIsFilterDrawerOpen(true)}
                className="lg:hidden flex items-center gap-2 text-xs uppercase tracking-widest font-bold border px-4 py-2 rounded-full hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>
              <div className="flex items-center gap-8">
                <span className="hidden sm:inline text-sm text-gray-400">{filtered.length} Products</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-gray-400">Sort by:</span>
                  <select className="text-sm font-medium bg-transparent focus:outline-none cursor-pointer">
                    <option>Newest</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Best Selling</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Mobile Filter Drawer Backdrop */}
          {isFilterDrawerOpen && (
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
              onClick={() => setIsFilterDrawerOpen(false)}
            />
          )}

          {/* Sidebar Filters (Desktop) & Drawer (Mobile) */}
          <aside className={`
            fixed lg:sticky top-0 lg:top-32 left-0 z-[70] lg:z-10
            h-full lg:h-fit max-h-screen lg:max-h-[calc(100vh-160px)]
            w-[280px] lg:w-64 bg-white lg:bg-transparent
            transform ${isFilterDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            transition-transform duration-300 ease-in-out
            flex flex-col
          `}>
            {/* Drawer Header (Mobile Only) */}
            <div className="flex lg:hidden items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">Filters</h2>
              <button onClick={() => setIsFilterDrawerOpen(false)}>
                <X size={24} />
              </button>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-0 lg:pr-2 custom-scrollbar space-y-10">
              {/* Search */}
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold mb-4 text-gray-900">Search</h3>
                <div className="relative">
                  <input 
                    value={q} 
                    onChange={(e) => updateParams('q', e.target.value)} 
                    placeholder="Find something..." 
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-hot-pink/20 transition-all"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold mb-4 text-gray-900">Categories</h3>
                <div className="space-y-3">
                  <label key="All" className="flex items-center group cursor-pointer">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="radio" 
                        name="type" 
                        checked={type === 'All'} 
                        onChange={() => updateParams('type', 'All')}
                        className="peer appearance-none w-5 h-5 border-2 border-gray-200 rounded-full checked:border-hot-pink transition-all"
                      />
                      <div className="absolute w-2.5 h-2.5 rounded-full bg-hot-pink scale-0 peer-checked:scale-100 transition-transform" />
                    </div>
                    <span className={`ml-3 text-sm transition-colors ${type === 'All' ? 'text-black font-medium' : 'text-gray-500 group-hover:text-black'}`}>
                      All
                    </span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat._id} className="flex items-center group cursor-pointer">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="radio" 
                          name="type" 
                          checked={type === cat.name} 
                          onChange={() => updateParams('type', cat.name)}
                          className="peer appearance-none w-5 h-5 border-2 border-gray-200 rounded-full checked:border-hot-pink transition-all"
                        />
                        <div className="absolute w-2.5 h-2.5 rounded-full bg-hot-pink scale-0 peer-checked:scale-100 transition-transform" />
                      </div>
                      <span className={`ml-3 text-sm transition-colors ${type === cat.name ? 'text-black font-medium' : 'text-gray-500 group-hover:text-black'}`}>
                        {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold mb-4 text-gray-900">Size</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['7-8', '9-10', '11-12', '12-13'].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateParams('size', size === s ? 'All' : s)}
                      className={`py-2 text-xs border rounded-lg transition-all ${
                        size === s 
                          ? 'bg-hot-pink border-hot-pink text-white shadow-lg shadow-hot-pink/20' 
                          : 'border-gray-100 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold mb-4 text-gray-900">Color</h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { name: 'Pink', class: 'bg-pink-400' },
                    { name: 'Lavender', class: 'bg-purple-300' },
                    { name: 'Sky Blue', class: 'bg-sky-300' },
                    { name: 'Red', class: 'bg-red-500' },
                    { name: 'White', class: 'bg-white border' }
                  ].map((c) => (
                    <button
                      key={c.name}
                      onClick={() => updateParams('color', color === c.name ? 'All' : c.name)}
                      title={c.name}
                      className={`w-8 h-8 rounded-full ${c.class} transition-all relative ${
                        color === c.name ? 'ring-2 ring-hot-pink ring-offset-2 scale-110' : 'hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold mb-4 text-gray-900">Price Range</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
                    <span>{formatAUD(minPrice)}</span>
                    <span>{formatAUD(maxPrice)}</span>
                  </div>
                  <div className="relative h-2 bg-gray-100 rounded-full">
                    <input 
                      type="range" 
                      min={0} 
                      max={100000} 
                      step={100}
                      value={maxPrice} 
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-hot-pink [&::-webkit-slider-thumb]:shadow-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer (Buttons) */}
            <div className="p-6 border-t bg-white lg:bg-transparent lg:p-0 lg:border-none lg:mt-6">
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="w-full py-4 bg-hot-pink text-white rounded-xl text-sm font-bold hover:bg-hot-pink/90 transition-all shadow-lg shadow-hot-pink/20 uppercase tracking-widest"
                >
                  Apply Filters
                </button>
                <button 
                  onClick={() => {
                    setAge('All'); setColor('All'); setType('All'); setOccasion('All'); setSize('All'); setMinPrice(0); setMaxPrice(100000); setQ('');
                    navigate('/shop');
                    setIsFilterDrawerOpen(false);
                  }}
                  className="w-full py-2 text-sm text-gray-400 hover:text-hot-pink transition-colors uppercase tracking-widest"
                >
                  Clear All
                </button>
              </div>
            </div>
          </aside>

          {/* Product Grid Container */}
          <div className="flex-1">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-8 md:gap-y-12">
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="space-y-4">
                    <div className="aspect-[3/4] bg-gray-50 rounded-3xl animate-pulse" />
                    <div className="h-4 bg-gray-50 rounded w-2/3 animate-pulse" />
                    <div className="h-4 bg-gray-50 rounded w-1/3 animate-pulse" />
                  </div>
                ))
              ) : error ? (
                <div className="col-span-full py-20 text-center text-gray-400">{error}</div>
              ) : filtered.length === 0 ? (
                <div className="col-span-full py-20 text-center">
                  <p className="text-gray-400 mb-4">No products found matching your criteria.</p>
                  <button onClick={() => navigate('/shop')} className="text-hot-pink font-bold underline">Reset all filters</button>
                </div>
              ) : (
                filtered.map((p, idx) => {
                  const productId = p._id || p.id;
                  return (
                    <div key={`${productId}-${idx}`} className="group relative">
                      {/* Image Card */}
                      <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-gray-50 mb-6 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-hot-pink/5">
                        <Link to={`/product/${productId}`}>
                          <img 
                            src={getOptimizedUrl(hoverId === productId && p.images?.[1] ? p.images[1] : p.image, 400)} 
                            alt={p.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onMouseEnter={() => setHoverId(productId)}
                            onMouseLeave={() => setHoverId(null)}
                            loading="lazy"
                            decoding="async"
                          />
                        </Link>
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          {idx < 3 && (
                            <span className="bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full text-black shadow-sm">
                              New Arrival
                            </span>
                          )}
                          {p.price < 1000 && (
                            <span className="bg-hot-pink text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg shadow-hot-pink/20">
                              Sale
                            </span>
                          )}
                        </div>

                        {/* Wishlist */}
                        <button
                          onClick={() => toggleWishlist(productId)}
                          className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all duration-300 ${
                            isWishlisted(productId) 
                              ? 'bg-hot-pink text-white scale-110' 
                              : 'bg-white/80 text-gray-900 hover:bg-white'
                          }`}
                        >
                          <Heart size={18} fill={isWishlisted(productId) ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="space-y-1 px-2">
                        <div className="flex flex-col gap-1">
                          <h3 className="text-sm md:text-base font-bold text-gray-900 group-hover:text-hot-pink transition-colors line-clamp-1">
                            {p.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm md:text-base font-bold text-hot-pink whitespace-nowrap">
                              {formatAUD(p.price)}
                            </span>
                            {p.originalPrice && (
                              <span className="text-xs md:text-sm text-gray-400 line-through decoration-hot-pink/20 whitespace-nowrap">
                                {formatAUD(p.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">{p.type || 'Classic Collection'}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination/Load More */}
            {!loading && filtered.length > 0 && (
              <div className="mt-24 text-center space-y-6">
                <button className="px-10 py-4 border-2 border-gray-100 rounded-2xl text-sm font-bold hover:border-hot-pink hover:text-hot-pink transition-all">
                  Load More Products
                </button>
                <div className="max-w-xs mx-auto space-y-2">
                  <p className="text-xs text-gray-400 font-medium">Showing {filtered.length} of {products.length} products</p>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-hot-pink transition-all duration-1000" 
                      style={{ width: `${(filtered.length / products.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
