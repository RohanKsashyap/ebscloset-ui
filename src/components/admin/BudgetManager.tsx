import { useState, useEffect } from 'react';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import type { Budget } from '../../types/admin';

interface BudgetManagerProps {
  initial: Budget[];
  onSave: (b: Budget[]) => void;
}

export default function BudgetManager({ initial, onSave }: BudgetManagerProps) {
  const [budgets, setBudgets] = useState(initial);
  useEffect(() => { setBudgets(initial); }, [initial]);

  const addBudget = () => setBudgets([...budgets, { label: '', slug: '', min: 0, max: 0 }]);
  const removeBudget = (idx: number) => setBudgets(budgets.filter((_, i) => i !== idx));
  const updateBudget = (idx: number, field: keyof Budget, val: any) => {
    const copy = [...budgets];
    (copy[idx] as any)[field] = val;
    setBudgets(copy);
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-[2.5rem] font-bold text-[#111827]">Budget Settings</h1>
          <p className="text-[#6B7280] text-lg">Configure price ranges for the "Shop by Budget" section.</p>
        </div>
        <div className="flex gap-4">
          <button 
            className="px-8 py-3.5 bg-white border border-[#E5E7EB] rounded-2xl text-sm font-bold text-[#374151] hover:bg-gray-50 transition-all shadow-sm"
            onClick={() => setBudgets(initial)}
          >
            Discard
          </button>
          <button 
            className="px-10 py-3.5 bg-[#eb4899] text-white rounded-2xl text-sm font-bold hover:bg-[#db2777] transition-all shadow-lg shadow-pink-500/20"
            onClick={() => onSave(budgets)}
          >
            Save Budgets
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#F3F4F6] rounded-[2rem] shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="space-y-4">
            {budgets.map((b, idx) => (
              <div key={idx} className="flex gap-4 items-center bg-white border border-[#F3F4F6] rounded-2xl p-5 shadow-sm group transition-all hover:border-pink-100">
                <div className="text-[#D1D5DB]">
                  <GripVertical size={18} />
                </div>
                <div className="flex-1 grid grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Label</label>
                    <input 
                      className="w-full text-sm font-semibold text-[#374151] border-none p-0 focus:ring-0" 
                      placeholder="Under $20" 
                      value={b.label} 
                      onChange={(e) => updateBudget(idx, 'label', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Slug</label>
                    <input 
                      className="w-full text-sm font-semibold text-[#374151] border-none p-0 focus:ring-0" 
                      placeholder="under20" 
                      value={b.slug} 
                      onChange={(e) => updateBudget(idx, 'slug', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Min ($)</label>
                    <input 
                      type="number"
                      className="w-full text-sm font-semibold text-[#374151] border-none p-0 focus:ring-0" 
                      value={b.min} 
                      onChange={(e) => updateBudget(idx, 'min', Number(e.target.value))} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Max ($)</label>
                    <input 
                      type="number"
                      className="w-full text-sm font-semibold text-[#374151] border-none p-0 focus:ring-0" 
                      value={b.max} 
                      onChange={(e) => updateBudget(idx, 'max', Number(e.target.value))} 
                    />
                  </div>
                </div>
                <button className="text-gray-300 hover:text-red-500 transition-colors" onClick={() => removeBudget(idx)}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button 
              className="w-full py-4 border-2 border-dashed border-[#E5E7EB] rounded-2xl text-xs font-bold uppercase tracking-widest text-[#9CA3AF] hover:border-[#eb4899] hover:text-[#eb4899] transition-all flex items-center justify-center gap-2 mt-4" 
              onClick={addBudget}
            >
              <Plus size={16} />
              Add Budget Range
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
