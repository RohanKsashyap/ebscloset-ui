import { useState, useEffect, useMemo, useRef } from 'react';
import { ShoppingBag, Search, Menu, X, User } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loadNav, isAuthenticated } from '../utils/storage';
import { products as defaultProducts } from '../data/products';
import { loadProducts } from '../utils/storage';
import { useCart } from '../context/CartContext';

const defaultCategories = [
  { 
    name: 'New Arrivals', 
    href: '/arrivals',
    items: [
      { label: 'Latest Dresses', href: '/arrivals' },
      { label: "Editor's Picks", href: '/shop?tag=editors-pick' },
      { label: 'Trending Now', href: '/shop?sort=trending' }
    ] 
  },
  { 
    name: 'By Age', 
    href: '/age',
    items: [
      { label: 'Ages 7-8', href: '/shop?age=7-8' },
      { label: 'Ages 9-10', href: '/shop?age=9-10' },
      { label: 'Ages 11-12', href: '/shop?age=11-12' },
      { label: 'Ages 12-13', href: '/shop?age=12-13' }
    ] 
  },
  { 
    name: 'Occasions', 
    href: '/occasions',
    items: [
      { label: 'Birthday Parties', href: '/shop?occasion=birthday' },
      { label: 'School Dances', href: '/shop?occasion=dance' },
      { label: 'Holidays', href: '/shop?occasion=holiday' },
      { label: 'Everyday Magic', href: '/shop?occasion=everyday' }
    ] 
  },
  { 
    name: 'Styles', 
    href: '/styles',
    items: [
      { label: 'Princess Gowns', href: '/shop?style=princess' },
      { label: 'Sparkle Dresses', href: '/shop?style=sparkle' },
      { label: 'Floral Prints', href: '/shop?style=floral' },
      { label: 'Unicorn Dreams', href: '/shop?style=unicorn' }
    ] 
  },
  { name: 'Size Guide', href: '/size-guide', items: [] },
  { name: 'Parents', href: '/parents', items: [] },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { items } = useCart();
  const cartCount = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const shouldShowSolid = isScrolled || !isHomePage;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  

  const navigate = useNavigate();
  const catalog = useMemo(() => loadProducts(defaultProducts), []);
  const [expanded, setExpanded] = useState(false);
  const [q, setQ] = useState('');
  const panelRef = useRef<HTMLDivElement | null>(null);
  const results = useMemo(() => {
    const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return [];
    const within = catalog.filter((p: any) => {
      const text = `${p.name} ${p.description} ${p.materials ?? ''}`.toLowerCase();
      return tokens.every(t => text.includes(t));
    });
    return within.slice(0, 8);
  }, [q, catalog]);

  console.log(results);
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => { if ((e as any).key === 'Escape') setExpanded(false); };
    const onClick = (e: MouseEvent) => {
      const el = panelRef.current;
      if (el && !el.contains(e.target as Node)) setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick); };
  }, [expanded]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          shouldShowSolid
            ? 'bg-white shadow-md'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 transition-all duration-500">
          {/* Main Row */}
          <div className={`flex items-center justify-between transition-all duration-500 ${
            shouldShowSolid ? 'h-14 lg:h-16' : 'h-20'
          }`}>
            {/* Left Section: Menu (mobile)  */}
            <div className="flex-1 flex items-center space-x-4 lg:space-x-6">
              <button
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className={`w-6 h-6 ${shouldShowSolid ? 'text-black' : 'text-white'}`} />
              </button>

              <Link 
                to="/"
                className={`transition-colors duration-300 hidden lg:block ${shouldShowSolid ? 'text-black' : 'text-white hover:text-white/70'}`} 
              >
                {/* <img src="/logo.png" alt="Eb's Closet" className="h-14 w-auto object-contain" /> */}
              </Link>
            </div>

            {/* Center Section: Logo */}
            <div className="flex-none flex justify-center items-center h-full px-2">
              {shouldShowSolid ? (
                <Link to="/" className="font-serif tracking-widest text-xl lg:text-3xl text-hot-pink animate-fadeIn whitespace-nowrap">
                  EB'S CLOSET
                </Link>
              ) : (
                <div className="hidden lg:flex items-center space-x-8 xl:space-x-12 h-full">
                  {loadNav(defaultCategories).map((category) => (
                    <div
                      key={category.name}
                      className="relative h-full flex items-center"
                      onMouseEnter={() => setHoveredCategory(category.name)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <Link 
                        to={category.href || '#'}
                        className={`text-sm tracking-widest uppercase transition-colors duration-300 h-full flex items-center ${
                          location.pathname === category.href ? 'text-white' : 'text-white hover:text-white/70'
                        }`}
                      >
                        {category.name}
                      </Link>

                      {category.items.length > 0 && hoveredCategory === category.name && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                          <div className="bg-white shadow-2xl px-8 py-6 min-w-[200px] animate-fadeIn">
                            {category.items.map((item) => (
                              <Link
                                key={item.label}
                                to={item.href}
                                className="block w-full text-left py-2 text-sm text-gray-700 hover:text-hot-pink transition-colors duration-300"
                              >
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Section: Profile, Cart,Search */}
            <div className="flex-1 flex items-center justify-end space-x-4 lg:space-x-6">
              {expanded && (
                <div ref={panelRef} className="lg:flex items-stretch w-64 relative ">
                  <input 
                    autoFocus
                    value={q} 
                    onChange={(e) => setQ(e.target.value)} 
                    placeholder="Search..." 
                    className={`w-full px-4 py-1.5 rounded-full border focus:outline-none text-sm ${
                      shouldShowSolid ? 'bg-gray-100 border-transparent' : 'bg-white/20 border-white/30 text-white placeholder-white/70'
                    }`} 
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-hot-pink" onClick={() => {
                    navigate(`/shop?q=${encodeURIComponent(q)}`);
                    setExpanded(false);
                  }}>
                    <Search className="w-4 h-4" />
                  </button>

                  {/* Results Dropdown */}
                  {results.length > 0 && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-white shadow-2xl rounded-lg overflow-hidden border border-gray-100 animate-fadeIn z-[60]">
                      <div className="py-2">
                        {results.map((product: any) => (
                          <button
                            key={product._id || product.id}
                            className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                            onClick={() => {
                              navigate(`/product/${product._id || product.id}`);
                              setExpanded(false);
                              setQ('');
                            }}
                          >
                            <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                            <div className="ml-3 overflow-hidden">
                              <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                              <p className="text-xs text-gray-500">${product.price}</p>
                            </div>
                          </button>
                        ))}
                        <button
                          className="w-full py-2 text-center text-xs font-semibold text-hot-pink hover:bg-hot-pink/5 transition-colors"
                          onClick={() => {
                            navigate(`/shop?q=${encodeURIComponent(q)}`);
                            setExpanded(false);
                          }}
                        >
                          View All Results
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

{!expanded && (
                <button 
                  className={`transition-colors duration-300 ${shouldShowSolid ? 'text-black hover:text-hot-pink' : 'text-white hover:text-white/70'}`}
                  onClick={() => setExpanded(true)}
                >
                  <Search className="w-5 h-5 lg:w-6 lg:h-6" />
                </button>
              )}

              <button 
                className={`transition-colors duration-300 ${shouldShowSolid ? 'text-black hover:text-hot-pink' : 'text-white hover:text-white/70'}`}
                onClick={() => navigate(isAuthenticated() ? '/dashboard' : '/login')}
              >
                <User className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>

              <button 
                className={`relative transition-colors duration-300 ${shouldShowSolid ? 'text-black hover:text-hot-pink' : 'text-white hover:text-white/70'}`} 
                onClick={() => navigate('/cart')}
              >
                <ShoppingBag className="w-5 h-5 lg:w-6 lg:h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-hot-pink text-white text-[10px] w-4 h-4 lg:w-5 lg:h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Secondary Row: Links (Visible only when scrolled/solid) */}
          <div className={`hidden lg:flex justify-center transition-all duration-500 ${
            shouldShowSolid ? 'h-7 border-t border-gray-50 overflow-visible' : 'h-0 overflow-hidden'
          }`}>
            <div className="flex items-center space-x-8 xl:space-x-12 h-full">
              {loadNav(defaultCategories).map((category) => (
                <div
                  key={category.name}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => setHoveredCategory(category.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Link
                    to={category.href || '#'}
                    className={`text-[13px] tracking-[0.15em] uppercase transition-colors duration-300 h-full flex items-center ${
                      location.pathname === category.href ? 'text-hot-pink font-semibold' : 'text-black hover:text-hot-pink'
                    }`}
                  >
                    {category.name}
                  </Link>

                  {category.items.length > 0 && hoveredCategory === category.name && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                      <div className="bg-white shadow-2xl px-8 py-6 min-w-[200px] animate-fadeIn border-t">
                        {category.items.map((item) => (
                          <Link
                            key={item.label}
                            to={item.href}
                            className="block w-full text-left py-2 text-sm text-gray-700 hover:text-hot-pink transition-colors duration-300"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </nav>

      

      {/* Mobile menu */}

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-4/5 max-w-sm bg-white shadow-2xl animate-slideInLeft h-full flex flex-col">
            <div className="p-6 flex-shrink-0 flex items-center justify-between border-b">
              <Link to="/" className="font-serif text-xl text-hot-pink" onClick={() => setIsMobileMenuOpen(false)}>
                <img src="/logo.png" alt="Eb's Closet" className="h-8 w-auto object-contain" />
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-6 space-y-8" style={{ touchAction: 'pan-y' }}>
              <div className="space-y-6">
                {loadNav(defaultCategories).map((category) => (
                  <div key={category.name}>
                    <Link 
                      to={category.href} 
                      className="block text-sm tracking-[0.2em] uppercase text-gray-900 font-semibold mb-4"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                    {category.items.length > 0 && (
                      <div className="pl-2 space-y-4 border-l border-gray-100 ml-1">
                        {category.items.map((item) => (
                          <Link
                            key={item.label}
                            to={item.href}
                            className="block text-[13px] text-gray-500 hover:text-hot-pink transition-colors duration-300"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t space-y-6">
                <Link 
                  to={isAuthenticated() ? "/dashboard" : "/login"} 
                  className="flex items-center space-x-4 text-gray-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm uppercase tracking-widest">My Account</span>
                </Link>
                <Link 
                  to="/cart" 
                  className="flex items-center space-x-4 text-gray-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span className="text-sm uppercase tracking-widest">Shopping Bag ({cartCount})</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </>
  );
}
