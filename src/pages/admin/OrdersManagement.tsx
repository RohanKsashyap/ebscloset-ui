import { useState } from 'react';
import { 
  Search, 
  Plus, 
  Eye, 
  Printer, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface OrdersManagementProps {
  orders: any[];
  onUpdateStatus: (id: string, status: string) => void;
}

export default function OrdersManagement({ orders, onUpdateStatus: _onUpdateStatus }: OrdersManagementProps) {
  const [activeTab, setActiveTab] = useState('All Orders');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = ['All Orders', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'delivered':
        return 'bg-green-100/50 text-green-600';
      case 'pending':
      case 'processing':
        return 'bg-orange-100/50 text-orange-600';
      case 'refunded':
        return 'bg-slate-100 text-slate-500';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  const getFulfillmentColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'shipped':
        return 'bg-blue-100/50 text-blue-600';
      case 'processing':
        return 'bg-gray-100 text-gray-600';
      case 'delivered':
        return 'bg-green-100/50 text-green-600';
      case 'cancelled':
        return 'bg-red-100/50 text-red-600';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 shrink-0 shadow-sm">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Orders</h2>
            <p className="text-gray-500 mt-1 font-medium">Streamlining your workflow and customer fulfillment.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-80">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search orders, customers, or IDs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none"
            />
          </div>
          <button className="bg-[#eb4899] hover:bg-[#d9448a] text-white px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-pink-500/20">
            <Plus size={18} />
            Create Order
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              activeTab === tab 
                ? 'bg-[#eb4899] text-white shadow-md shadow-pink-500/10' 
                : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/30">
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-wider text-gray-400">Order ID</th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-gray-400">Date</th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-gray-400">Customer Name</th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-gray-400">Total</th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-gray-400">Payment Status</th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-gray-400">Fulfillment Status</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <span className="text-pink-500 font-bold text-sm tracking-tight">
                        #ORD-{order._id?.slice(-4).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600 font-medium">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-500 border border-gray-100">
                          {order.customer?.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                        </div>
                        <span className="text-sm font-bold text-gray-900">{order.customer?.fullName || 'Guest Customer'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-bold text-gray-900 text-sm">
                      ₹{order.totalAmount || order.total}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold ${getStatusColor(order.status || 'paid')}`}>
                        {order.status === 'new' ? 'Paid' : (order.status || 'Paid')}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold ${getFulfillmentColor(order.fulfillmentStatus || 'shipped')}`}>
                        {order.fulfillmentStatus || 'Shipped'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow">
                          <Printer size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center text-gray-400 font-medium">
                    No orders found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-8 py-6 bg-white border-t border-gray-50 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
            Showing {orders.length} of {orders.length} orders
          </p>
          <div className="flex items-center gap-1">
            <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-all">
              <ChevronLeft size={18} />
            </button>
            <button className="w-8 h-8 rounded-lg bg-[#eb4899] text-white text-[11px] font-bold shadow-md shadow-pink-500/20">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-gray-50 text-[11px] font-bold text-gray-500 transition-all">2</button>
            <button className="w-8 h-8 rounded-lg hover:bg-gray-50 text-[11px] font-bold text-gray-500 transition-all">3</button>
            <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Total Sales</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-bold text-gray-900">₹{orders.reduce((acc, o) => acc + (o.totalAmount || o.total), 0).toLocaleString()}</p>
              <span className="text-green-500 text-xs font-bold">+12% ↑</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Active Shipments</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-bold text-gray-900">18</p>
              <span className="text-pink-500 text-xs font-bold">Real-time</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Avg. Order Value</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-bold text-gray-900">₹{(orders.reduce((acc, o) => acc + (o.totalAmount || o.total), 0) / (orders.length || 1)).toFixed(2)}</p>
              <span className="text-gray-400 text-xs font-bold">-2% ↓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
