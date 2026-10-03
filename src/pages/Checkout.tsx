import { useCart } from '../context/CartContext';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { authService, User, Address } from '../services/authService';
import { formatAUD } from '../utils/storage';
import { ShoppingBag, X, Check, MapPin, ChevronDown, Lock, Search, HelpCircle, Loader2 } from 'lucide-react';
import CheckoutHeader from '../components/checkout/CheckoutHeader';
import { useAddressAutocomplete } from '../hooks/useAddressAutocomplete';

export default function Checkout() {
  const { items: cartItems, total: cartTotal, clear } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  const buyNowItem = location.state?.buyNowItem;
  const items = useMemo(() => buyNowItem ? [buyNowItem] : cartItems, [buyNowItem, cartItems]);
  const total = useMemo(() => buyNowItem ? buyNowItem.price * buyNowItem.qty : cartTotal, [buyNowItem, cartTotal]);
  
  const [email, setEmail] = useState(() => sessionStorage.getItem('checkout_email') || '');
  const [shipping, setShipping] = useState(() => {
    const saved = sessionStorage.getItem('checkout_shipping');
    if (saved) return JSON.parse(saved);
    return { 
      firstName: '',
      lastName: '',
      address: '', 
      apartment: '',
      suburb: '',
      city: '', 
      state: '',
      postcode: '', 
      phone: '',
      country: 'Australia'
    };
  });

  useEffect(() => {
    sessionStorage.setItem('checkout_email', email);
  }, [email]);

  useEffect(() => {
    sessionStorage.setItem('checkout_shipping', JSON.stringify(shipping));
  }, [shipping]);

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'afterpay' | 'zip' | 'cod'>('card');
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [outOfStockItems, setOutOfStockItems] = useState<string[]>([]);
  const [isCheckingStock, setIsCheckingStock] = useState(false);

  // Address autocomplete
  const addressAutoComplete = useAddressAutocomplete();
  const addressDropdownRef = useRef<HTMLDivElement>(null);

  // Close autocomplete on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (addressDropdownRef.current && !addressDropdownRef.current.contains(e.target as Node)) {
        addressAutoComplete.setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [addressAutoComplete]);

  // Persistence: Load from sessionStorage
  useEffect(() => {
    const savedEmail = sessionStorage.getItem('checkout_email');
    const savedShipping = sessionStorage.getItem('checkout_shipping');
    if (savedEmail) setEmail(savedEmail);
    if (savedShipping) {
      try {
        setShipping(JSON.parse(savedShipping));
      } catch (e) {
        console.error('Failed to parse saved shipping', e);
      }
    }
  }, []);

  // Persistence: Save to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('checkout_email', email);
  }, [email]);

  useEffect(() => {
    sessionStorage.setItem('checkout_shipping', JSON.stringify(shipping));
  }, [shipping]);

  useEffect(() => {
    const checkStock = async () => {
      if (items.length === 0) return;
      setIsCheckingStock(true);
      const oos: string[] = [];
      await Promise.all(items.map(async (item) => {
        try {
          const p = await productService.getProduct(String(item.id));
          let availableStock = 0;
          
          if (p.variants && p.variants.length > 0) {
            const variant = p.variants.find((v: any) => {
              if (item.variantId && (v._id === item.variantId || v.id === item.variantId)) return true;
              if (item.sku && v.sku && v.sku === item.sku) return true;
              
              const vColor = (v.attributes?.color || v.color || v.name || '').toLowerCase();
              const vSize = (v.attributes?.size || v.size || '').toLowerCase();
              const itemColor = (item.color || '').toLowerCase();
              const itemSize = (item.size || '').toLowerCase();

              const colorMatch = !item.color || vColor === itemColor;
              const sizeMatch = !item.size || vSize === itemSize;
              return colorMatch && sizeMatch;
            });
            availableStock = Number(variant?.stock?.quantity ?? variant?.inStock ?? 0);
          } else {
            const stockMap: Record<string, number> = p?.stock || {};
            if (item.size && stockMap[item.size] !== undefined) {
              availableStock = Number(stockMap[item.size] || 0);
            } else if (Object.keys(stockMap).length > 0) {
              availableStock = Object.values(stockMap).reduce((a, b) => a + (Number(b) || 0), 0);
            } else {
              availableStock = Number((p as any).inStock || 0);
            }
          }

          if (availableStock < item.qty) {
            const key = item.sku || `${item.id}:${item.size || ''}:${item.color || ''}`;
            oos.push(key);
          }
        } catch (err) {
          console.error('Stock check failed for', item.id, err);
        }
      }));
      setOutOfStockItems(oos);
      setIsCheckingStock(false);
    };
    checkStock();
  }, [items]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const [userData, userAddresses] = await Promise.all([
          authService.getMe(),
          authService.getAddresses()
        ]);

        setUser(userData);
        if (!email) setEmail(userData.email);
        setAddresses(userAddresses);

        // Pre-fill with primary address ONLY if current fields are empty
        const primary = userAddresses.find(a => a.isPrimary) || userAddresses[0];
        if (primary && !shipping.firstName && !shipping.address) {
          const names = (primary.fullName || '').split(' ');
          setShipping({
            firstName: names[0] || '',
            lastName: names.slice(1).join(' ') || '',
            address: primary.address,
            apartment: '',
            suburb: '',
            city: primary.city,
            state: '',
            postcode: primary.postalCode,
            phone: primary.phone,
            country: primary.country || 'Australia'
          });
        }
      } catch (err) {
        console.error('Failed to fetch user data', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const shippingFee = useMemo(() => total > 150 ? 0 : 10, [total]);
  const tax = useMemo(() => total * 0.10, [total]);
  const grandTotal = useMemo(() => total + tax + shippingFee, [total, tax, shippingFee]);

  const selectAddress = (addr: Address) => {
    const names = (addr.fullName || '').split(' ');
    setShipping({
      firstName: names[0] || '',
      lastName: names.slice(1).join(' ') || '',
      address: addr.address,
      apartment: '',
      suburb: '',
      city: addr.city,
      state: '',
      postcode: addr.postalCode,
      phone: addr.phone,
      country: addr.country || 'Australia'
    });
    setShowAddressDropdown(false);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipping.firstName || !shipping.address || !shipping.city || !shipping.postcode) {
      showToast('Please fill in all shipping details', 'error');
      return;
    }

    setIsPlacingOrder(true);

    // Final stock check
    const oos: string[] = [];
    await Promise.all(items.map(async (item) => {
      try {
        const p = await productService.getProduct(String(item.id));
        let availableStock = 0;
        
        if (p.variants && p.variants.length > 0) {
          const variant = p.variants.find((v: any) => {
            if (item.variantId && (v._id === item.variantId || v.id === item.variantId)) return true;
            if (item.sku && v.sku && v.sku === item.sku) return true;
            
            const vColor = (v.attributes?.color || v.color || v.name || '').toLowerCase();
            const vSize = (v.attributes?.size || v.size || '').toLowerCase();
            const itemColor = (item.color || '').toLowerCase();
            const itemSize = (item.size || '').toLowerCase();

            const colorMatch = !item.color || vColor === itemColor;
            const sizeMatch = !item.size || vSize === itemSize;
            return colorMatch && sizeMatch;
          });
          availableStock = Number(variant?.stock?.quantity ?? variant?.inStock ?? 0);
        } else {
          const stockMap: Record<string, number> = p?.stock || {};
          if (item.size && stockMap[item.size] !== undefined) {
            availableStock = Number(stockMap[item.size] || 0);
          } else if (Object.keys(stockMap).length > 0) {
            availableStock = Object.values(stockMap).reduce((a, b) => a + (Number(b) || 0), 0);
          } else {
            availableStock = Number((p as any).inStock || 0);
          }
        }

        if (availableStock < item.qty) oos.push(item.name);
      } catch (err) {
        console.error('Stock check failed', err);
      }
    }));

    if (oos.length > 0) {
      showToast(`Sorry, ${oos.join(', ')} is out of stock.`, 'error');
      setIsPlacingOrder(false);
      return;
    }

    const payload = { 
      customer: {
        fullName: `${shipping.firstName} ${shipping.lastName}`.trim(),
        email: email || (user?.email) || 'guest@example.com',
        phone: shipping.phone,
        address: `${shipping.address}${shipping.apartment ? ', ' + shipping.apartment : ''}`,
        city: shipping.city,
        postalCode: shipping.postcode,
        country: shipping.country,
        suburb: shipping.suburb || shipping.city,
        state: shipping.state
      },
      cart: items.map(i => ({ 
        productId: i.id,
        title: i.name, 
        unitPrice: i.price * 100,
        quantity: i.qty,
        variantName: i.size || i.color || '',
        sku: i.sku,
        color: i.color,
        variantId: i.variantId
      })), 
      shippingFee: Math.round(shippingFee * 100),
      tax: Math.round(tax * 100),
      successUrl: `${window.location.origin}/order-confirmation`,
      cancelUrl: `${window.location.origin}/checkout`,
      paymentMethod: paymentMethod === 'cod' ? 'COD' : paymentMethod === 'card' ? 'CARD' : paymentMethod.toUpperCase()
    };

    try {
      if (paymentMethod === 'card') {
        const res = await orderService.createStripeSession(payload);
        if (res.url) {
          window.location.href = res.url;
          return;
        }
      } else if (paymentMethod === 'paypal' || paymentMethod === 'afterpay' || paymentMethod === 'zip') {
        // TODO: integrate real PayPal / Afterpay / Zip SDK flows here
        showToast(`${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} integration coming soon. Your order has been placed as pending.`, 'info');
        const res = await orderService.createOrder(payload);
        if (!buyNowItem) clear();
        sessionStorage.removeItem('checkout_email');
        sessionStorage.removeItem('checkout_shipping');
        navigate('/order-confirmation', { state: { orderId: res.orderId } });
      } else {
        const res = await orderService.createOrder(payload);
        if (!buyNowItem) clear();
        sessionStorage.removeItem('checkout_email');
        sessionStorage.removeItem('checkout_shipping');
        showToast('Order placed successfully!');
        navigate('/order-confirmation', { state: { orderId: res.orderId } });
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0 && !isPlacingOrder) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Your bag is empty</h2>
        <button onClick={() => navigate('/shop')} className="bg-black text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm">
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <CheckoutHeader itemCount={items.length} />

      <main className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr,450px] min-h-[calc(100vh-80px)]">
        {/* Left Column: Form Sections */}
        <div className="px-4 py-8 md:px-8 lg:px-12 border-r border-gray-100">
          <div className="max-w-[600px] mx-auto lg:ml-auto lg:mr-0 space-y-8">
            {/* Contact Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium">Contact</h2>
                {/* <button onClick={() => navigate('/auth')} className="text-xs text-gray-600 underline">Sign in</button> */}
              </div>
              <div className="space-y-2">
                <input 
                  type="email" 
                  placeholder="Email"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-1 focus:ring-black focus:border-black transition-all outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" className="peer sr-only" defaultChecked />
                    <div className="w-5 h-5 border border-gray-300 rounded bg-white peer-checked:bg-hot-pink peer-checked:border-hot-pink transition-all"></div>
                    <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs text-gray-600">Email me with news and offers</span>
                </label>
              </div>
            </section>

            {/* Delivery Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-medium">Delivery</h2>
              <div className="space-y-3">
                <div className="relative">
                  <select 
                    className="w-full border border-gray-300 rounded-md px-4 py-3 appearance-none focus:ring-1 focus:ring-black focus:border-black transition-all outline-none bg-white text-sm"
                    value={shipping.country}
                    onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                  >
                    <option value="Australia">Australia</option>
                    <option value="New Zealand">New Zealand</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] text-gray-500 uppercase tracking-tighter">Country/Region</label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="text" 
                    placeholder="First name"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-1 focus:ring-black focus:border-black transition-all outline-none text-sm"
                    value={shipping.firstName}
                    onChange={(e) => setShipping({ ...shipping, firstName: e.target.value })}
                  />
                  <input 
                    type="text" 
                    placeholder="Last name"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-1 focus:ring-black focus:border-black transition-all outline-none text-sm"
                    value={shipping.lastName}
                    onChange={(e) => setShipping({ ...shipping, lastName: e.target.value })}
                  />
                </div>

                <div className="relative" ref={addressDropdownRef}>
                  {/* Address input with autocomplete */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Address"
                      autoComplete="off"
                      className="w-full border border-gray-300 rounded-md px-4 py-3 pr-10 focus:ring-1 focus:ring-black focus:border-black transition-all outline-none text-sm"
                      value={addressAutoComplete.query || shipping.address}
                      onChange={(e) => {
                        const val = e.target.value;
                        addressAutoComplete.setQuery(val);
                        setShipping((prev: typeof shipping) => ({ ...prev, address: val }));
                      }}
                      onFocus={() => {
                        if (addressAutoComplete.suggestions.length > 0) {
                          addressAutoComplete.setIsOpen(true);
                        }
                      }}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      {addressAutoComplete.isLoading
                        ? <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                        : <Search className="w-4 h-4 text-gray-400" />
                      }
                    </div>
                  </div>

                  {/* Hint */}
                  {!shipping.address && (
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-500">
                      <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        <path d="M8 7v4M8 5.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      Add a house number if you have one
                    </p>
                  )}

                  {/* Suggestions dropdown */}
                  {addressAutoComplete.isOpen && addressAutoComplete.suggestions.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                      <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">Suggestions</span>
                        <button
                          type="button"
                          onClick={() => addressAutoComplete.setIsOpen(false)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <ul>
                        {addressAutoComplete.suggestions.map((s, i) => {
                          // Bold the matching part of the suggestion
                          const query = (addressAutoComplete.query || '').toLowerCase();
                          const display = s.displayName;
                          const idx = display.toLowerCase().indexOf(query);
                          return (
                            <li key={i}>
                              <button
                                type="button"
                                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                onMouseDown={(e) => {
                                  e.preventDefault(); // prevent input blur
                                  addressAutoComplete.setQuery(s.address);
                                  setShipping((prev: typeof shipping) => ({
                                    ...prev,
                                    address: s.address,
                                    suburb: s.suburb || prev.suburb,
                                    city: s.city || prev.city,
                                    state: s.state || prev.state,
                                    postcode: s.postcode || prev.postcode,
                                    country: s.country || prev.country,
                                  }));
                                  addressAutoComplete.clear();
                                }}
                              >
                                {idx >= 0 && query ? (
                                  <>
                                    {display.slice(0, idx)}
                                    <strong className="font-semibold">{display.slice(idx, idx + query.length)}</strong>
                                    {display.slice(idx + query.length)}
                                  </>
                                ) : display}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>

                <input 
                  type="text" 
                  placeholder="Apartment, suite, etc. (optional)"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-1 focus:ring-black focus:border-black transition-all outline-none text-sm"
                  value={shipping.apartment}
                  onChange={(e) => setShipping({ ...shipping, apartment: e.target.value })}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input 
                    type="text" 
                    placeholder="City"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-1 focus:ring-black focus:border-black transition-all outline-none text-sm"
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                  />
                  <div className="relative">
                    <select 
                      className="w-full border border-gray-300 rounded-md px-4 py-3 appearance-none focus:ring-1 focus:ring-black focus:border-black transition-all outline-none bg-white text-sm"
                      value={shipping.state}
                      onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                    >
                      <option value="">State/territory</option>
                      <option value="NSW">NSW</option>
                      <option value="VIC">VIC</option>
                      <option value="QLD">QLD</option>
                      <option value="WA">WA</option>
                      <option value="SA">SA</option>
                      <option value="TAS">TAS</option>
                      <option value="ACT">ACT</option>
                      <option value="NT">NT</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Postcode"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-1 focus:ring-black focus:border-black transition-all outline-none text-sm"
                    value={shipping.postcode}
                    onChange={(e) => setShipping({ ...shipping, postcode: e.target.value })}
                  />
                </div>

                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Phone"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-1 focus:ring-black focus:border-black transition-all outline-none text-sm"
                    value={shipping.phone}
                    onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                  />
                  {/* <div className="absolute right-4 top-1/2 -translate-y-1/2 group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                  </div> */}
                </div>

                {/* <label className="flex items-center gap-2 cursor-pointer group pt-2">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" className="peer sr-only" />
                    <div className="w-5 h-5 border border-gray-300 rounded bg-white peer-checked:bg-hot-pink peer-checked:border-hot-pink transition-all"></div>
                    <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs text-gray-600">Text me with news and offers</span>
                </label> */}
              </div>
            </section>

            {/* Shipping Method Section
            <section className="space-y-4">
              <h2 className="text-xl font-medium">Shipping method</h2>
              <div className="bg-[#f5f5f5] p-6 rounded-md text-center">
                <p className="text-xs text-gray-500">Enter your shipping address to view available shipping methods.</p>
              </div>
            </section> */}

            {/* Express Checkout */}
            <section className="space-y-3">
              <p className="text-center text-xs text-gray-400 font-medium tracking-wide">Express checkout</p>
              <div className="grid grid-cols-3 gap-3">
                {/* Shop Pay */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className="h-12 rounded-lg flex items-center justify-center font-bold text-white text-base tracking-tight transition-opacity hover:opacity-90"
                  style={{ background: '#5a31f4' }}
                  title="Shop Pay"
                >
                  <svg viewBox="0 0 60 24" className="h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                    <text x="0" y="19" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="18" fill="white">shop</text>
                  </svg>
                  <span className="ml-1 font-bold text-white text-lg leading-none">shop</span>
                </button>
                {/* PayPal */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className="h-12 rounded-lg flex items-center justify-center transition-opacity hover:opacity-90"
                  style={{ background: '#FFC439' }}
                  title="PayPal"
                >
                  <svg viewBox="0 0 101 32" className="h-6" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.237 2.845c-.636-.73-1.784-1.044-3.254-1.044H4.958a.74.74 0 0 0-.73.624L2.67 13.791a.445.445 0 0 0 .44.514h2.2l.553-3.51-.017.11a.738.738 0 0 1 .729-.624h1.52c2.98 0 5.313-1.212 5.994-4.716.02-.103.038-.203.053-.3.17-1.088.012-1.83-.905-2.42z" fill="#003087"/>
                    <path d="M12.237 2.845c-.636-.73-1.784-1.044-3.254-1.044H4.958a.74.74 0 0 0-.73.624L2.67 13.791a.445.445 0 0 0 .44.514h2.2l.553-3.51.553-3.51a.738.738 0 0 1 .73-.624h1.518c2.98 0 5.314-1.212 5.995-4.716.02-.103.037-.203.053-.3-.403-.236-.874-.413-1.475-.8z" fill="#0070E0"/>
                    <path d="M5.84 6.47a.643.643 0 0 1 .636-.544h4.037c.478 0 .924.031 1.33.098.116.018.23.04.34.064.11.023.218.05.32.08.05.016.1.032.148.05.388.131.742.31 1.049.554.298-1.9-.003-3.194-1.03-4.366C11.445.9 9.584.5 7.207.5H1.574A.888.888 0 0 0 .699 1.25L-1.32 14.306a.535.535 0 0 0 .528.617H2.67L3.82 7.67l2.02-1.2z" fill="#001C64"/>
                    <text x="20" y="22" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="16" fill="#003087">Pay</text>
                    <text x="39" y="22" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="16" fill="#009CDE">Pal</text>
                  </svg>
                </button>
                {/* Google Pay */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className="h-12 rounded-lg flex items-center justify-center transition-opacity hover:opacity-90 border border-gray-200"
                  style={{ background: '#000' }}
                  title="Google Pay"
                >
                  <svg viewBox="0 0 70 28" className="h-6" xmlns="http://www.w3.org/2000/svg">
                    <text x="0" y="20" fontFamily="Arial, sans-serif" fontSize="15" fill="white">
                      <tspan fill="#4285F4">G</tspan>
                      <tspan fill="white"> Pay</tspan>
                    </text>
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">OR</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
            </section>

            {/* Payment Section */}
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-medium">Payment</h2>
                <p className="text-xs text-gray-500">All transactions are secure and encrypted.</p>
              </div>
              
              <div className="border border-gray-200 rounded-md overflow-hidden divide-y divide-gray-200">
                {/* Credit Card */}
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full flex items-center justify-between p-4 text-left transition-colors ${paymentMethod === 'card' ? 'bg-[#f0f9ff]' : 'bg-white hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === 'card' ? 'border-blue-600' : 'border-gray-300'}`}>
                      {paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                    </div>
                    <span className="text-sm font-medium">Credit card</span>
                  </div>
                  {/* Card brand logos */}
                  <div className="flex items-center gap-1">
                    {/* Visa */}
                    <div className="w-9 h-6 bg-white border border-gray-200 rounded flex items-center justify-center">
                      <svg viewBox="0 0 38 24" className="w-7 h-4" xmlns="http://www.w3.org/2000/svg">
                        <rect width="38" height="24" rx="3" fill="#1A1F71"/>
                        <text x="5" y="17" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="11" fill="white" letterSpacing="1">VISA</text>
                      </svg>
                    </div>
                    {/* Mastercard */}
                    <div className="w-9 h-6 bg-white border border-gray-200 rounded flex items-center justify-center overflow-hidden">
                      <svg viewBox="0 0 38 24" className="w-8 h-5" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="15" cy="12" r="8" fill="#EB001B"/>
                        <circle cx="23" cy="12" r="8" fill="#F79E1B"/>
                        <path d="M19 6.8a8 8 0 0 1 0 10.4A8 8 0 0 1 19 6.8z" fill="#FF5F00"/>
                      </svg>
                    </div>
                    {/* Amex */}
                    <div className="w-9 h-6 bg-white border border-gray-200 rounded flex items-center justify-center">
                      <svg viewBox="0 0 38 24" className="w-7 h-4" xmlns="http://www.w3.org/2000/svg">
                        <rect width="38" height="24" rx="3" fill="#007BC1"/>
                        <text x="4" y="17" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="8.5" fill="white" letterSpacing="0.3">AMEX</text>
                      </svg>
                    </div>
                    <div className="w-9 h-6 bg-white border border-gray-200 rounded flex items-center justify-center">
                      <span className="text-[9px] text-gray-500 font-semibold">+2</span>
                    </div>
                  </div>
                </button>

                {/* Card selected: redirect info */}
                {paymentMethod === 'card' && (
                  <div className="px-4 py-3 bg-[#f0f9ff] text-xs text-gray-500 flex items-center gap-2 border-t border-blue-100">
                    <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    You'll be redirected to our secure Stripe payment page to complete your purchase.
                  </div>
                )}

                {/* PayPal */}
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`w-full flex items-center justify-between p-4 text-left transition-colors ${paymentMethod === 'paypal' ? 'bg-[#fef9ed]' : 'bg-white hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === 'paypal' ? 'border-blue-600' : 'border-gray-300'}`}>
                      {paymentMethod === 'paypal' && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                    </div>
                    <span className="text-sm font-medium">PayPal</span>
                  </div>
                  {/* PayPal logo */}
                  <div className="w-16 h-6 flex items-center justify-end">
                    <svg viewBox="0 0 80 20" className="h-5" xmlns="http://www.w3.org/2000/svg">
                      <text x="0" y="16" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="14" fill="#003087">Pay</text>
                      <text x="25" y="16" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="14" fill="#009CDE">Pal</text>
                    </svg>
                  </div>
                </button>

                {/* Afterpay */}
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('afterpay')}
                  className={`w-full flex items-center justify-between p-4 text-left transition-colors ${paymentMethod === 'afterpay' ? 'bg-[#f0fff4]' : 'bg-white hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === 'afterpay' ? 'border-blue-600' : 'border-gray-300'}`}>
                      {paymentMethod === 'afterpay' && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                    </div>
                    <span className="text-sm font-medium">Afterpay</span>
                  </div>
                  {/* Afterpay logo */}
                  <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: '#B2FCE4' }}>
                    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L6 8l2 1-4 5h4l-1 8 9-11h-4l3-4-2-1 4-4z" fill="#000"/>
                    </svg>
                  </div>
                </button>

                {/* Zip */}
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('zip')}
                  className={`w-full flex items-center justify-between p-4 text-left transition-colors ${paymentMethod === 'zip' ? 'bg-[#f5f0ff]' : 'bg-white hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === 'zip' ? 'border-blue-600' : 'border-gray-300'}`}>
                      {paymentMethod === 'zip' && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                    </div>
                    <span className="text-sm font-medium">Zip – Flexible payment options</span>
                  </div>
                  {/* Zip logo */}
                  <div className="h-6 flex items-center justify-end">
                    <svg viewBox="0 0 44 18" className="h-5" xmlns="http://www.w3.org/2000/svg">
                      <rect width="44" height="18" rx="3" fill="#AA8FFF"/>
                      <text x="8" y="13" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="10" fill="white" letterSpacing="1">zip</text>
                    </svg>
                  </div>
                </button>
              </div>
            </section>

            <section className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium">Save my information for a faster checkout</h2>
                <button className="text-xs text-gray-600 underline">Not now</button>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                By paying, you agree to create a Shop account subject to Shop's <button className="underline">Terms</button> and <button className="underline">Privacy Policy</button>.
              </p>
            </section>

            <button 
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || isLoading || isCheckingStock || outOfStockItems.length > 0}
              className="w-full bg-hot-pink text-white py-4 rounded-md font-medium text-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlacingOrder ? 'Processing...' : 'Pay now'}
            </button>

            <div className="flex flex-wrap gap-4 text-[10px] text-hot-pink font-medium pt-8">
              <Link to="/returns" className="underline">Refund policy</Link>
              <Link to="/shipping" className="underline">Shipping</Link>
              <Link to="/privacy" className="underline">Privacy policy</Link>
              <Link to="/terms" className="underline">Terms of service</Link>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
      {/* Right Column: Order Summary */}
      <aside className="bg-[#f5f5f5] border-l border-gray-200 lg:sticky lg:top-0 self-start lg:h-screen lg:overflow-y-auto">
  <div className="w-full px-4 py-8 md:px-8 lg:px-12 space-y-6">
    
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-4">
          <div className="relative w-16 h-20 bg-white rounded-md border border-gray-200 overflow-hidden flex-shrink-0">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />

            <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {item.qty}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium truncate capitalize">
              {item.name}
            </h3>

            <p className=" text-gray-500">
              size: {item.size || item.variantName || 'One Size'}
            </p>
          </div>

          <div className="text-sm font-medium">
            {formatAUD(item.price * item.qty)}
          </div>
        </div>
      ))}
    </div>

    {/* <div className="flex gap-2">
      <input
        type="text"
        placeholder="Discount code or gift card"
        className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-1 focus:ring-black focus:border-black outline-none bg-white"
      />

      <button className="bg-[#f0f0f0] border border-gray-300 text-gray-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
        Apply
      </button>
    </div> */}

    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Subtotal</span>

        <span className="font-medium">
          {formatAUD(total)}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1 text-gray-600">
          <span>Shipping</span>
          <HelpCircle className="w-3.5 h-3.5" />
        </div>

        <span className="font-medium">
        {formatAUD(shippingFee)}
        </span>
      </div>

      <div className="flex justify-between pt-4">
        <div className="flex flex-col">
          <span className="text-lg font-bold">Total</span>

          <span className="text-[10px] text-gray-500 font-medium">
            Including {formatAUD(tax)} in taxes
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-xs text-gray-500">AUD</span>

          <span className="text-xl font-bold">
            {formatAUD(grandTotal)}
          </span>
        </div>
      </div>
    </div>
  </div>
</aside>
      </main>
    </div>
  );
}
