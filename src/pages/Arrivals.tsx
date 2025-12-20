import { Link } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext';

interface ArrivalItem {
  id: number | string;
  image: string;
  name: string;
  ageGroup: string;
  productId?: number;
}

export default function Arrivals() {
  const { newArrivals: products, loadingArrivals: loading } = useProductContext();

  if (loading) {
    return (
      <main className="bg-white">
        <section className="py-24 px-6 lg:px-12 max-w-screen-2xl mx-auto">
          <div className="text-center">
            <p className="text-gray-600">Loading products...</p>
          </div>
        </section>
      </main>
    );
  }

  const hasCatalog = products && products.length > 0;
  const visible: ArrivalItem[] = Array.from({ length: 12 }).map((_, i) => ({ id: i, image: '', name: `Dress ${i+1}`, ageGroup: 'Ages 3–13' }));

  return (
    <main className="bg-white">
      <section className="py-24 px-6 lg:px-12 max-w-screen-2xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl mb-6 text-hot-pink">New Arrivals</h1>
          <p className="text-sm tracking-[0.3em] uppercase text-rose-gold">Latest Dresses and Editor's Picks</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {hasCatalog ? (
            products.map((p) => {
              const productId = p.id ?? p._id;
              return (
                <div key={productId} className="premium-card overflow-hidden">
                  <Link to={`/product/${productId}`}>
                    <div className="aspect-[3/4] bg-gray-100">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                  </Link>
                  <div className="p-3 text-center">
                    <p className="text-sm text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-600">₹{p.price}</p>
                  </div>
                </div>
              );
            })
          ) : (
            visible.map((it, i) => (
              <div key={it.id} className="premium-card overflow-hidden">
                <Link to={typeof it.productId === 'number' ? `/product/${it.productId}` : '/shop'}>
                  <div className="aspect-[3/4] bg-gradient-to-br from-pink-50 via-white to-peach-50 flex items-center justify-center">
                    {it.image ? (
                      <img src={it.image} alt={it.name || `Dress ${i+1}`} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-24 h-32 rounded-2xl bg-white/70 border" />
                    )}
                  </div>
                </Link>
                <div className="p-3 text-center">
                  <p className="text-sm text-gray-800">{it.name || `Dress ${i+1}`}</p>
                  <p className="text-xs text-gray-600">{it.ageGroup || 'Ages 3–13'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
