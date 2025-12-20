import { useCart } from '../context/CartContext';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { discountService } from '../services/discountService';

export default function Checkout() {
  const { items, total, clear } = useCart();
  const [discountCode, setDiscountCode] = useState('');
  const [appliedCode, setAppliedCode] = useState<{ code: string; discount: number } | null>(null);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [contactOptIn, setContactOptIn] = useState(false);
  const [shipping, setShipping] = useState<Record<string, any>>({ country: 'United States', firstName: '', lastName: '', company: '', address: '', address2: '', city: '', state: '', postcode: '', phone: '' });

  const discountAmount = useMemo(() => {
    if (!appliedCode) return 0;
    return appliedCode.discount;
  }, [appliedCode]);

  const grandTotal = useMemo(() => Math.max(0, total - discountAmount), [total, discountAmount]);

  const handleApply = async () => {
    if (!discountCode.trim()) {
      alert('Please enter a discount code');
      return;
    }

    try {
      const discountInfo = await discountService.validateCode(discountCode.trim().toUpperCase());
      if (discountInfo) {
        const discountValue = discountInfo.type === 'percent' 
          ? (total * discountInfo.value) / 100 
          : discountInfo.value;
        setAppliedCode({ code: discountCode.trim().toUpperCase(), discount: discountValue });
      } else {
        setAppliedCode(null);
        alert('Invalid discount code');
      }
    } catch {
      setAppliedCode(null);
      alert('Error validating discount code');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== FORM SUBMIT ===');
    console.log('Email:', email);
    console.log('Items count:', items.length);
    console.log('Items:', items);
    console.log('Total:', total);
    console.log('Grand Total:', grandTotal);
    
    if (!email.trim()) {
      alert('Please enter your email');
      return;
    }
    
    if (items.length === 0) {
      alert('Your cart is empty. Please add items before checkout.');
      return;
    }
    
    if (!shipping.firstName.trim() || !shipping.lastName.trim() || !shipping.address.trim() || !shipping.city.trim() || !shipping.postcode.trim()) {
      alert('Please fill in all required shipping fields');
      return;
    }

    const orderData = {
      email,
      items: items.map(item => ({
        id: typeof item.id === 'string' ? parseInt(item.id) : item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        image: item.image,
      })),
      total: grandTotal,
      discountCode: appliedCode?.code,
      shipping: {
        firstName: shipping.firstName,
        lastName: shipping.lastName,
        company: shipping.company,
        address: shipping.address,
        address2: shipping.address2,
        city: shipping.city,
        state: shipping.state,
        postcode: shipping.postcode,
        country: shipping.country,
        phone: shipping.phone,
        contactOptIn,
      },
    };

    console.log('Submitting order:', orderData);

    try {
      const result = await orderService.createOrder(orderData);
      console.log('Order created:', result);
      clear();
      navigate('/shipping');
    } catch (error) {
      console.error('Order error:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  return (
    <main className="bg-white">
      <section className="py-24 px-6 lg:px-12 max-w-screen-2xl mx-auto">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10">
          <div>
            <nav className="text-xs mb-6 text-gray-600">
              <span className="text-gray-800">Cart</span> <span className="mx-2">›</span> <span className="text-gray-800">Information</span> <span className="mx-2">›</span> <span>Shipping</span> <span className="mx-2">›</span> <span>Payment</span>
            </nav>

            <div className="mb-6">
              <p className="text-xs tracking-widest uppercase text-rose-gold mb-3">Express checkout</p>
              <div className="grid grid-cols-3 gap-3">
                <button className="px-4 py-3 rounded-md text-white" style={{ backgroundColor: '#5A31F4' }} onClick={() => navigate('/checkout')}>shop</button>
                <button className="px-4 py-3 rounded-md text-black" style={{ backgroundColor: '#FFDD00' }} onClick={() => navigate('/checkout')}>PayPal</button>
                <button className="px-4 py-3 rounded-md text-white" style={{ backgroundColor: '#000000' }} onClick={() => navigate('/checkout')}>G Pay</button>
              </div>
              <div className="flex items-center gap-4 my-4">
                <div className="flex-1 h-[1px] bg-gray-200" />
                <span className="text-xs text-gray-500">OR</span>
                <div className="flex-1 h-[1px] bg-gray-200" />
              </div>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
              <div>
                <h2 className="font-serif text-xl mb-3 text-hot-pink">Contact</h2>
                <input className="border px-4 py-3 w-full" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <label className="flex items-center gap-2 mt-3 text-sm text-gray-700">
                  <input type="checkbox" checked={contactOptIn} onChange={(e) => setContactOptIn(e.target.checked)} />
                  Email me news and offers
                </label>
              </div>

              <div>
                <h2 className="font-serif text-xl mb-3 text-hot-pink">Shipping address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select className="border px-4 py-3 md:col-span-2" value={shipping.country} onChange={(e) => setShipping({ ...shipping, country: e.target.value })}>
                    <option>United States</option>
                    <option>Australia</option>
                    <option>United Kingdom</option>
                    <option>Canada</option>
                  </select>
                  <input className="border px-4 py-3" placeholder="First name" value={shipping.firstName} onChange={(e) => setShipping({ ...shipping, firstName: e.target.value })} required />
                  <input className="border px-4 py-3" placeholder="Last name" value={shipping.lastName} onChange={(e) => setShipping({ ...shipping, lastName: e.target.value })} required />
                  <input className="border px-4 py-3 md:col-span-2" placeholder="Company (optional)" value={shipping.company} onChange={(e) => setShipping({ ...shipping, company: e.target.value })} />
                  <input className="border px-4 py-3 md:col-span-2" placeholder="Address" value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} required />
                  <input className="border px-4 py-3 md:col-span-2" placeholder="Apartment, suite, etc. (optional)" value={shipping.address2} onChange={(e) => setShipping({ ...shipping, address2: e.target.value })} />
                  <input className="border px-4 py-3" placeholder="City" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} required />
                  <select className="border px-4 py-3" value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })}>
                    <option>State/territory</option>
                    <option>Victoria</option>
                    <option>New South Wales</option>
                    <option>Queensland</option>
                  </select>
                  <input className="border px-4 py-3" placeholder="Postcode" value={shipping.postcode} onChange={(e) => setShipping({ ...shipping, postcode: e.target.value })} required />
                  <input className="border px-4 py-3 md:col-span-2" placeholder="Phone" value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} />
                </div>
                <label className="flex items-center gap-2 mt-3 text-sm text-gray-700">
                  <input type="checkbox" />
                  Add gift message
                </label>
              </div>

              <div className="flex items-center justify-between">
                <a href="/cart" className="text-gray-700 underline">Return to cart</a>
                <button type="submit" className="border-2 border-gray-900 text-gray-900 px-8 py-3 text-sm tracking-widest uppercase hover:bg-gray-900 hover:text-white transition-all duration-500">Continue to shipping</button>
              </div>
            </form>
          </div>

          <aside className="border rounded-md p-6 bg-white/70">
            <ul className="space-y-4 mb-6">
              {items.map((i) => (
                <li key={i.id} className="flex items-center gap-4">
                  <img src={i.image} alt={i.name} className="w-14 h-18 object-cover rounded" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{i.name}</p>
                    <p className="text-xs text-gray-500">Qty {i.qty}</p>
                  </div>
                  <p className="text-sm text-gray-800">${(i.price * i.qty).toFixed(2)}</p>
                </li>
              ))}
            </ul>

            <div className="flex gap-2 mb-6">
              <input value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} className="border px-4 py-3 flex-1" placeholder="Discount code or gift card" />
              <button type="button" onClick={handleApply} className="border px-4 py-3 text-sm tracking-widest uppercase border-hot-pink text-hot-pink hover:bg-hot-pink hover:text-white transition-all duration-300">Apply</button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal</span>
                <span className="text-gray-800">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Shipping</span>
                <span className="text-gray-500">Calculated at next step</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-hot-pink">
                  <span>Discount ({appliedCode?.code})</span>
                  <span>- ${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold mt-4">
                <span className="text-gray-800">Total</span>
                <span className="text-hot-pink">${grandTotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500">Including estimated taxes</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
