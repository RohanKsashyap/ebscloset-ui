import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { items, removeItem, updateQty, total, clear } = useCart();

  return (
    <main className="bg-white">
      <section className="py-24 px-6 lg:px-12 max-w-screen-2xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl mb-6 text-hot-pink">Your Bag</h1>
          <p className="text-sm tracking-[0.3em] uppercase text-rose-gold">Premium picks for magical moments</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-700 mb-6">Your bag is empty.</p>
            <Link to="/shop" className="border-2 border-hot-pink text-hot-pink px-8 py-3 text-sm tracking-widest uppercase hover:bg-hot-pink hover:text-white transition-all duration-500">Shop Dresses</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-8">
              {items.map((item) => (
                <div key={item.id} className="flex gap-6">
                  <img src={item.image} alt={item.name} className="w-24 h-32 object-cover bg-gray-100" />
                  <div className="flex-1">
                    <h3 className="font-serif text-xl text-gray-800 mb-2">{item.name}</h3>
                    <p className="text-hot-pink font-semibold mb-3">${item.price}</p>
                    <div className="flex items-center gap-3">
                      <input type="number" min={1} value={item.qty} onChange={(e) => updateQty(item.id, Number(e.target.value))} className="w-20 border px-3 py-2" />
                      <button onClick={() => removeItem(item.id)} className="text-gray-700 underline">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={clear} className="text-gray-700 underline">Clear Bag</button>
            </div>
            <div className="border p-6">
              <p className="text-gray-700 mb-2">Subtotal</p>
              <p className="text-2xl font-semibold text-hot-pink mb-6">${total.toFixed(2)}</p>
              <Link to="/checkout" className="block text-center border-2 border-hot-pink text-hot-pink px-8 py-3 text-sm tracking-widest uppercase hover:bg-hot-pink hover:text-white transition-all duration-500">Checkout</Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

