import { useState } from 'react';
import { 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Ticket
} from 'lucide-react';
import CreateDiscountModal from '../../components/admin/CreateDiscountModal';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

interface DiscountCode {
  _id?: string;
  code: string;
  type: 'percent' | 'amount' | 'fixed';
  value: number;
  status?: 'Active' | 'Scheduled' | 'Expired';
  usage?: number;
}

export default function DiscountsManagement({ codes, onRefresh }: { codes: DiscountCode[], onSave?: any, onRefresh?: () => void }) {
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Scheduled' | 'Expired'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const handleSaveDiscount = async (data: any) => {
    try {
      await adminService.createDiscount({
        code: data.code,
        type: data.type,
        value: data.value,
        maxUses: data.maxUses ? Number(data.maxUses) : undefined,
        expiresAt: data.expiryDate.toISOString(),
      });
      showToast('Discount created successfully');
      setIsModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error creating discount:', err);
      showToast('Error creating discount', 'error');
    }
  };

  const enrichedCodes = codes.map(c => ({
    ...c,
    status: (c as any).isActive ? 'Active' : 'Expired',
    usage: (c as any).usageCount || 0
  }));

  const filteredDiscounts = enrichedCodes.filter(discount => {
    const matchesTab = activeTab === 'All' || discount.status === activeTab;
    const matchesSearch = discount.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Discounts</h2>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#fdf2f8] text-[#be185d] px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-pink-100 transition-all shadow-sm"
        >
          <Plus size={18} />
          Create New Discount
        </button>
      </div>

      <CreateDiscountModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDiscount}
      />

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header with Tabs and Search */}
        <div className="px-6 py-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            {['All', 'Active', 'Scheduled', 'Expired'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-4 text-sm font-semibold transition-all relative ${
                  activeTab === tab ? 'text-[#f26322]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f26322] rounded-full" />
                )}
              </button>
            ))}
          </div>
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#f26322]/10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50/30">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Discount Code</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Value</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Usage</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredDiscounts.map((discount) => (
                <tr key={discount._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#f26322]">
                        <Ticket size={18} />
                      </div>
                      <span className="font-bold text-gray-900">{discount.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-gray-600 text-sm font-medium">
                      {discount.type === 'percent' ? 'Percentage' : 'Fixed Amount'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-gray-900 text-sm font-bold">
                      {discount.type === 'percent' ? `${discount.value}%` : `₹${discount.value.toFixed(2)}`}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      discount.status === 'Active' ? 'bg-green-50 text-green-600' :
                      discount.status === 'Scheduled' ? 'bg-blue-50 text-blue-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {discount.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-gray-600 text-sm font-medium">{discount.usage} times</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="text-[#f26322] hover:underline text-sm font-bold px-2">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-[#fcfcfc] border-t flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Showing {filteredDiscounts.length} of {enrichedCodes.length} discounts
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 border rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="p-2 border rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50" disabled>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
