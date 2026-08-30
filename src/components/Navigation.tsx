import { useState, useEffect, useMemo, useRef } from 'react';
import { ShoppingBag, Search, Menu, X, ChevronDown } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loadNav } from '../utils/storage';
import { useCart } from '../context/CartContext';
import { useProductContext } from '../context/ProductContext';
import { productService } from '../services/productService';

// ─── Types ────────────────────────────────────────────────────────────────────
/** A leaf link inside a group column */
interface NavItem {
  _id: string;
  name: string;
  slug: string;
}

/** A column group (e.g. "Baby Boy (Prem-24M)") — header + list of leaf links */
interface NavGroup {
  _id: string;
  name: string;
  slug: string;
  items: NavItem[];   // leaf links listed below the column header
}

/** A top-level nav entry (e.g. "Baby") — may have group columns OR legacy flat items */
interface NavCategory {
  _id: string;
  name: string;
  slug: string;
  href?: string;
  subcategories: NavGroup[];           // from backend tree (2-level deep)
  items?: { label: string; href: string }[];  // legacy NavManager flat items
}

// ─── Fallback static nav ──────────────────────────────────────────────────────
const defaultCategories = [
  {
    name: 'New Arrivals',
    href: '/shop?newarrival=true',
    items: [
      { label: 'Latest Dresses', href: '/shop?newarrival=true' },
      { label: "Editor's Picks", href: '/shop?tag=editors-pick' },
      { label: 'Trending Now', href: '/shop?sort=trending' },
    ],
  },
  {
    name: 'By Age', href: '/shop',
    items: [
      { label: '0-1 Yrs', href: '/shop?age=0-1' },
      { label: '1-2 Yrs', href: '/shop?age=1-2' },
      { label: '3-4 Yrs', href: '/shop?age=3-4' },
      { label: '5-6 Yrs', href: '/shop?age=5-6' },
      { label: '7-8 Yrs', href: '/shop?age=7-8' },
      { label: '9-10 Yrs', href: '/shop?age=9-10' },
      { label: '11-12 Yrs', href: '/shop?age=11-12' },
      { label: '13-14 Yrs', href: '/shop?age=13-14' },
    ],
  },
  {
    name: 'Occasions', href: '/shop',
    items: [
      { label: 'Birthday Parties', href: '/shop?type=birthday' },
      { label: 'School Dances', href: '/shop?type=dance' },
      { label: 'Holidays', href: '/shop?type=holiday' },
      { label: 'Everyday Magic', href: '/shop?type=everyday' },
    ],
  },
  {
    name: 'Styles', href: '/shop',
    items: [
      { label: 'Princess Gowns', href: '/shop?type=princess' },
      { label: 'Sparkle Dresses', href: '/shop?type=sparkle' },
      { label: 'Floral Prints', href: '/shop?type=floral' },
      { label: 'Unicorn Dreams', href: '/shop?type=unicorn' },
    ],
  },
  { name: 'Journal', href: '/journal', items: [] },
];

// ─── Mega-dropdown ────────────────────────────────────────────────────────────
function MegaDropdown({ category, solid }: { category: NavCategory; solid: boolean }) {
  const groups = category.subcategories ?? [];
  const legacyItems = category.items ?? [];

  const hasGroups = groups.length > 0;
  const hasLegacy = legacyItems.length > 0;

  if (!hasGroups && !hasLegacy) return null;

  // Decide how many columns: if groups have items (3-level) → group columns
  // else if groups are flat (no items, just group links) → flat grid
  const groupsWithItems = groups.filter(g => g.items && g.items.length > 0);
  const isDeepMenu = groupsWithItems.length > 0;

  // Max columns capped at 5, min-width per col
  const colCount = hasGroups ? Math.min(groups.length, 5) : 1;

  return (
    <div
      className="absolute top-full left-1/2 -translate-x-1/2 pt-1 z-[100]"
      style={{ minWidth: hasGroups ? `${colCount * 190}px` : '220px' }}
    >
      <div className={`bg-white shadow-2xl border-t-2 border-hot-pink animate-fadeIn custom-scrollbar ${solid ? '' : 'rounded-b-2xl'}`}
        style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}
      >

        {hasGroups ? (
          <div className="px-8 py-7">
            {/* Shop-all row */}
            <div className="mb-5 pb-4 border-b border-gray-100">
              <Link
                to={`/shop?category=${category.slug}`}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-hot-pink hover:underline"
              >
                Shop All {category.name} →
              </Link>
            </div>

            {isDeepMenu ? (
              /* ── Multi-column: group header + item list ── */
              <div
                className="grid gap-x-8 items-start"
                style={{ gridTemplateColumns: `repeat(${colCount}, minmax(160px, 1fr))` }}
              >
                {groups.map(group => (
                  <div key={group._id} className="space-y-2">
                    {/* Column header */}
                    <Link
                      to={`/shop?category=${group.slug}`}
                      className="block text-[11px] font-black uppercase tracking-[0.15em] text-gray-900 hover:text-hot-pink transition-colors pb-1 border-b border-gray-100 mb-2"
                    >
                      {group.name}
                    </Link>

                    {/* Leaf items */}
                    {group.items.map(item => (
                      <Link
                        key={item._id}
                        to={`/shop?category=${item.slug}`}
                        className="block text-sm text-gray-600 hover:text-hot-pink transition-colors duration-150 leading-relaxed"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              /* ── Flat grid: group names as links (no nested items) ── */
              <div
                className="grid gap-x-8 gap-y-1"
                style={{ gridTemplateColumns: `repeat(${colCount}, minmax(150px, 1fr))` }}
              >
                {groups.map(group => (
                  <Link
                    key={group._id}
                    to={`/shop?category=${group.slug}`}
                    className="py-1.5 text-sm text-gray-700 hover:text-hot-pink transition-colors duration-150"
                  >
                    {group.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ── Legacy flat dropdown (NavManager items) ── */
          <div className="px-6 py-4 flex flex-col min-w-[200px]">
            {legacyItems.map(item => (
              <Link
                key={item.label}
                to={item.href}
                className="py-2 text-sm text-gray-700 hover:text-hot-pink transition-colors duration-150"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Navigation ──────────────────────────────────────────────────────────
export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [mobileGroupExpanded, setMobileGroupExpanded] = useState<string | null>(null);

  const [categoryTree, setCategoryTree] = useState<NavCategory[]>([]);

  const { items } = useCart();
  const cartCount = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const shouldShowSolid = isScrolled || !isHomePage;

  const navigate = useNavigate();
  const { products: catalog } = useProductContext();
  const [expanded, setExpanded] = useState(false);
  const [q, setQ] = useState('');
  const panelRef = useRef<HTMLDivElement | null>(null);

  const results = useMemo(() => {
    const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!tokens.length) return [];
    return catalog
      .filter((p: any) => {
        const text = `${p.name} ${p.description ?? ''} ${p.materials ?? ''}`.toLowerCase();
        return tokens.every(t => text.includes(t));
      })
      .slice(0, 8);
  }, [q, catalog]);

  // Fetch 2-level-deep tree from backend
  useEffect(() => {
    productService.getCategoryTree()
      .then(tree => { if (tree?.length) setCategoryTree(tree as unknown as NavCategory[]); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setExpanded(false); };
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick); };
  }, [expanded]);

  // Build final nav list
  const navItems: NavCategory[] = useMemo(() => {
    if (categoryTree.length > 0) {
      return categoryTree.map(c => ({
        _id: c._id,
        name: c.name,
        slug: c.slug,
        href: `/shop?category=${c.slug}`,
        subcategories: (c.subcategories ?? []) as NavGroup[],
        items: [],
      }));
    }
    return loadNav(defaultCategories).map((c: any, i: number) => ({
      _id: String(i),
      name: c.name,
      slug: c.href ?? '#',
      href: c.href ?? '#',
      subcategories: [] as NavGroup[],
      items: c.items ?? [],
    }));
  }, [categoryTree]);

  const finalNav = useMemo(() => {
    const hasJournal = navItems.some(n => n.name.toLowerCase() === 'journal');
    if (hasJournal) return navItems;
    return [...navItems, { _id: 'journal', name: 'Journal', slug: '/journal', href: '/journal', subcategories: [] as NavGroup[], items: [] }];
  }, [navItems]);

  // ── Desktop nav links ───────────────────────────────────────────────────────
  const DesktopNavLinks = ({ textClass }: { textClass: string }) => (
    <div className="flex items-center space-x-6 xl:space-x-8 h-full">
      {finalNav.map(category => {
        const hasDropdown = (category.subcategories?.length ?? 0) > 0 || (category.items?.length ?? 0) > 0;
        const isHovered = hoveredCategory === category._id;
        return (
          <div
            key={category._id}
            className="relative h-full flex items-center"
            onMouseEnter={() => setHoveredCategory(category._id)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <Link
              to={category.href || '#'}
              className={`flex items-center gap-0.5 text-[12px] xl:text-[13px] tracking-[0.1em] uppercase transition-colors duration-300 h-full whitespace-nowrap ${textClass} ${location.pathname === category.href ? 'font-bold' : ''}`}
            >
              {category.name}
              {hasDropdown && (
                <ChevronDown size={12} className={`ml-0.5 transition-transform duration-200 ${isHovered ? 'rotate-180' : ''}`} />
              )}
            </Link>

            {hasDropdown && isHovered && (
              <MegaDropdown category={category} solid={shouldShowSolid} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Marquee */}
      <div className="fixed top-0 left-0 w-full z-[60] bg-black text-white h-6 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee min-w-max h-full items-center">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center">
              {[...Array(10)].map((_, idx) => (
                <span key={idx} className="mx-6 text-[10px] md:text-xs font-medium tracking-[0.25em] uppercase">
                  🚚 Free Delivery On Orders Above $150 AUD
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <nav className={`fixed top-4 left-0 right-0 z-50 transition-all duration-500 ${shouldShowSolid ? 'bg-white shadow-md' : 'bg-transparent'}`}>
        <div className="max-w-screen-2xl mx-auto px-5 lg:px-12">

          {/* Main row */}
          <div className={`flex items-center justify-between transition-all duration-500 ${shouldShowSolid ? 'h-16 lg:h-20' : 'h-24'}`}>

            {/* Left: hamburger */}
            <div className="flex-1 flex items-center">
              <button className="lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className={`w-6 h-6 ${shouldShowSolid ? 'text-black' : 'text-white'}`} />
              </button>
            </div>

            {/* Center: logo + transparent-state nav */}
            <div className={`flex-none flex justify-center items-center h-full px-4 ${expanded ? 'hidden sm:flex' : ''}`}>
              <Link
                to="/"
                className={`font-headline tracking-widest text-xl lg:text-3xl text-hot-pink whitespace-nowrap pt-1 ${shouldShowSolid ? 'block' : 'lg:hidden block'}`}
              >
                EB'S CLOSET
              </Link>

              {!shouldShowSolid && (
                <div className="hidden lg:flex items-center h-full">
                  <DesktopNavLinks textClass="text-white hover:text-white/70" />
                </div>
              )}
            </div>

            {/* Right: search + cart */}
            <div className="flex-1 flex items-center justify-end space-x-4 lg:space-x-6">
              {expanded && (
                <div ref={panelRef} className="flex items-stretch flex-1 sm:flex-none sm:w-64 relative">
                  <input
                    autoFocus value={q} onChange={e => setQ(e.target.value)}
                    placeholder="Search..."
                    className={`w-full px-4 py-1.5 rounded-full border focus:outline-none text-sm ${shouldShowSolid ? 'bg-gray-100 border-transparent text-black' : 'bg-gray-100 border-gray-200 lg:bg-white/20 lg:border-white/30 text-black lg:text-white placeholder-gray-500 lg:placeholder-white/70'}`}
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-hot-pink" onClick={() => { navigate(`/shop?q=${encodeURIComponent(q)}`); setExpanded(false); }}>
                    <Search className="w-4 h-4" />
                  </button>
                  {results.length > 0 && (
                    <div className="fixed sm:absolute top-16 sm:top-full left-4 right-4 sm:left-auto sm:right-0 mt-2 sm:w-80 bg-white shadow-2xl rounded-lg overflow-hidden border border-gray-100 animate-fadeIn z-[60]">
                      <div className="py-2">
                        {results.map((product: any) => (
                          <button key={product._id || product.id} className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                            onClick={() => { navigate(`/product/${product.slug || product._id || product.id}`); setExpanded(false); setQ(''); }}>
                            <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                            <div className="ml-3 overflow-hidden">
                              <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                              <p className="text-xs text-gray-500">${product.price}</p>
                            </div>
                          </button>
                        ))}
                        <button className="w-full py-2 text-center text-xs font-semibold text-hot-pink hover:bg-hot-pink/5" onClick={() => { navigate(`/shop?q=${encodeURIComponent(q)}`); setExpanded(false); }}>
                          View All Results
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!expanded && (
                <button className={`transition-colors duration-300 ${shouldShowSolid ? 'text-black hover:text-hot-pink' : 'text-white hover:text-white/70'}`} onClick={() => setExpanded(true)}>
                  <Search className="w-5 h-5 lg:w-6 lg:h-6" />
                </button>
              )}

              <button className={`relative transition-colors duration-300 ${shouldShowSolid ? 'text-black hover:text-hot-pink' : 'text-white hover:text-white/70'}`} onClick={() => navigate('/cart')}>
                <ShoppingBag className="w-5 h-5 lg:w-6 lg:h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-hot-pink text-white text-[10px] w-4 h-4 lg:w-5 lg:h-5 rounded-full flex items-center justify-center">{cartCount}</span>
                )}
              </button>
            </div>
          </div>

          {/* Secondary row (solid state) */}
          <div className={`hidden lg:flex justify-center transition-all duration-500 ${shouldShowSolid ? 'h-10 border-t border-gray-100 overflow-visible' : 'h-0 overflow-hidden'}`}>
            <DesktopNavLinks textClass="text-gray-800 hover:text-hot-pink" />
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ───────────────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-4/5 max-w-sm bg-white shadow-2xl animate-slideInLeft flex flex-col">
            <div className="p-5 flex items-center justify-between border-b border-gray-100">
              <span className="font-headline text-lg text-hot-pink">EB'S CLOSET</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2"><X className="w-6 h-6 text-gray-500" /></button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-5 space-y-1" style={{ touchAction: 'pan-y' }}>
              {finalNav.map(category => {
                const hasGroups = (category.subcategories?.length ?? 0) > 0;
                const hasLegacy = (category.items?.length ?? 0) > 0;
                const isOpen = mobileExpanded === category._id;

                return (
                  <div key={category._id}>
                    <div className="flex items-center justify-between">
                      <Link to={category.href || '#'} className="flex-1 py-3 text-sm font-bold uppercase tracking-widest text-gray-900" onClick={() => setIsMobileMenuOpen(false)}>
                        {category.name}
                      </Link>
                      {(hasGroups || hasLegacy) && (
                        <button className="p-3 text-gray-400" onClick={() => setMobileExpanded(isOpen ? null : category._id)}>
                          <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>

                    {isOpen && (
                      <div className="ml-2 mb-2">
                        {hasGroups ? (
                          /* Groups with nested items */
                          category.subcategories.map(group => {
                            const groupOpen = mobileGroupExpanded === group._id;
                            const groupHasItems = group.items && group.items.length > 0;
                            return (
                              <div key={group._id} className="border-l-2 border-gray-100 pl-3 mb-2">
                                <div className="flex items-center justify-between">
                                  <Link
                                    to={`/shop?category=${group.slug}`}
                                    className="flex-1 py-2 text-xs font-black uppercase tracking-widest text-gray-700 hover:text-hot-pink transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    {group.name}
                                  </Link>
                                  {groupHasItems && (
                                    <button className="p-2 text-gray-300" onClick={() => setMobileGroupExpanded(groupOpen ? null : group._id)}>
                                      <ChevronDown size={13} className={`transition-transform ${groupOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                  )}
                                </div>

                                {groupOpen && groupHasItems && (
                                  <div className="pl-2 space-y-0.5 pb-2">
                                    {group.items.map(item => (
                                      <Link
                                        key={item._id}
                                        to={`/shop?category=${item.slug}`}
                                        className="block py-1.5 text-sm text-gray-500 hover:text-hot-pink transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                      >
                                        {item.name}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          /* Legacy flat items */
                          <div className="border-l-2 border-gray-100 pl-3 space-y-0.5 pb-2">
                            {(category.items ?? []).map(item => (
                              <Link key={item.label} to={item.href} className="block py-1.5 text-sm text-gray-600 hover:text-hot-pink transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        )}

                        {hasGroups && (
                          <Link to={`/shop?category=${category.slug}`} className="block mt-1 py-2 text-xs font-black uppercase tracking-widest text-hot-pink" onClick={() => setIsMobileMenuOpen(false)}>
                            Shop All {category.name} →
                          </Link>
                        )}
                      </div>
                    )}

                    <div className="h-px bg-gray-100" />
                  </div>
                );
              })}

              <div className="pt-6">
                <Link to="/cart" className="flex items-center gap-3 py-3 text-gray-800" onClick={() => setIsMobileMenuOpen(false)}>
                  <ShoppingBag className="w-5 h-5" />
                  <span className="text-sm uppercase tracking-widest font-bold">Shopping Bag ({cartCount})</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
