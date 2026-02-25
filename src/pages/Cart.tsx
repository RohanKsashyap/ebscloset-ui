import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import { formatAUD } from '../utils/storage';

export default function Cart() {
  const { items, removeItem, updateQty, total, clear } = useCart();
  const [availability, setAvailability] = useState<Record<string, { totalStock: number; available: boolean; sizeStock?: number }>>({});
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setChecking(true);
        const entries = await Promise.all(
          items.map(async (it) => {
            try {
              const p = await productService.getProduct(String(it.id));
              const stockMap: Record<string, number> = p?.stock ? p.stock : {};
              const totalStock = Object.values(stockMap || {}).reduce((s, n) => s + (Number(n) || 0), 0);
              const sizeStock = it.size ? Number(stockMap?.[it.size] || 0) : undefined;
              const available = it.size ? (sizeStock! > 0) : totalStock > 0;
              return [`${it.id}:${it.size ?? ''}`, { totalStock, available, sizeStock }] as const;
            } catch {
              return [`${it.id}:${it.size ?? ''}`, { totalStock: 0, available: true, sizeStock: 0 }] as const;
            }
          })
        );
        if (!cancelled) {
          const next: Record<string, { totalStock: number; available: boolean; sizeStock?: number }> = {};
          entries.forEach(([key, val]) => { next[key] = val; });
          setAvailability(next);
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    };
    if (items.length > 0) run();
    else setAvailability({});
    return () => { cancelled = true; };
  }, [items]);

  return (
    <main className="bg-white">
      <section className="py-12 md:py-24 px-4 sm:px-6 lg:px-12 max-w-screen-2xl mx-auto">
        <div className="text-center mb-10 md:mb-16">
          <h1 className="font-serif text-3xl md:text-6xl lg:text-7xl mb-4 md:mb-6 text-hot-pink">Your Bag</h1>
          <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-rose-gold">Premium picks for magical moments</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-700 mb-8">Your bag is empty.</p>
            <Link to="/shop" className="border-2 border-hot-pink text-hot-pink px-10 py-4 text-sm tracking-widest uppercase hover:bg-hot-pink hover:text-white transition-all duration-500">Shop Dresses</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {items.map((item) => (
                <div key={`${item.id}:${item.size ?? ''}`} className="flex gap-4 md:gap-6 border-b pb-6 md:border-none md:pb-0">
                  <img src={item.image} alt={item.name} className="w-20 h-28 md:w-24 md:h-32 object-cover bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-lg md:text-xl text-gray-800 mb-1 md:mb-2 truncate">{item.name}</h3>
                    <p className="text-hot-pink font-semibold mb-2 md:mb-3">{formatAUD(item.price)}</p>
                    {item.size && <p className="text-[11px] md:text-xs text-gray-700 mb-1">Size: {item.size}</p>}
                    <p className="text-[11px] md:text-xs text-gray-600 mb-3">
                      {checking ? 'Checking availability…' : (
                        availability[`${item.id}:${item.size ?? ''}`]?.available
                          ? (
                            (item.size
                              ? (availability[`${item.id}:${item.size ?? ''}`]?.sizeStock ?? 0)
                              : (availability[`${item.id}:${item.size ?? ''}`]?.totalStock ?? 0)
                            ) > 0
                              ? `${item.size ? (availability[`${item.id}:${item.size ?? ''}`]?.sizeStock ?? 0) : (availability[`${item.id}:${item.size ?? ''}`]?.totalStock ?? 0)} left`
                              : 'In stock'
                            )
                          : 'Out of stock'
                        )
                      }
                    </p>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <div className="flex items-center border rounded-lg overflow-hidden">
                        <button 
                          className="px-3 py-1 bg-gray-50 hover:bg-gray-100"
                          onClick={() => updateQty(item.id, Math.max(1, item.qty - 1), item.size)}
                        >-</button>
                        <span className="px-4 py-1 text-sm">{item.qty}</span>
                        <button 
                          className="px-3 py-1 bg-gray-50 hover:bg-gray-100"
                          onClick={() => {
                            const key = `${item.id}:${item.size ?? ''}`;
                            const max = item.size
                              ? (availability[key]?.sizeStock ?? item.qty + 1)
                              : (availability[key]?.totalStock ?? item.qty + 1);
                            updateQty(item.id, Math.min(item.qty + 1, max), item.size);
                          }}
                        >+</button>
                      </div>
                      <button onClick={() => removeItem(item.id, item.size)} className="text-gray-500 hover:text-red-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-4">
                <button onClick={clear} className="text-gray-400 hover:text-gray-600 text-xs uppercase tracking-widest font-bold">Clear Bag</button>
              </div>
            </div>
            <div className="lg:border lg:p-8 bg-gray-50 lg:bg-transparent rounded-2xl p-6 h-fit sticky top-32">
              <h2 className="font-serif text-xl mb-6 text-gray-900">Order Summary</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatAUD(total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-sm">Calculated at checkout</span>
                </div>
                <div className="border-t pt-4 flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-hot-pink">{formatAUD(total)}</span>
                </div>
              </div>
              <Link
                to="/checkout"
                className={`block text-center px-8 py-4 rounded-xl text-sm font-bold tracking-widest uppercase transition-all duration-500 shadow-lg ${Object.values(availability).some(a => a && !a.available) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-hot-pink text-white hover:bg-hot-pink/90 shadow-hot-pink/20'}`}
                aria-disabled={Object.values(availability).some(a => a && !a.available)}
                onClick={(e) => {
                  if (Object.values(availability).some(a => a && !a.available)) {
                    e.preventDefault();
                    alert('One or more items are out of stock. Please adjust your bag.');
                  }
                }}
              >
                Checkout
              </Link>
              <div className="mt-6 flex items-center justify-center gap-4 grayscale opacity-50">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="PayPal" />
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
