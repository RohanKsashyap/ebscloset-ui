import { useState } from 'react';
import { Search, Bell, ClipboardList, Filter, BarChart3 as BarChart, Menu, Plus, Edit, AlertCircle, RefreshCcw } from 'lucide-react';
import type { Product } from '../../services/productService';

interface InventoryManagementProps {
  products: Product[];
}

export default function InventoryManagement({ products }: InventoryManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // const totalProducts = products.length;
  // const inStockCount = products.filter(p => ((p as any).inStock || 0) > 0).length;
  // const outOfStockCount = products.filter(p => ((p as any).inStock || 0) === 0).length;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pr-2">
      {/* Top Search Bar */}
      <div className="flex justify-between items-center bg-gray-50/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search inventory..." 
            className="w-full pl-9 pr-3 py-2 bg-transparent border-none rounded-xl text-xs focus:ring-0 placeholder:text-gray-400 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-400 hover:text-gray-900 transition-all">
            <Bell size={18} />
          </button>
          <div className="w-8 h-8 bg-gray-200 rounded-full border border-white shadow-sm overflow-hidden flex items-center justify-center text-[10px] font-bold text-gray-500">
            AD
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-0.5">Management Console</p>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 leading-none">Inventory<span className="text-[#eb4899]">.</span></h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-xl">
            <button className="px-4 py-1.5 bg-white text-gray-900 rounded-lg text-xs font-bold shadow-sm transition-all">Stock Control</button>
            <button className="px-4 py-1.5 text-gray-500 hover:text-gray-900 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5">
              <ClipboardList size={14} /> Bulk Restock
            </button>
            <button className="px-4 py-1.5 text-gray-500 hover:text-gray-900 rounded-lg text-xs font-bold transition-all">Inventory Reports</button>
          </div>
          <button className="px-4 py-2 bg-[#eb4899] text-white rounded-xl text-xs font-bold shadow-lg shadow-pink-500/20 flex items-center gap-1.5 hover:bg-[#d43f8a] transition-all">
            <Filter size={14} /> Out of Stock
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-4">
        <div className="space-y-4">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Current Stock Levels</h2>
              <div className="flex items-center gap-2">
                <button className="p-2 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-lg transition-all">
                  <BarChart size={16} />
                </button>
                <button className="p-2 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-lg transition-all">
                  <Menu size={16} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr className="border-b border-gray-50">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Product</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Category</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">In Stock</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100">
                             {product.images?.[0] && (
                               <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                             )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 line-clamp-1">{product.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">${product.price}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          {product.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${((product as any).inStock || 0) < 10 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {(product as any).inStock || 0}
                          </span>
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${((product as any).inStock || 0) < 10 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${Math.min(((product as any).inStock || 0), 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-gray-400 hover:text-[#eb4899] hover:bg-pink-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <Edit size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 tracking-tight mb-6">Stock Health</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Optimal Stock</p>
                  <p className="text-sm font-black text-gray-900">84%</p>
                </div>
                <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                  <div className="w-[84%] h-full bg-emerald-500 rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Low Stock Items</p>
                  <p className="text-sm font-black text-red-500">12</p>
                </div>
                <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                  <div className="w-[12%] h-full bg-red-500 rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Out of Stock</p>
                  <p className="text-sm font-black text-gray-300">3</p>
                </div>
                <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                  <div className="w-[3%] h-full bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button className="flex-1 py-3 bg-gray-900 text-white rounded-2xl text-xs font-bold hover:bg-black transition-all shadow-lg shadow-black/20 tracking-wide">
                Export CSV
              </button>
              <button className="p-3 bg-white text-gray-400 hover:text-gray-900 rounded-2xl transition-all border border-pink-50 shadow-sm">
                <RefreshCcw size={16} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Audit Logs</h3>
              <button className="text-[9px] font-bold uppercase tracking-widest text-[#eb4899] hover:underline">View All</button>
            </div>
            
            <div className="space-y-4">
              {[
                { type: 'admin', text: 'Admin added 24 units', time: '2 hours ago', icon: Plus, color: 'text-pink-500 bg-pink-50' },
                { type: 'system', text: 'System adjusted stock', time: '5 hours ago', icon: Edit, color: 'text-gray-400 bg-gray-50' },
                { type: 'alert', text: 'Low stock threshold', time: 'Yesterday', icon: AlertCircle, color: 'text-red-500 bg-red-50' },
              ].map((log, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${log.color}`}>
                    <log.icon size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-gray-900 leading-tight truncate">{log.text}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
               <button className="w-10 h-10 bg-[#eb4899] text-white rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20 hover:scale-105 transition-transform">
                  <Plus size={18} />
               </button>
            </div>
          </div>

          <div className="bg-black rounded-[2rem] p-6 text-white relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-[60px] rounded-full -mr-12 -mt-12"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#eb4899] text-[8px] font-bold uppercase tracking-widest mb-4">
                Atelier Insight
              </div>
              <h4 className="text-lg font-black leading-tight mb-4 tracking-tight">
                Save <span className="text-[#eb4899]">$1,240</span> monthly.
              </h4>
              {/* <button className="text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors flex items-center gap-1.5 border-b border-gray-800 pb-0.5">
                See Analytics <ChevronRight size={12} />
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
