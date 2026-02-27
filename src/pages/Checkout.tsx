import { useCart } from '../context/CartContext';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { discountService } from '../services/discountService';
import { orderService } from '../services/orderService';
import { formatAUD } from '../utils/storage';

export default function Checkout() {
  const { items, total, clear } = useCart();
  const [discountCode, setDiscountCode] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<{ type: 'percent' | 'amount'; value: number } | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [step, setStep] = useState<'information' | 'shipping' | 'payment'>('information');

  const [email, setEmail] = useState('');
  const [contactOptIn, setContactOptIn] = useState(false);
  const [shipping, setShipping] = useState<Record<string, any>>({ 
    country: 'United States', 
    firstName: '', 
    lastName: '', 
    company: '', 
    address: '', 
    address2: '', 
    city: '', 
    state: '', 
    postcode: '', 
    phone: '' 
  });
  
  const [shippingMethod, setShippingMethod] = useState('standard');

  const discountAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    return appliedDiscount.type === 'percent' ? total * (appliedDiscount.value / 100) : appliedDiscount.value;
  }, [appliedDiscount, total]);

  const shippingCost = useMemo(() => {
    if (step === 'information') return 0;
    return shippingMethod === 'express' ? 250 : 0;
  }, [step, shippingMethod]);

  const grandTotal = useMemo(() => Math.max(0, total - discountAmount + shippingCost), [total, discountAmount, shippingCost]);

  const handleApply = async () => {
    const code = discountCode.trim().toUpperCase();
    if (!code) return;
    const valid = await discountService.validateCode(code);
    if (valid) {
      setAppliedCode(valid.code);
      setAppliedDiscount({ type: valid.type, value: valid.value });
      showToast('Discount code applied!');
    } else {
      setAppliedCode(null);
      setAppliedDiscount(null);
      showToast('Invalid discount code', 'error');
    }
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('shipping');
    window.scrollTo(0, 0);
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
    window.scrollTo(0, 0);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await new Promise(resolve => setTimeout(resolve, 1500));
    const payload = { 
      customer: {
        fullName: `${shipping.firstName} ${shipping.lastName}`,
        email: email,
        phone: shipping.phone,
        address: `${shipping.address}${shipping.address2 ? ', ' + shipping.address2 : ''}`,
        city: shipping.city,
        postalCode: shipping.postcode,
        country: shipping.country
      },
      cart: items.map(i => ({ 
        productId: i.id, // Ensure this is the Mongo _id if available, otherwise backend might fail or fallback
        title: i.name, 
        unitPrice: i.price * 100, // backend expects cents
        quantity: i.qty,
        variantName: i.size || ''
      })), 
      shippingFee: shippingCost * 100 // backend expects cents
    };
    try {
      const res = await orderService.createOrder(payload);
      clear();
      showToast('Order placed successfully!');
      navigate('/order-confirmation', { state: { orderId: res.orderId } });
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to place order', 'error');
    }
  };

  return (
    <main className="bg-white">
      <section className="pt-24 pb-12 md:py-24 px-4 sm:px-6 lg:px-12 max-w-screen-2xl mx-auto">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20">
          <div className="order-2 lg:order-1">
            <nav className="text-[10px] md:text-xs mb-8 text-gray-600 flex items-center flex-wrap gap-2 uppercase tracking-widest">
              <button onClick={() => navigate('/cart')} className="text-hot-pink hover:text-rose-gold transition-colors">Cart</button>
              <span className="text-gray-400">›</span>
              <button 
                onClick={() => setStep('information')} 
                className={`${step === 'information' ? 'font-bold text-gray-900' : 'text-hot-pink hover:text-rose-gold transition-colors'}`}
              >
                Information
              </button>
              <span className="text-gray-400">›</span>
              <button 
                onClick={() => step !== 'information' && setStep('shipping')}
                disabled={step === 'information'}
                className={`${step === 'shipping' ? 'font-bold text-gray-900' : step === 'payment' ? 'text-hot-pink hover:text-rose-gold transition-colors' : 'text-gray-500'}`}
              >
                Shipping
              </button>
              <span className="text-gray-400">›</span>
              <span className={`${step === 'payment' ? 'font-bold text-gray-900' : 'text-gray-500'}`}>Payment</span>
            </nav>

            {step === 'information' && (
              <>
                <div className="mb-6">
                  <p className="text-xs tracking-widest uppercase text-rose-gold mb-3">Express checkout</p>
                  <div className="grid grid-cols-3 gap-3">
                    <button className="px-4 py-3 rounded-md text-white transition-opacity hover:opacity-90" style={{ backgroundColor: '#5A31F4' }}>shop</button>
                    <button className="px-4 py-3 rounded-md text-black transition-opacity hover:opacity-90" style={{ backgroundColor: '#FFDD00' }}>PayPal</button>
                    <button className="px-4 py-3 rounded-md text-white transition-opacity hover:opacity-90" style={{ backgroundColor: '#000000' }}>G Pay</button>
                  </div>
                  <div className="flex items-center gap-4 my-4">
                    <div className="flex-1 h-[1px] bg-gray-200" />
                    <span className="text-xs text-gray-500">OR</span>
                    <div className="flex-1 h-[1px] bg-gray-200" />
                  </div>
                </div>

                <form className="space-y-8" onSubmit={handleInfoSubmit}>
                  <div>
                    <h2 className="font-serif text-xl mb-3 text-hot-pink">Contact</h2>
                    <input className="border px-4 py-3 w-full focus:outline-none focus:border-hot-pink transition-colors" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <label className="flex items-center gap-2 mt-3 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={contactOptIn} onChange={(e) => setContactOptIn(e.target.checked)} className="accent-hot-pink" />
                      Email me news and offers
                    </label>
                  </div>

                  <div>
                    <h2 className="font-serif text-xl mb-3 text-hot-pink">Shipping address</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <select className="border px-4 py-3 md:col-span-2 focus:outline-none focus:border-hot-pink bg-white" value={shipping.country} onChange={(e) => setShipping({ ...shipping, country: e.target.value })}>
                        <option>United States</option>
                        <option>Australia</option>
                        <option>United Kingdom</option>
                        <option>Canada</option>
                      </select>
                      <input className="border px-4 py-3 focus:outline-none focus:border-hot-pink transition-colors" placeholder="First name" value={shipping.firstName} onChange={(e) => setShipping({ ...shipping, firstName: e.target.value })} required />
                      <input className="border px-4 py-3 focus:outline-none focus:border-hot-pink transition-colors" placeholder="Last name" value={shipping.lastName} onChange={(e) => setShipping({ ...shipping, lastName: e.target.value })} required />
                      <input className="border px-4 py-3 md:col-span-2 focus:outline-none focus:border-hot-pink transition-colors" placeholder="Company (optional)" value={shipping.company} onChange={(e) => setShipping({ ...shipping, company: e.target.value })} />
                      <input className="border px-4 py-3 md:col-span-2 focus:outline-none focus:border-hot-pink transition-colors" placeholder="Address" value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} required />
                      <input className="border px-4 py-3 md:col-span-2 focus:outline-none focus:border-hot-pink transition-colors" placeholder="Apartment, suite, etc. (optional)" value={shipping.address2} onChange={(e) => setShipping({ ...shipping, address2: e.target.value })} />
                      <input className="border px-4 py-3 focus:outline-none focus:border-hot-pink transition-colors" placeholder="City" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} required />
                      <select className="border px-4 py-3 focus:outline-none focus:border-hot-pink bg-white" value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })}>
                        <option>State/territory</option>
                        <option>Victoria</option>
                        <option>New South Wales</option>
                        <option>Queensland</option>
                        <option>California</option>
                        <option>New York</option>
                        <option>Texas</option>
                      </select>
                      <input className="border px-4 py-3 focus:outline-none focus:border-hot-pink transition-colors" placeholder="Postcode" value={shipping.postcode} onChange={(e) => setShipping({ ...shipping, postcode: e.target.value })} required />
                      <input className="border px-4 py-3 md:col-span-2 focus:outline-none focus:border-hot-pink transition-colors" placeholder="Phone" value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} />
                    </div>
                    <label className="flex items-center gap-2 mt-3 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" className="accent-hot-pink" />
                      Add gift message
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <a href="/cart" className="text-gray-700 hover:text-hot-pink transition-colors underline">Return to cart</a>
                    <button type="submit" className="bg-gray-900 text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-gray-800 transition-all duration-300">Continue to shipping</button>
                  </div>
                </form>
              </>
            )}

            {step === 'shipping' && (
              <form className="space-y-8" onSubmit={handleShippingSubmit}>
                <div className="border rounded-md p-4 divide-y">
                  <div className="flex justify-between py-2 text-sm">
                    <div className="text-gray-500 w-20">Contact</div>
                    <div className="text-gray-900 flex-1 px-4">{email}</div>
                    <button type="button" onClick={() => setStep('information')} className="text-hot-pink hover:text-rose-gold text-xs underline">Change</button>
                  </div>
                  <div className="flex justify-between py-2 text-sm pt-4">
                    <div className="text-gray-500 w-20">Ship to</div>
                    <div className="text-gray-900 flex-1 px-4">{shipping.address}, {shipping.city} {shipping.state} {shipping.postcode}, {shipping.country}</div>
                    <button type="button" onClick={() => setStep('information')} className="text-hot-pink hover:text-rose-gold text-xs underline">Change</button>
                  </div>
                </div>

                <div>
                  <h2 className="font-serif text-xl mb-3 text-hot-pink">Shipping method</h2>
                  <div className="border rounded-md divide-y">
                    <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="shipping" 
                          value="standard" 
                          checked={shippingMethod === 'standard'} 
                          onChange={(e) => setShippingMethod(e.target.value)}
                          className="accent-hot-pink w-4 h-4"
                        />
                        <span className="text-sm text-gray-900">Standard Shipping (3-5 business days)</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">Free</span>
                    </label>
                    <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="shipping" 
                          value="express" 
                          checked={shippingMethod === 'express'} 
                          onChange={(e) => setShippingMethod(e.target.value)}
                          className="accent-hot-pink w-4 h-4"
                        />
                        <span className="text-sm text-gray-900">Express Shipping (1-2 business days)</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{formatAUD(250)}</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button type="button" onClick={() => setStep('information')} className="text-gray-700 hover:text-hot-pink transition-colors underline">Return to information</button>
                  <button type="submit" className="bg-gray-900 text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-gray-800 transition-all duration-300">Continue to payment</button>
                </div>
              </form>
            )}

            {step === 'payment' && (
              <form className="space-y-8" onSubmit={handlePaymentSubmit}>
                <div className="border rounded-md p-4 divide-y">
                  <div className="flex justify-between py-2 text-sm">
                    <div className="text-gray-500 w-20">Contact</div>
                    <div className="text-gray-900 flex-1 px-4">{email}</div>
                    <button type="button" onClick={() => setStep('information')} className="text-hot-pink hover:text-rose-gold text-xs underline">Change</button>
                  </div>
                  <div className="flex justify-between py-2 text-sm pt-4 pb-4">
                    <div className="text-gray-500 w-20">Ship to</div>
                    <div className="text-gray-900 flex-1 px-4">{shipping.address}, {shipping.city} {shipping.state} {shipping.postcode}, {shipping.country}</div>
                    <button type="button" onClick={() => setStep('information')} className="text-hot-pink hover:text-rose-gold text-xs underline">Change</button>
                  </div>
                  <div className="flex justify-between py-2 text-sm pt-4">
                    <div className="text-gray-500 w-20">Method</div>
                    <div className="text-gray-900 flex-1 px-4">{shippingMethod === 'standard' ? 'Standard Shipping · Free' : `Express Shipping · ${formatAUD(250)}`}</div>
                    <button type="button" onClick={() => setStep('shipping')} className="text-hot-pink hover:text-rose-gold text-xs underline">Change</button>
                  </div>
                </div>

                <div>
                  <h2 className="font-serif text-xl mb-3 text-hot-pink">Payment</h2>
                  <p className="text-sm text-gray-500 mb-4">All transactions are secure and encrypted.</p>
                  
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" checked readOnly className="accent-hot-pink w-4 h-4" />
                        <span className="text-sm font-semibold text-gray-900">Credit card</span>
                      </label>
                      <div className="flex gap-2">
                        {/* Simple card icons placeholders */}
                        <div className="w-8 h-5 bg-blue-600 rounded"></div>
                        <div className="w-8 h-5 bg-orange-500 rounded"></div>
                        <div className="w-8 h-5 bg-red-600 rounded"></div>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-4 bg-gray-50/50">
                      <input className="border px-4 py-3 w-full bg-white focus:outline-none focus:border-hot-pink transition-colors" placeholder="Card number" required />
                      <div className="grid grid-cols-2 gap-4">
                        <input className="border px-4 py-3 w-full bg-white focus:outline-none focus:border-hot-pink transition-colors" placeholder="Expiration date (MM / YY)" required />
                        <input className="border px-4 py-3 w-full bg-white focus:outline-none focus:border-hot-pink transition-colors" placeholder="Security code" required />
                      </div>
                      <input className="border px-4 py-3 w-full bg-white focus:outline-none focus:border-hot-pink transition-colors" placeholder="Name on card" required />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="font-serif text-xl mb-3 text-hot-pink">Billing address</h2>
                  <div className="border rounded-md divide-y">
                    <label className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                      <input type="radio" name="billing" defaultChecked className="accent-hot-pink w-4 h-4" />
                      <span className="text-sm text-gray-900">Same as shipping address</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                      <input type="radio" name="billing" className="accent-hot-pink w-4 h-4" />
                      <span className="text-sm text-gray-900">Use a different billing address</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button type="button" onClick={() => setStep('shipping')} className="text-gray-700 hover:text-hot-pink transition-colors underline">Return to shipping</button>
                  <button type="submit" className="bg-gray-900 text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-gray-800 transition-all duration-300 w-full sm:w-auto">Pay now</button>
                </div>
              </form>
            )}
          </div>

          <aside className="order-1 lg:order-2 border rounded-2xl p-6 md:p-8 bg-gray-50/50 lg:bg-white/70 h-fit lg:sticky lg:top-32 shadow-sm">
            <h2 className="font-serif text-xl mb-6 text-gray-900 hidden lg:block">Order Summary</h2>
            <ul className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {items.map((i) => (
                <li key={i.id} className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <img src={i.image} alt={i.name} className="w-16 h-20 object-cover rounded-lg border shadow-sm" />
                    <span className="absolute -top-2 -right-2 bg-hot-pink text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-md font-bold">
                      {i.qty}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{i.name}</p>
                    {i.size && <p className="text-xs text-gray-500">Size: {i.size}</p>}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 flex-shrink-0">{formatAUD(i.price * i.qty)}</p>
                </li>
              ))}
              {items.length === 0 && (
                <li className="text-sm text-gray-500 text-center py-4 italic">Your cart is empty.</li>
              )}
            </ul>

            <div className="flex gap-2 mb-6 border-t border-b py-6">
              <input 
                value={discountCode} 
                onChange={(e) => setDiscountCode(e.target.value)} 
                className="border rounded-xl px-4 py-3 flex-1 focus:outline-none focus:ring-2 focus:ring-hot-pink/20 focus:border-hot-pink transition-all text-sm bg-white" 
                placeholder="Discount code" 
              />
              <button 
                type="button" 
                onClick={handleApply} 
                className="bg-gray-900 text-white px-6 py-3 text-xs tracking-widest uppercase rounded-xl hover:bg-gray-800 transition-all shadow-md active:scale-95"
              >
                Apply
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900 font-semibold">{formatAUD(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="text-gray-900 font-semibold">{shippingCost ? formatAUD(shippingCost) : 'Free'}</span>
              </div>
              {appliedCode && (
                <div className="flex justify-between text-hot-pink font-medium">
                  <span>Discount ({appliedCode})</span>
                  <span>-{formatAUD(discountAmount)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center border-t pt-6 mt-6">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <div className="text-right">
                <span className="text-2xl font-serif text-gray-900 block leading-none">{formatAUD(grandTotal)}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Includes taxes</span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
