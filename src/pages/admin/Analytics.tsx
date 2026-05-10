import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download, 
  ShoppingBag, 
  Activity,
} from 'lucide-react';

const MetricCard = ({ title, value, change, isPositive }: { title: string, value: string, change: string, isPositive: boolean }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-pink-100 group">
    <div className="flex items-center justify-between mb-4">
      <p className="text-xs text-gray-400 font-black uppercase tracking-widest group-hover:text-gray-500 transition-colors">{title}</p>
      <div className={`p-2 rounded-lg ${isPositive ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      </div>
    </div>
    <div className="flex items-end justify-between">
      <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
      <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
        <span>{isPositive ? '+' : ''}{change}</span>
      </div>
    </div>
  </div>
);

const RevenueChart = ({ data = [] }: { data?: any[] }) => {
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
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-full group hover:border-pink-100 transition-all">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Revenue Performance</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Monthly sales trajectory</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#eb4899] animate-pulse"></div>
            <span className="text-gray-900">Revenue Stream</span>
          </div>
        </div>
      </div>
      
      <div className="relative h-64 w-full">
        <svg viewBox="0 0 600 100" className="w-full h-full preserve-3d overflow-visible">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#eb4899" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#eb4899" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path 
            d={pathData} 
            fill="none" 
            stroke="#eb4899" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="drop-shadow-[0_10px_20px_rgba(235,72,153,0.4)]"
          />
        </svg>
        
        <div className="flex justify-between mt-8 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
          {data.length > 0 ? data.map((d, i) => (
            <span key={i} className="hover:text-gray-900 transition-colors cursor-default">
              {new Date(d._id + '-01').toLocaleDateString('en-US', { month: 'short' })}
            </span>
          )) : (
            <>
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
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
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-full group hover:border-pink-100 transition-all">
      <div className="mb-12">
        <h3 className="text-xl font-black text-gray-900 tracking-tight">Inventory Distribution</h3>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Stock levels by category</p>
      </div>
      
      <div className="flex items-end justify-between gap-6 h-48 mb-10">
        {data.map((c, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-4 h-full group/bar">
            <div className="w-full bg-gray-50 rounded-2xl relative h-full overflow-hidden border border-gray-50 group-hover/bar:border-pink-50 transition-all">
              <div 
                className={`absolute bottom-0 w-full ${i === 0 ? 'bg-[#eb4899]' : 'bg-[#111827]'} rounded-t-xl transition-all duration-1000 ease-out delay-${i * 100}`} 
                style={{ height: `${(c.count / maxCount) * 100}%` }}
              >
                <div className="absolute top-2 left-0 right-0 text-[8px] font-black text-white text-center opacity-0 group-hover/bar:opacity-100 transition-opacity">
                  {c.count}
                </div>
              </div>
            </div>
            <span className="text-[9px] font-black text-gray-500 truncate w-full text-center uppercase tracking-widest group-hover/bar:text-gray-900 transition-colors">{c._id || 'Other'}</span>
          </div>
        ))}
        {data.length === 0 && (
          <div className="flex flex-col items-center justify-center w-full h-full text-gray-300">
            <ShoppingBag size={32} className="mb-2 opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-widest">No categories mapped</p>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between pt-8 border-t border-gray-50">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Dominant Class</span>
        <span className="text-[10px] font-black text-[#eb4899] uppercase tracking-[0.2em] bg-pink-50 px-3 py-1 rounded-full">{data[0]?._id || 'N/A'}</span>
      </div>
    </div>
  );
};

const TopSellingProducts = ({ products = [] }: { products?: any[] }) => {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 group hover:border-pink-100 transition-all">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Top Performance</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Highest converting products</p>
        </div>
      </div>
      <div className="space-y-6">
        {products.map((p, i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-gray-50 hover:bg-gray-50/50 transition-all group/item">
            <div className="flex items-center gap-5">
              <div className="w-16 h-20 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50 group-hover/item:scale-105 transition-transform duration-500">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200">
                    <ShoppingBag size={24} />
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900 group-hover/item:text-[#eb4899] transition-colors">{p.name}</h4>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1.5">{p.sku || 'SKU-NONE'}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-[8px] font-black uppercase tracking-widest text-gray-500">#{i + 1} Best Seller</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-gray-900">${p.price}</p>
              <div className="flex items-center gap-1 justify-end mt-1.5 text-emerald-500">
                <TrendingUp size={12} />
                <p className="text-[10px] font-black uppercase tracking-widest">{p.sold || 0} Units</p>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Activity className="text-gray-300" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Awaiting sales metrics...</p>
          </div>
        )}
      </div>
    </div>
  );
};

const RecentActivity = ({ orders = [] }: { orders?: any[] }) => {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 group hover:border-pink-100 transition-all">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Live Stream</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time order synchronization</p>
        </div>
        <div className="w-3 h-3 bg-pink-500 rounded-full animate-ping"></div>
      </div>
      <div className="space-y-8 relative">
        <div className="absolute left-[23px] top-8 bottom-4 w-[2px] bg-gray-50"></div>
        {orders.map((o, i) => (
          <div key={i} className="flex items-start gap-6 relative group/activity">
            <div className={`w-12 h-12 rounded-2xl bg-white border-2 border-pink-50 flex items-center justify-center flex-shrink-0 z-10 group-hover/activity:border-[#eb4899] group-hover/activity:bg-pink-50 transition-all duration-500`}>
              <ShoppingBag size={20} className="text-[#eb4899]" />
            </div>
            <div className="pt-1">
              <div className="flex items-center gap-3">
                <h4 className="text-sm font-black text-gray-900">Order #{String(o._id || '').slice(-6).toUpperCase()}</h4>
                <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest">Confirmed</div>
              </div>
              <p className="text-[11px] font-bold text-gray-400 mt-1">Processed from <span className="text-gray-900 font-black">{o.customer?.fullName || 'Guest Client'}</span></p>
              <div className="flex items-center gap-2 mt-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                <Calendar size={12} />
                <span>{new Date(o.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <ShoppingBag className="text-gray-300" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No recent transaction logs</p>
          </div>
        )}
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

  const metrics = useMemo(() => {
    const monthly = data?.monthlySales || [];
    if (monthly.length < 2) {
      return {
        salesChange: "0%",
        ordersChange: "0%",
        isSalesPositive: true,
        isOrdersPositive: true
      };
    }

    const current = monthly[monthly.length - 1];
    const previous = monthly[monthly.length - 2];

    const calculateChange = (curr: number, prev: number) => {
      if (!prev) return 0;
      return ((curr - prev) / prev) * 100;
    };

    const sChange = calculateChange(current.sales, previous.sales);
    const oChange = calculateChange(current.count, previous.count);

    return {
      salesChange: `${Math.abs(sChange).toFixed(1)}%`,
      ordersChange: `${Math.abs(oChange).toFixed(1)}%`,
      isSalesPositive: sChange >= 0,
      isOrdersPositive: oChange >= 0
    };
  }, [data?.monthlySales]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-20 animate-in fade-in duration-1000">
      {/* Analytics Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-pink-100 flex items-center justify-center text-[8px] font-black text-pink-500 uppercase">EB</div>
              ))}
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-pink-50 rounded-full border border-pink-100">
              <div className="w-1.5 h-1.5 bg-[#eb4899] rounded-full animate-pulse"></div>
              <span className="text-[9px] font-black text-[#eb4899] uppercase tracking-widest">Live System Active</span>
            </div>
          </div>
          <h2 className="text-5xl font-black text-gray-900 tracking-tighter leading-tight">Analytics <span className="text-[#eb4899]">Command Center.</span></h2>
          <p className="text-gray-400 font-bold text-sm mt-3 uppercase tracking-widest">Critical store performance intelligence & visualization</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-white border-2 border-gray-50 px-6 py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-gray-50 hover:border-gray-100 transition-all shadow-sm">
            <Calendar size={18} className="text-gray-400" />
            Last 30 Days
          </button>
          <button className="bg-[#111827] text-white px-8 py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-black transition-all shadow-xl shadow-black/10">
            <Download size={18} />
            Export Intelligence
          </button>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <MetricCard 
          title="Gross Revenue" 
          value={`$${Number(counts.sales).toLocaleString()}`} 
          change={metrics.salesChange} 
          isPositive={metrics.isSalesPositive} 
        />
        <MetricCard 
          title="Total Fulfillment" 
          value={counts.orders.toLocaleString()} 
          change={metrics.ordersChange} 
          isPositive={metrics.isOrdersPositive} 
        />
        <MetricCard 
          title="Active Consumers" 
          value={counts.users.toLocaleString()} 
          change="0.0%" 
          isPositive={true} 
        />
        <MetricCard 
          title="Inventory Assets" 
          value={counts.products.toLocaleString()} 
          change="0.0%" 
          isPositive={true} 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RevenueChart data={data?.monthlySales} />
        </div>
        <div className="lg:col-span-1">
          <SalesByCategory data={data?.categoryCounts} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TopSellingProducts products={data?.topProducts} />
        <RecentActivity orders={data?.recentOrders} />
      </div>
    </div>
  );
}
