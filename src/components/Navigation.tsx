import { useState, useEffect, useMemo, useRef } from 'react';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { loadNav } from '../utils/storage';
import { useProductContext } from '../context/ProductContext';

const defaultCategories = [
  { name: 'New Arrivals', items: ['Latest Dresses', 'Editor\'s Picks', 'Trending Now'] },
  { name: 'By Age', items: ['Ages 7-8', 'Ages 9-10', 'Ages 11-12', 'Ages 12-13'] },
  { name: 'Occasions', items: ['Birthday Parties', 'School Dances', 'Holidays', 'Everyday Magic'] },
  { name: 'Styles', items: ['Princess Gowns', 'Sparkle Dresses', 'Floral Prints', 'Unicorn Dreams'] },
  { name: 'Size Guide', items: [] },
  { name: 'Parents', items: [] },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [mobileSearchExpanded, setMobileSearchExpanded] = useState(false);
  const [q, setQ] = useState('');
  const panelRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchRef = useRef<HTMLDivElement | null>(null);
  const { products: catalog } = useProductContext();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigate = useNavigate();
  const results = useMemo(() => {
    const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return [];
    const within = catalog.filter((p) => {
      const text = `${p.name} ${p.description} ${p.materials ?? ''}`.toLowerCase();
      return tokens.every(t => text.includes(t));
    });
    return within.slice(0, 8);
  }, [q, catalog]);

  useEffect(() => {
    if (!expanded && !mobileSearchExpanded) return;
    const onKey = (e: KeyboardEvent) => { 
      if ((e as any).key === 'Escape') {
        setExpanded(false);
        setMobileSearchExpanded(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      const el = panelRef.current;
      const mobileEl = mobileSearchRef.current;
      if (el && !el.contains(e.target as Node)) setExpanded(false);
      if (mobileEl && !mobileEl.contains(e.target as Node)) setMobileSearchExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => { 
      window.removeEventListener('keydown', onKey); 
      document.removeEventListener('mousedown', onClick); 
    };
  }, [expanded, mobileSearchExpanded]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          isScrolled
            ? 'bg-white shadow-sm py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between">
            <button
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6 text-black" />
            </button>

            {isScrolled && (
              <div className="absolute left-1/2 -translate-x-1/2 transition-all duration-700 text-2xl lg:text-3xl">
                <Link to="/" className="font-serif tracking-wider text-hot-pink">
                  EB'S CLOSET
                </Link>
              </div>
            )}

            <div className={`hidden lg:flex items-center space-x-8 xl:space-x-12 absolute left-1/2 -translate-x-1/2 transition-all duration-700 ${
              isScrolled ? 'top-16' : 'top-6'
            }`}>
              {loadNav(defaultCategories).map((category) => (
                <div
                  key={category.name}
                  className="relative"
                  onMouseEnter={() => setHoveredCategory(category.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <button className="text-sm tracking-widest uppercase text-gray-800 hover:text-hot-pink transition-colors duration-300">
                    {category.name}
                  </button>

                  {category.items.length > 0 && hoveredCategory === category.name && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-8">
                      <div className="bg-white shadow-2xl px-8 py-6 min-w-[200px] animate-fadeIn">
                        {category.items.map((item) => (
                          <Link
                            key={item}
                            to={
                              category.name === 'New Arrivals' ? '/arrivals' :
                              category.name === 'By Age' ? '/age' :
                              category.name === 'Occasions' ? '/occasions' :
                              category.name === 'Styles' ? '/styles' :
                              category.name === 'Party Dresses' ? '/party' :
                              category.name === 'Casual Dresses' ? '/casual' :
                              category.name === 'Seasonal Dresses' ? '/seasonal' :
                              category.name === 'Special Occasion' ? '/special-occasion' :
                              category.name === 'Size Guide' ? '/size-guide' :
                              category.name === 'Parents' ? '/parents' : '/shop'
                            }
                            className="block w-full text-left py-2 text-sm text-gray-700 hover:text-hot-pink transition-colors duration-300"
                          >
                            {item}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              {!expanded && (
                <button className="hidden lg:block text-gray-800 hover:text-hot-pink transition-colors duration-300" onClick={() => setExpanded(true)}>
                  <Search className="w-5 h-5" />
                </button>
              )}
              {expanded && (
                <div ref={panelRef} className="hidden lg:flex items-stretch w-72 xl:w-[32rem] relative">
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search EB's Closet" className="flex-1 px-4 py-2 rounded-l-xl bg-white/70 border focus:outline-none" />
                  <button className="rounded-r-xl bg-hot-pink text-white px-4" onClick={() => navigate(`/shop?q=${encodeURIComponent(q)}`)}>
                    <Search className="w-5 h-5" />
                  </button>
                  {q && results.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white/90 backdrop-blur-xl border rounded-xl shadow-2xl p-2 z-50">
                      {results.map((p) => (
                        <Link key={p.id} to={`/product/${p.id}`} className="flex items-center gap-3 px-2 py-2 hover:bg-white/70 rounded">
                          <img src={p.image} alt={p.name} className="w-10 h-12 object-cover rounded" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-800">{p.name}</p>
                            <p className="text-xs text-gray-600">₹{p.price}</p>
                          </div>
                        </Link>
                      ))}
                      <button className="w-full text-left text-xs px-2 py-2 mt-1 border rounded hover:bg-white/70" onClick={() => navigate(`/shop?q=${encodeURIComponent(q)}`)}>See all results</button>
                    </div>
                  )}
                </div>
              )}

              {!mobileSearchExpanded && (
                <button className="lg:hidden text-gray-800 hover:text-hot-pink transition-colors duration-300" onClick={() => setMobileSearchExpanded(true)}>
                  <Search className="w-5 h-5" />
                </button>
              )}
              {mobileSearchExpanded && (
                <div ref={mobileSearchRef} className="lg:hidden flex items-stretch flex-1 relative">
                  <input 
                    value={q} 
                    onChange={(e) => setQ(e.target.value)} 
                    placeholder="Search" 
                    className="flex-1 px-3 py-2 rounded-l-lg bg-white/70 border focus:outline-none text-sm" 
                    autoFocus
                  />
                  <button 
                    className="rounded-r-lg bg-hot-pink text-white px-3" 
                    onClick={() => navigate(`/shop?q=${encodeURIComponent(q)}`)}
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  {q && results.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white/90 backdrop-blur-xl border rounded-lg shadow-2xl p-2 z-50 max-h-64 overflow-y-auto">
                      {results.map((p) => (
                        <Link key={p.id} to={`/product/${p.id}`} className="flex items-center gap-2 px-2 py-2 hover:bg-white/70 rounded text-sm" onClick={() => setMobileSearchExpanded(false)}>
                          <img src={p.image} alt={p.name} className="w-8 h-10 object-cover rounded" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-800 truncate">{p.name}</p>
                            <p className="text-xs text-gray-600">₹{p.price}</p>
                          </div>
                        </Link>
                      ))}
                      <button className="w-full text-left text-xs px-2 py-2 mt-1 border rounded hover:bg-white/70" onClick={() => navigate(`/shop?q=${encodeURIComponent(q)}`)}>See all</button>
                    </div>
                  )}
                </div>
              )}

              <button className="text-gray-800 hover:text-hot-pink transition-colors duration-300" onClick={() => navigate('/cart')}>
                <ShoppingBag className="w-5 h-5" />
              </button>
              {!mobileSearchExpanded && (
                <button className="text-gray-800 hover:text-hot-pink transition-colors duration-300" onClick={() => navigate('/')}>
                  <h4>Eb's Closet</h4>
                </button>
              )}
             
            </div>
          </div>
        </div>
      </nav>

      

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-4/5 max-w-sm bg-white shadow-2xl animate-slideInLeft h-full flex flex-col">
            <div className="p-6 flex-shrink-0">
              <button onClick={() => setIsMobileMenuOpen(false)} className="mb-8">
                <X className="w-6 h-6 text-black" />
              </button>

              <Link to="/" className="font-serif text-2xl mb-8 text-hot-pink" onClick={() => setIsMobileMenuOpen(false)}>
                EB'S CLOSET
              </Link>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto p-6" style={{ touchAction: 'pan-y' }}>
              {loadNav(defaultCategories).map((category) => (
                <div key={category.name}>
                  <button className="text-base tracking-widest uppercase text-gray-800 mb-3 font-medium">
                    {category.name}
                  </button>
                  {category.items.length > 0 && (
                    <div className="pl-4 space-y-2">
                      {category.items.map((item: string) => (
                        <Link
                          key={item}
                          to={
                            category.name === 'New Arrivals' ? '/arrivals' :
                            category.name === 'By Age' ? '/age' :
                            category.name === 'Occasions' ? '/occasions' :
                            category.name === 'Styles' ? '/styles' :
                            category.name === 'Party Dresses' ? '/party' :
                            category.name === 'Casual Dresses' ? '/casual' :
                            category.name === 'Seasonal Dresses' ? '/seasonal' :
                            category.name === 'Special Occasion' ? '/special-occasion' :
                            category.name === 'Size Guide' ? '/size-guide' :
                            category.name === 'Parents' ? '/parents' : '/shop'
                          }
                          className="block text-base text-gray-600 hover:text-hot-pink transition-colors duration-300 min-h-[44px]"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
    </>
  );
}
