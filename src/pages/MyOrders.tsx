import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  ArrowLeft,
  Download,
  Activity,
  ClipboardCheck,
  Box,
  Truck,
  Check,
  Calendar,
  ChevronRight,
  RotateCcw,
  XCircle,
  MessageSquare
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

const MyOrders = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-[#ed4690] text-xs font-bold uppercase tracking-widest mb-4 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">Order #ORD-99283410</h1>
            <p className="text-gray-500 text-sm font-medium">
              Placed on October 18, 2023 <span className="mx-1">•</span> 3 items
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
              <Download className="w-4 h-4" />
              Invoice
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#ed4690] text-white rounded-full text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-pink-100">
              <Activity className="w-4 h-4" />
              Live Track
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="col-span-12 lg:col-span-8 space-y-6 md:space-y-8">
            {/* Shipping Status */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-50">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Shipping Status</h2>
                <span className="px-3 py-1 bg-pink-50 text-[#ed4690] text-[10px] font-bold rounded-full uppercase tracking-wider">
                  In Transit
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative mb-12 px-2">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full"></div>
                <div className="absolute top-1/2 left-0 w-2/3 h-1 bg-[#ed4690] -translate-y-1/2 rounded-full"></div>
                
                <div className="relative flex justify-between">
                  {[
                    { icon: ClipboardCheck, label: 'CONFIRMED', completed: true },
                    { icon: Box, label: 'SHIPPED', completed: true },
                    { icon: Truck, label: 'IN TRANSIT', active: true },
                    { icon: Check, label: 'DELIVERED', completed: false }
                  ].map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center relative z-10 transition-all ${
                        step.active 
                          ? 'bg-[#ed4690] text-white scale-110 shadow-lg shadow-pink-200' 
                          : step.completed 
                            ? 'bg-[#ed4690] text-white' 
                            : 'bg-white border-2 border-gray-100 text-gray-300'
                      }`}>
                        <step.icon className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <span className={`mt-3 text-[8px] md:text-[10px] font-bold tracking-widest text-center ${
                        step.active || step.completed ? 'text-gray-900' : 'text-gray-300'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Date */}
              <div className="bg-[#fdf2f7] rounded-2xl p-4 flex items-center gap-4 border border-[#fce4ee]">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#ed4690] shadow-sm">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estimated Delivery Date</p>
                  <p className="text-base font-bold text-gray-900 tracking-tight">October 24, 2023</p>
                </div>
              </div>
            </div>

            {/* Items in Order */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Items in Order</h2>
              <div className="space-y-4">
                {[
                  { 
                    name: 'Soft Pink Cashmere Sweater', 
                    price: 120.00, 
                    details: 'Size: M • Color: Blush Pink • Qty: 1',
                    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=200'
                  },
                  { 
                    name: 'Premium Denim Straight Cut', 
                    price: 95.00, 
                    details: 'Size: 30 • Color: Pure White • Qty: 1',
                    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=200'
                  },
                  { 
                    name: 'Classic Leather Belt', 
                    price: 45.00, 
                    details: 'Size: One Size • Color: Onyx Black • Qty: 1',
                    image: 'https://images.unsplash.com/photo-1524380365553-d144ec31eb40?auto=format&fit=crop&q=80&w=200'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-pink-100 transition-colors">
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base md:text-lg mb-1">{item.name}</h3>
                        <p className="text-[10px] md:text-xs text-gray-400 font-medium mb-2">{item.details}</p>
                        <div className="flex items-center gap-4">
                          <button className="text-[10px] font-bold text-[#ed4690] uppercase tracking-widest hover:underline">Track</button>
                          <button className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:underline">Review</button>
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right border-t sm:border-none pt-4 sm:pt-0">
                      <p className="text-lg font-bold text-gray-900">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-50">
              <h2 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-gray-900">$260.00</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-[#ed4690] font-bold">Free</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-400">Tax</span>
                  <span className="text-gray-900">$18.50</span>
                </div>
              </div>
              <div className="pt-6 border-t border-gray-50 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Total</span>
                  <span className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">$278.50</span>
                </div>
              </div>
              <div className="bg-[#fdf2f7] rounded-2xl p-4 flex items-center justify-between border border-[#fce4ee]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#ed4690] shadow-sm flex-shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] font-bold text-[#ed4690] uppercase tracking-widest">Payment Method</p>
                    <p className="text-[11px] font-bold text-gray-900 truncate">Visa •••• 4242</p>
                  </div>
                </div>
                <div className="flex gap-0.5 flex-shrink-0">
                  {[1,2,3,4].map(i => <div key={i} className="w-1 h-1 bg-[#ed4690] rounded-full opacity-30"></div>)}
                </div>
              </div>
            </div>

            {/* Manage Order */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
              <h2 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">Manage Order</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-[#f8f9fa] rounded-2xl hover:bg-gray-100 transition-colors group text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#0f172a] rounded-lg flex items-center justify-center text-white">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-gray-900">Initiate Return</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-900 transition-colors" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-[#fff5f5] rounded-2xl hover:bg-red-50 transition-colors group text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white">
                      <XCircle className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-red-600">Cancel Order</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-200 group-hover:text-red-500 transition-colors" />
                </button>
              </div>
              <p className="mt-4 text-[10px] text-gray-400 font-medium text-center uppercase tracking-wider leading-relaxed">
                Order cancellation is available within<br />24 hours of placement.
              </p>
            </div>

            {/* Need Help? Card */}
            <div className="bg-[#0f172a] rounded-[2rem] p-6 md:p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-3">Need Help?</h3>
                <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6">
                  Our customer support is available 24/7 to assist with your order.
                </p>
                <button className="w-full py-3 bg-[#ed4690] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyOrders;
