import { useCart } from '../context/CartContext';
import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { authService, User, Address } from '../services/authService';
import { formatAUD } from '../utils/storage';
import { ShoppingBag, X, Check, MapPin, ChevronDown, Lock, Search, HelpCircle } from 'lucide-react';
import CheckoutHeader from '../components/checkout/CheckoutHeader';

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

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [outOfStockItems, setOutOfStockItems] = useState<string[]>([]);
  const [isCheckingStock, setIsCheckingStock] = useState(false);

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
      paymentMethod: paymentMethod === 'cod' ? 'COD' : paymentMethod.toUpperCase()
    };

    try {
      if (paymentMethod === 'card') {
        const res = await orderService.createStripeSession(payload);
        if (res.url) {
          window.location.href = res.url;
          return;
        }
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

                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Address"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-1 focus:ring-black focus:border-black transition-all outline-none text-sm"
                    value={shipping.address}
                    onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
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

            {/* Payment Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-medium">Payment</h2>
                  <p className="text-xs text-gray-500">All transactions are secure and encrypted.</p>
                </div>
                {/* <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-6" /> */}
              </div>
              
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <button 
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full flex items-center justify-between p-4 text-left transition-colors ${paymentMethod === 'card' ? 'bg-[#f0f9ff]' : 'bg-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'card' ? 'border-black' : 'border-gray-300'}`}>
                      {paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-black"></div>}
                    </div>
                    <span className="text-sm font-medium">Card</span>
                  </div>
                  <div className="flex gap-1">
                    {/* <div className="w-8 h-5 bg-white border border-gray-200 rounded flex items-center justify-center">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="stripe" className="h-2" />
                    </div> */}
                    {/* <div className="w-8 h-5 bg-white border border-gray-200 rounded flex items-center justify-center">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-3" />
                    </div>
                    <div className="w-8 h-5 bg-white border border-gray-200 rounded flex items-center justify-center">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg" alt="Amex" className="h-3" />
                    </div>
                    <div className="w-8 h-5 bg-white border border-gray-200 rounded flex items-center justify-center">
                      <span className="text-[8px] text-gray-400 font-bold">+2</span>
                    </div> */}
                  </div>
                </button>

                {/* {paymentMethod === 'card' && (
                  <div className="p-4 bg-[#f8f8f8] border-t border-gray-200 space-y-3 animate-fadeIn">
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Card number"
                        className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-1 focus:ring-black focus:border-black transition-all outline-none text-sm"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        placeholder="Expiration date (MM / YY)"
                        className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-1 focus:ring-black focus:border-black transition-all outline-none text-sm"
                      />
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Security code"
                          className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-1 focus:ring-black focus:border-black transition-all outline-none text-sm"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                        </div>
                      </div>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Name on card"
                      className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-1 focus:ring-black focus:border-black transition-all outline-none text-sm"
                    />
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <div className="relative flex items-center justify-center">
                        <input type="checkbox" className="peer sr-only" defaultChecked />
                        <div className="w-5 h-5 border border-gray-300 rounded bg-white peer-checked:bg-hot-pink peer-checked:border-hot-pink transition-all"></div>
                        <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-xs text-gray-600">Use shipping address as billing address</span>
                    </label>
                  </div>
                )} */}

                {/* <button 
                  onClick={() => setPaymentMethod('cod')}
                  className={`w-full flex items-center justify-between p-4 text-left transition-colors border-t border-gray-200 ${paymentMethod === 'cod' ? 'bg-[#f0f9ff]' : 'bg-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'cod' ? 'border-black' : 'border-gray-300'}`}>
                      {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-black"></div>}
                    </div>
                    <span className="text-sm font-medium">Cash on Delivery (COD)</span>
                  </div>
                </button> */}
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
