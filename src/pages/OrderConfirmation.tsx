import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag } from 'lucide-react';

export default function OrderConfirmation() {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <main className="bg-white min-h-[60vh] flex items-center justify-center">
      <section className="py-24 px-6 lg:px-12 max-w-screen-md mx-auto text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-hot-pink" />
        </div>
        
        <h1 className="font-serif text-4xl md:text-5xl mb-6 text-gray-900">Thank You!</h1>
        <p className="text-xl text-gray-600 mb-8">Your order has been successfully placed.</p>
        
        {orderId && (
          <div className="bg-gray-50 p-6 rounded-lg mb-8 inline-block">
            <p className="text-sm text-gray-500 uppercase tracking-widest mb-2">Order Reference</p>
            <p className="text-2xl font-semibold text-gray-900">#{orderId}</p>
          </div>
        )}
        
        <p className="text-gray-600 mb-12 max-w-lg mx-auto">
          We've sent a confirmation email with your order details. 
          We'll notify you as soon as your package ships.
        </p>
        
        <Link to="/shop" className="premium-button inline-flex items-center gap-2">
          <ShoppingBag className="w-4 h-4" />
          Continue Shopping
        </Link>
      </section>
    </main>
  );
}
