import React, { useState } from 'react';
import { 
  X, 
  Tag, 
  ChevronDown, 
  Banknote, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Percent
} from 'lucide-react';

interface CreateDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (discountData: any) => void;
}

export default function CreateDiscountModal({ isOpen, onClose, onSave }: CreateDiscountModalProps) {
  const [form, setForm] = useState({
    code: 'SUMMER2024',
    type: 'percent',
    value: 0,
    maxUses: '',
    expiryDate: new Date(2024, 9, 4), // October 4, 2024 as in image
    description: '',
    isActive: true
  });

  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 9, 1)); // October 2024

  if (!isOpen) return null;

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-xl max-h-[90vh] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-slideUp">
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Create New Discount
            </h2>
            <p className="text-gray-400 text-sm font-medium mt-0.5">
              Set up a new promotional campaign for your store.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Discount Code */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900">Discount Code</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text"
                    className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-pink-200 outline-none"
                    placeholder="SUMMER2024"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              {/* Discount Type */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900">Discount Type</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {form.type === 'percent' ? <Percent size={18} /> : <Banknote size={18} />}
                  </div>
                  <select 
                    className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-10 py-3 text-sm focus:ring-2 focus:ring-pink-200 outline-none appearance-none"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Discount Value */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900">Discount Value</label>
                <div className="relative">
                  <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="number"
                    className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-pink-200 outline-none"
                    placeholder="0.00"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Maximum Uses */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900">Maximum Uses</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text"
                    className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-pink-200 outline-none"
                    placeholder="Unlimited"
                    value={form.maxUses}
                    onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Expiry Date Calendar */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Expiry Date</label>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                    <ChevronLeft size={20} className="text-gray-600" />
                  </button>
                  <span className="font-bold text-gray-900 text-sm">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                    <ChevronRight size={20} className="text-gray-600" />
                  </button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="text-center text-[10px] font-bold text-gray-400 uppercase">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => {
                    const day = i + 1;
                    const isSelected = form.expiryDate.getDate() === day && 
                                     form.expiryDate.getMonth() === currentMonth.getMonth() && 
                                     form.expiryDate.getFullYear() === currentMonth.getFullYear();
                    
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setForm({ ...form, expiryDate: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) })}
                        className={`aspect-square flex items-center justify-center text-xs font-medium rounded-lg transition-all ${
                          isSelected 
                            ? 'bg-[#ec4899] text-white' 
                            : 'text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Description</label>
              <textarea 
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-200 outline-none h-24 resize-none"
                placeholder="Describe the purpose of this discount..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Active Status Toggle */}
            <div className="bg-pink-50/30 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">Active Status</p>
                <p className="text-[10px] text-gray-400 font-medium">Enable this discount immediately upon creation</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ec4899]"></div>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <button 
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-[#ec4899] text-white px-8 py-2.5 rounded-full text-sm font-bold hover:bg-pink-600 transition-all shadow-lg shadow-pink-200"
              >
                Create Discount
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
