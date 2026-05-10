import { X, User, Mail, Phone, Calendar, MapPin, ShoppingBag, History, ExternalLink } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: any;
  onViewOrder: (order: any) => void;
}

export default function CustomerDetailsModal({ isOpen, onClose, customer, onViewOrder }: CustomerDetailsModalProps) {
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

  if (!isOpen || !customer) return null;

  const totalSpent = customer.orders?.reduce((acc: number, order: any) => acc + (order.totalAmount || 0), 0) || 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div 
        ref={modalRef}
        className="bg-[#FDFBFB] w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] relative animate-scaleIn"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 text-gray-400 hover:text-gray-900 transition-colors z-10"
        >
          <X size={24} />
        </button>

        {/* Left Sidebar: Customer Profile Summary */}
        <div className="w-full md:w-[380px] bg-[#FDFBFB] p-8 md:p-12 flex flex-col border-r border-gray-100 overflow-y-auto custom-scrollbar">
          <div className="flex-1 space-y-12">
            <div className="text-center md:text-left">
              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-pink-100 to-pink-50 flex items-center justify-center text-pink-600 font-bold text-3xl border-4 border-white shadow-xl mx-auto md:mx-0 mb-6">
                {customer.fullName?.charAt(0)}
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Customer Profile</p>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-4">
                {customer.fullName}
              </h2>
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-pink-100 text-[#eb4899] text-[10px] font-black uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-[#eb4899] mr-2"></span>
                {customer.role === 'admin' ? 'Administrator' : 'Premium Member'}
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Contact Information</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 group">
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-50 text-pink-500">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Email</p>
                      <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-50 text-blue-500">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Phone</p>
                      <p className="text-sm font-bold text-gray-900">{customer.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-50 text-orange-500">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Joined</p>
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-50 space-y-6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Account Stats</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Total Orders</p>
                    <p className="text-xl font-black text-gray-900">{customer.orders?.length || 0}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Total Spent</p>
                    <p className="text-xl font-black text-pink-600">${totalSpent.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-gray-50">
            <button 
              onClick={onClose}
              className="w-full py-4 bg-gray-900 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg"
            >
              Close Details
            </button>
          </div>
        </div>

        {/* Right Content: Addresses & Order History */}
        <div className="flex-1 bg-white p-8 md:p-12 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-16">
            
            {/* Addresses Section */}
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                    <MapPin size={18} />
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Address Directory</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {customer.addresses && customer.addresses.length > 0 ? (
                  customer.addresses.map((addr: any, idx: number) => (
                    <div key={idx} className={`p-6 rounded-3xl border ${addr.isPrimary ? 'border-pink-100 bg-pink-50/20' : 'border-gray-100 bg-gray-50/30'} space-y-3`}>
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{addr.type || 'Address'}</span>
                        {addr.isPrimary && (
                          <span className="px-2 py-0.5 bg-pink-500 text-white text-[8px] font-black uppercase tracking-widest rounded-md">Primary</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black text-gray-900">{addr.fullName}</p>
                        <p className="text-xs font-bold text-gray-500 leading-relaxed">
                          {addr.address}<br />
                          {addr.city}, {addr.postalCode}<br />
                          {addr.country}
                        </p>
                        {addr.phone && <p className="text-[10px] font-bold text-gray-400 mt-2 flex items-center gap-1.5"><Phone size={10} /> {addr.phone}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                    <MapPin size={32} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-sm font-bold text-gray-400">No addresses saved yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order History Section */}
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-50 rounded-xl text-pink-600">
                    <History size={18} />
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Full Order History</span>
                </div>
                <div className="px-3 py-1 bg-gray-50 rounded-full">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{customer.orders?.length || 0} Orders</span>
                </div>
              </div>

              <div className="space-y-4">
                {customer.orders && customer.orders.length > 0 ? (
                  customer.orders.map((order: any, idx: number) => (
                    <div key={idx} className="group p-6 rounded-[2rem] bg-[#FDFBFB] border border-gray-100 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-500/5 transition-all duration-300">
                      <div className="flex flex-col sm:flex-row justify-between gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-gray-900 tracking-tight">#{order.orderId || order._id?.slice(-8)}</span>
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                              order.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-pink-50 text-pink-600'
                            }`}>
                              {order.status || 'Processing'}
                            </span>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-gray-300" />
                              <span className="text-[11px] font-bold text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ShoppingBag size={14} className="text-gray-300" />
                              <span className="text-[11px] font-bold text-gray-500">{order.products?.length || 0} Items</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex sm:flex-col justify-between items-end gap-2">
                          <div className="text-right">
                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Order Total</p>
                            <p className="text-xl font-black text-gray-900 tracking-tighter">${(order.totalAmount || 0).toLocaleString()}</p>
                          </div>
                          <button 
                            onClick={() => onViewOrder(order)}
                            className="flex items-center gap-1.5 text-[9px] font-black text-pink-600 uppercase tracking-widest group-hover:gap-2 transition-all"
                          >
                            View Order <ExternalLink size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                    <ShoppingBag size={32} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-sm font-bold text-gray-400">No purchase history available</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
