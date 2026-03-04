import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download, 
  ShoppingBag, 
} from 'lucide-react';

const MetricCard = ({ title, value, change, isPositive }: { title: string, value: string, change: string, isPositive: boolean }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <p className="text-sm text-gray-500 font-medium">{title}</p>
    <div className="flex items-end justify-between mt-2">
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        <span>{isPositive ? '+' : ''}{change}</span>
        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
      </div>
    </div>
  </div>
);

const RevenueChart = ({ data = [] }: { data?: any[] }) => {
  // Generate a path based on data if available, otherwise use mock
  const generatePath = () => {
    if (!data || data.length < 2) return "M 0 80 Q 50 70 100 40 T 200 60 T 300 30 T 400 50 T 500 10 T 600 40";
    
    const maxSales = Math.max(...data.map(d => d.sales), 100);
    const width = 600;
    const height = 80;
    const step = width / (data.length - 1);
    
    return data.map((d, i) => {
      const x = i * step;
      const y = height - (d.sales / maxSales * height);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };
  
  const pathData = generatePath();
  
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold text-gray-900">Revenue over Time</h3>
        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#eb4899]"></div>
            <span className="text-gray-900">Revenue</span>
          </div>
        </div>
      </div>
      
      <div className="relative h-64 w-full">
        <svg viewBox="0 0 600 100" className="w-full h-full preserve-3d overflow-visible">
          <path 
            d={pathData} 
            fill="none" 
            stroke="#eb4899" 
            strokeWidth="3" 
            strokeLinecap="round" 
            className="drop-shadow-[0_8px_16px_rgba(235,72,153,0.3)]"
          />
        </svg>
        
        <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          {data.length > 0 ? data.map((d, i) => (
            <span key={i}>{d._id.split('-').slice(1).join('/')}</span>
          )) : (
            <>
              <span>Wk 1</span>
              <span>Wk 2</span>
              <span>Wk 3</span>
              <span>Wk 4</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const SalesByCategory = ({ data = [] }: { data?: any[] }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
      <h3 className="text-lg font-bold text-gray-900 mb-8">Inventory by Category</h3>
      
      <div className="flex items-end justify-between gap-4 h-48 mb-6">
        {data.map((c, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-4">
            <div className="w-full bg-gray-50 rounded-lg relative h-full overflow-hidden">
              <div 
                className={`absolute bottom-0 w-full ${i === 1 ? 'bg-[#eb4899]' : 'bg-[#111827]'} rounded-t-lg transition-all duration-500`} 
                style={{ height: `${(c.count / maxCount) * 100}%` }}
              ></div>
            </div>
            <span className="text-xs font-bold text-gray-900 truncate w-full text-center">{c._id || 'Other'}</span>
          </div>
        ))}
        {data.length === 0 && <p className="text-sm text-gray-400 text-center w-full py-10">No categories</p>}
      </div>
      
      <div className="flex items-center justify-between pt-6 border-t border-gray-50">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Top Category</span>
        <span className="text-xs font-bold text-[#eb4899] uppercase tracking-wider">{data[0]?._id || 'N/A'}</span>
      </div>
    </div>
  );
};

const TopSellingProducts = ({ products = [] }: { products?: any[] }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Top Selling Products</h3>
      <div className="space-y-6">
        {products.map((p, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-16 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">{p.name}</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{p.sku || 'N/A'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">₹{p.price}</p>
              <p className="text-[10px] font-bold text-green-500 uppercase tracking-wider mt-0.5">{p.sold || 0} Sold</p>
            </div>
          </div>
        ))}
        {products.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No data available</p>}
      </div>
    </div>
  );
};

const RecentActivity = ({ orders = [] }: { orders?: any[] }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
      <div className="space-y-8 relative">
        <div className="absolute left-5 top-8 bottom-4 w-px bg-gray-100"></div>
        {orders.map((o, i) => (
          <div key={i} className="flex items-start gap-4 relative">
            <div className={`w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center flex-shrink-0 z-10`}>
              <ShoppingBag size={18} className="text-pink-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-gray-900">Order #{o._id.slice(-6).toUpperCase()}</h4>
                <span className="text-xs text-gray-400 font-medium">received from {o.customer?.fullName || 'Guest'}</span>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                {new Date(o.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-sm text-gray-400 text-center py-4 pl-8">No recent activity</p>}
      </div>
    </div>
  );
};

export default function Analytics({ data }: { data?: any }) {
  const counts = data?.counts || {
    sales: "0.00",
    orders: 0,
    users: 0,
    products: 0
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Analytics Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Overview</h2>
          <p className="text-gray-500 mt-1">Real-time performance metrics for your clothing store.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
            <Calendar size={18} />
            Last 30 Days
          </button>
          <button className="bg-[#eb4899] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#d43d8a] transition-all shadow-md shadow-pink-500/20">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Revenue" 
          value={`₹${Number(counts.sales).toLocaleString()}`} 
          change="0%" 
          isPositive={true} 
        />
        <MetricCard 
          title="Total Orders" 
          value={counts.orders.toLocaleString()} 
          change="0%" 
          isPositive={true} 
        />
        <MetricCard 
          title="Total Users" 
          value={counts.users.toLocaleString()} 
          change="0%" 
          isPositive={true} 
        />
        <MetricCard 
          title="Total Products" 
          value={counts.products.toLocaleString()} 
          change="0%" 
          isPositive={true} 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={data?.monthlySales} />
        </div>
        <div className="lg:col-span-1">
          <SalesByCategory data={data?.categoryCounts} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        <TopSellingProducts products={data?.topProducts} />
        <RecentActivity orders={data?.recentOrders} />
      </div>
    </div>
  );
}
