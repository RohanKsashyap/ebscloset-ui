import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { orderService, Order } from '../services/orderService';

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id') || location.state?.orderId;
    const payNow = params.get('payNow') === 'true';
    const paymentStatus = params.get('payment');

    if (id) {
      setOrderId(id);
      fetchOrder(id, payNow);
    } else {
      setLoading(false);
    }

    if (paymentStatus === 'success') {
      // Show success message if redirected back from Stripe
    }
  }, [location]);

  const fetchOrder = async (id: string, autoPay: boolean) => {
    try {
      const data = await orderService.getOrder(id);
      setOrder(data);
      if (autoPay && data.paymentMethod?.toLowerCase() === 'cod' && data.status?.toLowerCase() === 'pending') {
        handlePayNow(id);
      }
    } catch (err) {
      console.error('Failed to fetch order:', err);
      setError('Could not retrieve order details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (id: string) => {
    try {
      setIsPaying(true);
      const { url } = await orderService.createPaymentSession(id);
      window.location.href = url;
    } catch (err) {
      console.error('Payment initiation failed:', err);
      alert('Failed to initiate payment. Please try again later.');
      setIsPaying(false);
    }
  };

  const params = new URLSearchParams(location.search);
  const paymentStatus = params.get('payment');

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-hot-pink animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading order details...</p>
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen">
      <header className="px-6 py-6 md:px-12 bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link 
            to="/" 
            className="text-2xl font-black uppercase tracking-widest text-hot-pink hover:opacity-90 transition-opacity font-headline"
          >
            EB'S CLOSET
          </Link>
          <Link 
            to="/cart" 
            className="relative p-2 text-hot-pink hover:opacity-80 transition-colors"
          >
            <ShoppingBag className="w-6 h-6" />
          </Link>
        </div>
      </header>

      <section className="py-24 px-6 lg:px-12 max-w-screen-md mx-auto text-center">
        <div className="flex justify-center mb-6">
          {paymentStatus === 'success' ? (
            <CheckCircle className="w-20 h-20 text-green-500" />
          ) : paymentStatus === 'cancel' ? (
            <AlertCircle className="w-20 h-20 text-amber-500" />
          ) : (
            <CheckCircle className="w-20 h-20 text-hot-pink" />
          )}
        </div>
        
        <h1 className="text-4xl md:text-5xl font-medium mb-6 text-gray-900 uppercase tracking-tight">
          {paymentStatus === 'success' ? 'Payment Successful!' : 
           paymentStatus === 'cancel' ? 'Payment Cancelled' : 
           'Thank You!'}
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 font-light">
          {paymentStatus === 'success' ? 'Your payment has been received and your order is being processed.' :
           paymentStatus === 'cancel' ? 'Your order is still confirmed as Cash on Delivery. You can try paying online again below.' :
           'Your order has been successfully placed.'}
        </p>
        
        {orderId && (
          <div className="bg-gray-50 p-6 rounded-lg mb-8 inline-block border border-gray-100">
            <p className="text-sm text-gray-500 uppercase tracking-widest mb-2 font-bold">Order Reference</p>
            <p className="text-2xl font-black text-hot-pink tracking-widest">
              {order?.orderId || `#${orderId}`}
            </p>
            {order && (
              <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest">
                Payment: <span className="font-bold text-gray-600">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}</span>
              </p>
            )}
          </div>
        )}

        {/* Pay Now Button for COD orders */}
        {order && order.paymentMethod?.toLowerCase() === 'cod' && order.status?.toLowerCase() === 'pending' && (
          <div className="mb-12 p-8 bg-hot-pink/5 rounded-2xl border border-hot-pink/10 max-w-sm mx-auto">
            <h3 className="text-lg font-bold mb-2 uppercase tracking-wide">Want to pay now?</h3>
            <p className="text-sm text-gray-500 mb-6">
              You can pay securely with your card now to avoid carrying cash later.
            </p>
            <button 
              onClick={() => handlePayNow(order._id!)}
              disabled={isPaying}
              className="w-full bg-hot-pink text-white py-4 rounded-md font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-hot-pink/20"
            >
              {isPaying ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CreditCard className="w-5 h-5" />
              )}
              {isPaying ? 'Redirecting...' : 'Pay with Card Now'}
            </button>
          </div>
        )}
        
        <p className="text-gray-600 mb-12 max-w-lg mx-auto font-light">
          We've sent a confirmation email to <strong>{order?.customer?.email}</strong> with your order details. 
          We'll notify you as soon as your package ships.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link to="/shop" className="bg-black text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-all flex items-center gap-2 shadow-xl">
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
          {order && (
            <Link to="/orders" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-hot-pink transition-colors">
              View My Orders
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
