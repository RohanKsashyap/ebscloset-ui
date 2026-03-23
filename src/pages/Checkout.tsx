import { useCart } from '../context/CartContext';
import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { orderService } from '../services/orderService';
import { authService, User, Address } from '../services/authService';
import { formatAUD } from '../utils/storage';
import { ShoppingBag, X, Check, MapPin, ChevronDown } from 'lucide-react';

export default function Checkout() {
  const { items: cartItems, total: cartTotal, clear } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  const buyNowItem = location.state?.buyNowItem;
  const items = useMemo(() => buyNowItem ? [buyNowItem] : cartItems, [buyNowItem, cartItems]);
  const total = useMemo(() => buyNowItem ? buyNowItem.price * buyNowItem.qty : cartTotal, [buyNowItem, cartTotal]);
  
  const [email, setEmail] = useState('');
  const [shipping, setShipping] = useState({ 
    fullName: '',
    address: '', 
    city: '', 
    postcode: '', 
    phone: '',
    country: 'United States'
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'apple' | 'paypal' | 'google'>('card');
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

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
        setEmail(userData.email);
        setAddresses(userAddresses);

        // Pre-fill with primary address
        const primary = userAddresses.find(a => a.isPrimary) || userAddresses[0];
        if (primary) {
          setShipping({
            fullName: primary.fullName,
            address: primary.address,
            city: primary.city,
            postcode: primary.postalCode,
            phone: primary.phone,
            country: primary.country || 'United States'
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

  const tax = useMemo(() => total * 0.08, [total]);
  const grandTotal = useMemo(() => total + tax, [total, tax]);

  const selectAddress = (addr: Address) => {
    setShipping({
      fullName: addr.fullName,
      address: addr.address,
      city: addr.city,
      postcode: addr.postalCode,
      phone: addr.phone,
      country: addr.country || 'United States'
    });
    setShowAddressDropdown(false);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipping.fullName || !shipping.address || !shipping.city || !shipping.postcode) {
      showToast('Please fill in all shipping details', 'error');
      return;
    }

    setIsPlacingOrder(true);
    const payload = { 
      customer: {
        fullName: shipping.fullName,
        email: email || (user?.email) || 'guest@example.com',
        phone: shipping.phone,
        address: shipping.address,
        city: shipping.city,
        postalCode: shipping.postcode,
        country: shipping.country
      },
      cart: items.map(i => ({ 
        productId: i.id,
        title: i.name, 
        unitPrice: i.price * 100,
        quantity: i.qty,
        variantName: i.size || ''
      })), 
      shippingFee: 0,
      paymentMethod: paymentMethod === 'cod' ? 'COD' : paymentMethod.toUpperCase()
    };

    try {
      const res = await orderService.createOrder(payload);
      if (!buyNowItem) clear();
      showToast('Order placed successfully!');
      navigate('/order-confirmation', { state: { orderId: res.orderId } });
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
    <div className="min-h-screen bg-white font-sans text-black">
      {/* Header */}
      <header className="border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-50">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold tracking-tighter uppercase cursor-pointer" onClick={() => navigate('/')}>Atelier Checkout</h1>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="/shop" className="hover:text-black transition-colors">Shop</a>
            <a href="/collection" className="hover:text-black transition-colors">Collection</a>
            <a href="/about" className="hover:text-black transition-colors">About</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer" onClick={() => navigate('/cart')}>
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
              {items.length}
            </span>
          </div>
          <X className="w-5 h-5 cursor-pointer" onClick={() => navigate('/cart')} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 md:px-8 lg:px-12 grid lg:grid-cols-[1fr,400px] gap-16">
        {/* Left Column: Form Sections */}
        <div className="space-y-16">
          {/* Step 01: Shipping */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold tracking-tight">Shipping</h2>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Step 01</span>
            </div>
            
            {/* Address Selector for Auth Users */}
            {addresses.length > 0 && (
              <div className="mb-8 relative">
                <button 
                  onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                  className="w-full flex items-center justify-between bg-[#F9F9F9] border border-gray-100 rounded-2xl px-6 py-4 hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Deliver to</p>
                      <p className="text-sm font-bold truncate max-w-[200px] md:max-w-[400px]">
                        {shipping.address}, {shipping.city}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showAddressDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showAddressDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-3xl shadow-2xl z-20 overflow-hidden animate-scaleIn origin-top">
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {addresses.map((addr) => (
                        <button
                          key={addr._id}
                          onClick={() => selectAddress(addr)}
                          className="w-full flex items-center gap-4 px-6 py-5 hover:bg-gray-50 border-b border-gray-50 last:border-none transition-colors text-left"
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${shipping.address === addr.address ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {shipping.address === addr.address ? <Check className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm">{addr.fullName}</p>
                            <p className="text-xs text-gray-500 truncate">{addr.address}, {addr.city}</p>
                          </div>
                          {addr.isPrimary && (
                            <span className="text-[8px] font-bold tracking-widest uppercase bg-gray-100 px-2 py-1 rounded">Default</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Julianne Moore"
                    className="w-full bg-[#F0F0F0] border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-black transition-all"
                    value={shipping.fullName}
                    onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="julianne@example.com"
                    className="w-full bg-[#F0F0F0] border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-black transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Address</label>
                <input 
                  type="text" 
                  placeholder="742 Evergreen Terrace"
                  className="w-full bg-[#F0F0F0] border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-black transition-all"
                  value={shipping.address}
                  onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500">City</label>
                  <input 
                    type="text" 
                    placeholder="Springfield"
                    className="w-full bg-[#F0F0F0] border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-black transition-all"
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Zip Code</label>
                  <input 
                    type="text" 
                    placeholder="62704"
                    className="w-full bg-[#F0F0F0] border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-black transition-all"
                    value={shipping.postcode}
                    onChange={(e) => setShipping({ ...shipping, postcode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Phone</label>
                  <input 
                    type="text" 
                    placeholder="+1 (555) 000"
                    className="w-full bg-[#F0F0F0] border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-black transition-all"
                    value={shipping.phone}
                    onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Step 02: Review */}
          <section>
            <div className="flex items-center justify-between mb-8 text-black">
              <h2 className="text-4xl font-bold tracking-tight">Review</h2>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Step 02</span>
            </div>
            <div className="space-y-8">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-6">
                  <div className="w-24 h-32 bg-gray-100 rounded-3xl overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold truncate">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-tight">
                      Size: {item.size || 'N/A'} | Color: {item.color || 'Default'}
                    </p>
                    <p className="text-sm font-bold mt-2">Qty: {item.qty}</p>
                  </div>
                  <div className="text-lg font-bold">
                    {formatAUD(item.price * item.qty)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Step 03: Payment */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold tracking-tight">Payment</h2>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Step 03</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <button 
                onClick={() => setPaymentMethod('apple')}
                className={`flex flex-col items-center justify-center gap-2 py-6 rounded-3xl border-2 transition-all ${paymentMethod === 'apple' ? 'bg-black text-white border-black shadow-lg scale-[1.02]' : 'bg-[#F0F0F0] border-transparent hover:bg-gray-200'}`}
              >
                <div className={`w-6 h-6 rounded flex items-center justify-center ${paymentMethod === 'apple' ? 'bg-white' : 'bg-black'}`}>
                  <div className={`w-3 h-3 rounded-full ${paymentMethod === 'apple' ? 'bg-black' : 'bg-white'}`} />
                </div>
                <span className="text-[8px] font-bold tracking-[0.2em] uppercase">Apple Pay</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('paypal')}
                className={`flex flex-col items-center justify-center gap-2 py-6 rounded-3xl border-2 transition-all ${paymentMethod === 'paypal' ? 'bg-[#003087] text-white border-[#003087] shadow-lg scale-[1.02]' : 'bg-[#F0F0F0] border-transparent hover:bg-gray-200'}`}
              >
                <div className={`w-6 h-6 rounded flex items-center justify-center ${paymentMethod === 'paypal' ? 'bg-white' : 'bg-black'}`}>
                  <div className={`w-3 h-1.5 rounded-sm ${paymentMethod === 'paypal' ? 'bg-[#003087]' : 'bg-white'}`} />
                </div>
                <span className="text-[8px] font-bold tracking-[0.2em] uppercase">PayPal</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('google')}
                className={`flex flex-col items-center justify-center py-6 rounded-3xl border-2 transition-all ${paymentMethod === 'google' ? 'bg-white text-black border-black shadow-lg scale-[1.02]' : 'bg-[#F0F0F0] border-transparent hover:bg-gray-200'}`}
              >
                <span className="text-xl font-bold tracking-tighter uppercase">Google</span>
                <span className="text-[8px] font-bold tracking-[0.2em] uppercase">Google Pay</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('cod')}
                className={`flex flex-col items-center justify-center gap-2 py-6 rounded-3xl border-2 transition-all ${paymentMethod === 'cod' ? 'bg-black text-white border-black shadow-lg scale-[1.02]' : 'bg-[#F0F0F0] border-transparent hover:bg-gray-200'}`}
              >
                <div className={`w-6 h-6 rounded flex items-center justify-center ${paymentMethod === 'cod' ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  <span className="text-[10px] font-black">$</span>
                </div>
                <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-center leading-tight">Cash on<br/>Delivery</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center mb-12">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <span className="relative bg-white px-4 text-[8px] font-bold tracking-[0.2em] uppercase text-gray-400">
                {paymentMethod === 'card' ? 'Credit Card Details' : 'Payment Selection'}
              </span>
            </div>

            {paymentMethod === 'card' ? (
              <div className="bg-[#F9F9F9] p-8 rounded-[40px] space-y-6 animate-fadeIn">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Card Number</label>
                  <input 
                    type="text" 
                    placeholder="0000 0000 0000 0000"
                    className="w-full bg-white border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-black transition-all shadow-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Expiry Date</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY"
                      className="w-full bg-white border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-black transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500">CVC</label>
                    <input 
                      type="text" 
                      placeholder="123"
                      className="w-full bg-white border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-black transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#F9F9F9] p-12 rounded-[40px] text-center space-y-4 animate-scaleIn border-2 border-black/5">
                <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tight">
                  {paymentMethod === 'cod' ? 'Cash on Delivery Selected' : `${paymentMethod} Selected`}
                </h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  {paymentMethod === 'cod' 
                    ? 'You will pay for your order in cash when it arrives at your doorstep.'
                    : `Your ${paymentMethod} account will be used to complete this transaction securely.`}
                </p>
                <button 
                  onClick={() => setPaymentMethod('card')}
                  className="text-[10px] font-bold tracking-widest uppercase text-gray-400 hover:text-black transition-colors underline pt-4"
                >
                  Switch to Credit Card
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Order Summary */}
        <aside className="lg:sticky lg:top-32 h-fit space-y-8">
          <div className="bg-[#F9F9F9] p-10 rounded-[48px] space-y-8">
            <h2 className="text-2xl font-bold">Order Summary</h2>
            
            <div className="space-y-4 text-sm font-medium">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatAUD(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="text-black">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Taxes (Estimated)</span>
                <span>{formatAUD(tax)}</span>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-200">
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Total Amount</p>
              <p className="text-5xl font-bold tracking-tighter">{formatAUD(grandTotal)}</p>
            </div>

            <button 
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || isLoading}
              className={`w-full bg-[#B11B67] text-white py-6 rounded-full font-bold tracking-widest uppercase text-sm transition-all flex items-center justify-center gap-2 ${isPlacingOrder || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
            >
              {isPlacingOrder ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Placing Order...
                </>
              ) : (
                'Place Order'
              )}
            </button>

            <p className="text-[8px] font-bold tracking-[0.2em] uppercase text-center text-gray-400">
              Secure transaction encrypted by Atelier Systems
            </p>
          </div>

          {/* Member Points Box */}
          <div className="bg-[#FFE4EF] p-8 rounded-[40px] relative overflow-hidden group">
            <div className="absolute top-4 right-4 bg-[#B11B67] text-white text-[8px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              Atelier Member
            </div>
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 bg-[#B11B67] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2.5 h-2 bg-white rounded-sm transform rotate-45" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#B11B67]">
                  You're earning {Math.floor(grandTotal)} points with this purchase.
                </p>
                <p className="text-xs text-[#B11B67]/70 mt-1">
                  Unlock priority access to our upcoming FW24 release.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
