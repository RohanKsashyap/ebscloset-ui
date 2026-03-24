  import { useState } from 'react';
import { 
  Search, 
  Plus, 
  Eye, 
  Printer, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Trash2,
  MoreVertical
} from 'lucide-react';

interface OrdersManagementProps {
  orders: any[];
  onUpdateStatus: (id: string, status: string) => void;
  onDeleteOrder: (id: string) => void;
  onBulkDeleteOrders: (ids: string[]) => void;
  onViewDetails: (order: any) => void;
}

export default function OrdersManagement({ orders, onUpdateStatus, onDeleteOrder, onBulkDeleteOrders, onViewDetails }: OrdersManagementProps) {
  const [activeTab, setActiveTab] = useState('All Orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const tabs = ['All Orders', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
  const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];

  const getFulfillmentColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'shipped':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'processing':
        return 'bg-gray-50 text-gray-600 border-gray-100';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'cancelled':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'returned':
        return 'bg-slate-50 text-slate-600 border-slate-100';
      default:
        return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrders(prev => 
      prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]
    );
  };

  const handleStatusChange = (id: string, status: string) => {
    onUpdateStatus(id, status);
    setOpenDropdownId(null);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o._id));
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchMatch = 
      order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'All Orders') return searchMatch;
    return searchMatch && (order.status?.toLowerCase() === activeTab.toLowerCase());
  });

  return (
    <div className="space-y-8 animate-fadeIn" onClick={() => setOpenDropdownId(null)}>
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
          {selectedOrders.length > 0 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onBulkDeleteOrders(selectedOrders);
                setSelectedOrders([]);
              }}
              className="bg-red-50 text-red-600 hover:bg-red-100 px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all border border-red-100"
            >
              <Trash2 size={18} />
              Delete ({selectedOrders.length})
            </button>
          )}
          <div className="relative flex-1 md:w-80" onClick={e => e.stopPropagation()}>
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
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide" onClick={e => e.stopPropagation()}>
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
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-visible">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/30">
                <th className="px-8 py-5 w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={(e) => { e.stopPropagation(); toggleSelectAll(); }}
                    className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                  />
                </th>
                <th className="px-4 py-5 text-[11px] font-bold uppercase tracking-wider text-gray-400">Order ID</th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-gray-400 text-center">Date</th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-gray-400">Customer Name</th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-gray-400">Total</th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-gray-400 text-center">Status</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className={`group hover:bg-gray-50/50 transition-colors ${selectedOrders.includes(order._id) ? 'bg-pink-50/30' : ''}`}>
                    <td className="px-8 py-5">
                      <input 
                        type="checkbox" 
                        checked={selectedOrders.includes(order._id)}
                        onChange={(e) => { e.stopPropagation(); toggleSelectOrder(order._id); }}
                        className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                      />
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-bold text-sm tracking-tight mb-0.5">
                          #AC-{order._id?.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          {order.products?.length || 0} ITEMS
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600 font-medium text-center">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-500 border border-gray-100">
                          {order.customer?.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{order.customer?.fullName || 'Guest Customer'}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{order.customer?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-bold text-gray-900 text-sm">
                      ${(order.totalAmount || order.total || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="relative flex justify-center" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => setOpenDropdownId(openDropdownId === order._id ? null : order._id)}
                          className={`flex items-center justify-between gap-3 px-5 py-2 rounded-full text-[11px] font-bold border transition-all hover:shadow-sm min-w-[130px] ${getFulfillmentColor(order.status || 'pending')}`}
                        >
                          <span className="tracking-widest uppercase">{(order.status || 'Pending')}</span>
                          <MoreVertical size={12} className="opacity-40" />
                        </button>
                        
                        {openDropdownId === order._id && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[160px] bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5 animate-fadeIn">
                            {statusOptions.map((status) => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(order._id, status)}
                                className={`w-full text-left px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                                  (order.status || 'Pending').toLowerCase() === status.toLowerCase()
                                    ? 'text-pink-500 bg-pink-50/50'
                                    : 'text-gray-500 hover:text-pink-500 hover:bg-gray-50'
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => onViewDetails(order)}
                          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => onDeleteOrder(order._id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow"
                        >
                          <Trash2 size={18} />
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
        <div className="px-8 py-6 bg-white border-t border-gray-50 flex items-center justify-between" onClick={e => e.stopPropagation()}>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
            Showing {filteredOrders.length} of {orders.length} orders
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" onClick={e => e.stopPropagation()}>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Total Sales</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-bold text-gray-900">${orders.reduce((acc, o) => acc + (o.totalAmount || o.total || 0), 0).toFixed(2)}</p>
              <span className="text-green-500 text-xs font-bold">+12% ↑</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Active Shipments</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-bold text-gray-900">{orders.filter(o => o.status?.toLowerCase() === 'shipped').length}</p>
              <span className="text-pink-500 text-xs font-bold">Real-time</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Avg. Order Value</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-bold text-gray-900">${(orders.reduce((acc, o) => acc + (o.totalAmount || o.total || 0), 0) / (orders.length || 1)).toFixed(2)}</p>
              <span className="text-gray-400 text-xs font-bold">-2% ↓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
