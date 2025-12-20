import { useParams } from 'react-router-dom';
import type { Product } from '../services/productService';
import { loadArrivalProducts } from '../utils/storage';
import { useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';
import Gallery from '../components/Gallery';
import StickyBuyBar from '../components/StickyBuyBar';

export default function ArrivalsDetail() {
  const { id } = useParams();
  const catalog = useMemo<Product[]>(() => loadArrivalProducts(), []);
  const product = catalog.find((p) => String(p.id) === String(id));
  const { addItem } = useCart();
  const [size, setSize] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [pinMsg, setPinMsg] = useState<string>('');

  if (!product) return (
    <main className="bg-white">
      <section className="py-24 px-6 lg:px-12 max-w-screen-2xl mx-auto">
        <h1 className="font-serif text-3xl">Item not found</h1>
      </section>
    </main>
  );

  const handleAdd = () => {
    const label = size ? `${product.name} (${size})` : product.name;
    const productId = product.id ?? product._id ?? String(product.name).split(' ').join('_');
    addItem({ id: productId, name: label, image: product.image, price: product.price });
  };

  return (
    <main className="bg-white">
      <section className="py-24 px-6 lg:px-12 max-w-screen-2xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <Gallery images={product.images?.length ? product.images : [product.image]} />
          </div>
          <div className="premium-card p-6 md:p-8">
            <p className="text-xs tracking-widest uppercase text-gray-600 mb-2">New Arrivals</p>
            <h1 className="font-serif text-3xl md:text-4xl mb-2 text-gray-800">{product.name}</h1>
            <div className="flex items-baseline gap-3 mb-4">
              <p className="text-2xl font-semibold">${product.price}</p>
              <span className="text-xs tracking-widest uppercase text-gray-500">Inclusive of taxes</span>
            </div>
            <div className="text-sm text-hot-pink mb-6">Extra 10% off with code MAGIC10</div>

            {(product.size || product.sizes) && (product.size?.length || product.sizes?.length) ? (
              <div className="mb-6">
                <p className="text-sm mb-2">Select Size</p>
                <div className="grid grid-cols-4 gap-2 max-w-xs">
                  {(product.size || product.sizes)?.map((s) => (
                    <button key={s} onClick={() => setSize(s)} className={`h-10 text-sm transition-all duration-300 border ${size===s ? 'bg-black text-white border-black' : 'border-gray-900 text-gray-900 hover:bg-black hover:text-white'}`}>{s}</button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mb-6">
              <p className="text-xs tracking-widest uppercase text-gray-600 mb-2">Check Delivery</p>
              <div className="flex gap-2 max-w-sm">
                <input value={pin} onChange={(e) => setPin(e.target.value)} className="border px-4 py-2 flex-1" placeholder="PIN code" />
                <button className="premium-button w-[140px]" onClick={() => {
                  if (/^\d{6}$/.test(pin)) setPinMsg('Delivers in 3–5 days to your area'); else setPinMsg('Enter a valid 6-digit PIN');
                }}>Check</button>
              </div>
              {!!pinMsg && <p className="text-sm text-gray-700 mt-2">{pinMsg}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => { if (!size) { alert('Please select a size'); return; } handleAdd(); }} className="premium-button inverse w-full sm:w-auto">Add to Bag</button>
              <a href="/checkout" className="premium-button w-full sm:w-auto">Buy Now</a>
            </div>
            <div className="mt-4 text-xs text-gray-700">
              <p>Free shipping over $100 • Easy 30-day returns</p>
            </div>
          </div>
        </div>
      </section>

      <StickyBuyBar name={product.name} price={product.price} disabled={!size} onAdd={() => { if (!size) return; handleAdd(); }} />
    </main>
  );
}
