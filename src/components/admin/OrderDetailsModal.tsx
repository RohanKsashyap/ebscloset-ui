import { X, Printer, CreditCard } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export default function OrderDetailsModal({ isOpen, onClose, order }: OrderDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const subtotal = order.subtotal || order.products?.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) || 0;
  const shipping = order.shippingFee || 0;
  const tax = order.tax || 0;
  const total = order.totalAmount || (subtotal + shipping + tax);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div 
        ref={modalRef}
        className="bg-[#FDFBFB] w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] relative animate-scaleIn"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 text-gray-400 hover:text-gray-900 transition-colors z-10"
        >
          <X size={24} />
        </button>

        {/* Left Sidebar: Order Summary */}
        <div className="w-full md:w-[350px] bg-[#FDFBFB] p-8 md:p-12 flex flex-col border-r border-gray-100 overflow-y-auto custom-scrollbar">
          <div className="flex-1 space-y-12">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Order Archive</p>
              <h2 className="text-xl font-black text-gray-900 tracking-tight break-all mb-4">
                #{order.orderId || order._id}
              </h2>
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-pink-100 text-[#eb4899] text-[10px] font-black uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-[#eb4899] mr-2"></span>
                {order.status || 'Processing'}
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Order Summary</p>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-bold text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-gray-600">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-gray-600">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>
              <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
                <span className="text-[10px] font-black text-[#eb4899] uppercase tracking-[0.3em] mb-1">Total</span>
                <span className="text-4xl font-black text-gray-900 tracking-tighter">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-12 pt-6 border-t border-gray-50">
            <button className="w-full py-5 bg-[#eb4899] text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#d9448a] transition-all shadow-lg shadow-pink-500/20">
              <Printer size={16} />
              Print Invoice
            </button>
            <button 
              onClick={onClose}
              className="w-full py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>

        {/* Right Content: Details */}
        <div className="flex-1 bg-white p-8 md:p-12 overflow-y-auto custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-16">
            
            {/* Customer & Logistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-50">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Customer & Logistics</span>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1.5">Full Name</p>
                    <p className="text-sm font-bold text-gray-900">{order.customer?.fullName || 'Guest'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1.5">Contact</p>
                    <p className="text-sm font-bold text-gray-900">{order.customer?.email || 'N/A'}</p>
                    {order.customer?.phone && (
                      <p className="text-xs font-medium text-gray-400 mt-0.5">{order.customer.phone}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="pt-0 md:pt-10">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1.5">Shipping Address</p>
                <div className="text-sm font-bold text-gray-900 leading-relaxed">
                  {order.customer?.address ? (
                    <>
                      <p>{order.customer.address}</p>
                      <p>{order.customer.city}, {order.customer.postalCode}</p>
                      <p>{order.customer.country}</p>
                    </>
                  ) : (
                    <p className="text-gray-400 italic">No address provided</p>
                  )}
                </div>
              </div>
            </div>

            {/* Inventory Manifest */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Inventory Manifest</span>
              </div>
              <div className="space-y-6">
                {order.products?.map((item: any, idx: number) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-8 group">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 mx-auto sm:mx-0">
                      <img 
                        src={item.image || 'https://via.placeholder.com/150'} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        alt={item.title || item.name} 
                      />
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <h4 className="text-lg font-black text-gray-900 tracking-tight">{item.title || item.name}</h4>
                        {item.variantName && (
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Variant: {item.variantName}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-4">
                          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Quantity</p>
                          <div className="px-3 py-1 bg-gray-50 rounded-lg text-xs font-black text-gray-900 border border-gray-100">
                            {item.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right w-full sm:w-auto">
                        <p className="text-lg font-black text-gray-900 tracking-tight">${item.price.toFixed(2)}</p>
                        <div className="mt-4">
                          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Item Total</p>
                          <p className="text-sm font-black text-[#eb4899] tracking-tight">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction Record */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Transaction Record</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-gray-50/50 rounded-[2rem] p-8 border border-gray-50">
                <div className="space-y-3">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Payment Method</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-pink-100 rounded-md flex items-center justify-center">
                      <CreditCard size={14} className="text-[#eb4899]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 capitalize">{order.paymentMethod || 'Card'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Transaction Status</p>
                  <div className="px-3 py-1.5 bg-white border border-gray-100 rounded-xl inline-block">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      {order.status || 'Success'}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Date & Time</p>
                  <div>
                    <p className="text-xs font-bold text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] font-medium text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
