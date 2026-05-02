import { useState, useEffect } from 'react';
import { GripVertical, Trash2, LayoutGrid, Plus, ChevronRight, ExternalLink } from 'lucide-react';
import type { NavCategory } from '../../types/admin';

interface NavManagerProps {
  initial: NavCategory[];
  onSave: (n: NavCategory[]) => void;
}

export default function NavManager({ initial, onSave }: NavManagerProps) {
  const [nav, setNav] = useState<NavCategory[]>(initial);
  useEffect(() => { setNav(initial); }, [initial]);

  const addCategory = () => setNav([...nav, { name: '', items: [] }]);
  const addItem = (ci: number) => {
    const copy = [...nav];
    copy[ci].items.push({ label: '', href: '' });
    setNav(copy);
  };
  const removeItem = (ci: number, ii: number) => {
    const copy = [...nav];
    copy[ci].items.splice(ii, 1);
    setNav(copy);
  };
  const removeCategory = (ci: number) => {
    setNav(nav.filter((_, idx) => idx !== ci));
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-[2.5rem] font-bold text-[#111827]">Navigation Manager</h1>
          <p className="text-[#6B7280] text-lg">Configure your store's main navigation and dropdown menus.</p>
        </div>
        <div className="flex gap-4">
          <button 
            className="px-8 py-3.5 bg-white border border-[#E5E7EB] rounded-2xl text-sm font-bold text-[#374151] hover:bg-gray-50 transition-all shadow-sm"
            onClick={() => setNav(initial)}
          >
            Discard Changes
          </button>
          <button 
            className="px-10 py-3.5 bg-[#eb4899] text-white rounded-2xl text-sm font-bold hover:bg-[#db2777] transition-all shadow-lg shadow-pink-500/20"
            onClick={() => onSave(nav)}
          >
            Save Navigation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-12 items-start">
        <div className="space-y-8">
          {nav.map((c, ci) => (
            <div key={ci} className="bg-white border border-[#F3F4F6] rounded-[2rem] shadow-sm overflow-hidden transition-all">
              <div className="p-8 border-b border-[#F3F4F6]">
                <div className="flex gap-6 items-start">
                  <div className="mt-2 text-[#D1D5DB] cursor-grab active:cursor-grabbing">
                    <GripVertical size={24} />
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Category Label</label>
                      <input 
                        className="w-full text-xl font-bold text-[#111827] placeholder:text-gray-300 border-none p-0 focus:ring-0" 
                        placeholder="New Arrival" 
                        value={c.name} 
                        onChange={(e) => {
                          const copy = [...nav]; copy[ci].name = e.target.value; setNav(copy);
                        }} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">URL / Handle</label>
                      <input 
                        className="w-full text-base font-medium text-[#6B7280] placeholder:text-gray-300 border-none p-0 focus:ring-0" 
                        placeholder="/collections/new-arrivals" 
                        value={c.href ?? ''} 
                        onChange={(e) => {
                          const copy = [...nav]; copy[ci].href = e.target.value; setNav(copy);
                        }} 
                      />
                    </div>
                  </div>
                  <button onClick={() => removeCategory(ci)} className="text-[#D1D5DB] hover:text-red-500 transition-colors p-2">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="p-8 bg-[#FAFAFA]/50">
                {c.items.length > 0 ? (
                  <div className="space-y-4">
                    {c.items.map((it, ii) => (
                      <div key={ii} className="flex gap-4 items-center bg-white border border-[#F3F4F6] rounded-2xl p-5 shadow-sm group transition-all hover:border-pink-100">
                        <div className="text-[#D1D5DB] cursor-grab">
                          <GripVertical size={18} />
                        </div>
                        <input 
                          className="flex-1 text-sm font-semibold text-[#374151] placeholder:text-gray-300 border-none p-0 focus:ring-0" 
                          placeholder="Label" 
                          value={it.label} 
                          onChange={(e) => {
                            const copy = [...nav]; copy[ci].items[ii].label = e.target.value; setNav(copy);
                          }} 
                        />
                        <input 
                          className="flex-1 text-sm font-medium text-[#9CA3AF] placeholder:text-gray-300 border-none p-0 focus:ring-0" 
                          placeholder="Link" 
                          value={it.href} 
                          onChange={(e) => {
                            const copy = [...nav]; copy[ci].items[ii].href = e.target.value; setNav(copy);
                          }} 
                        />
                        <button className="text-gray-300 hover:text-red-500 transition-colors" onClick={() => removeItem(ci, ii)}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    <button 
                      className="w-full py-4 border-2 border-dashed border-[#E5E7EB] rounded-2xl text-xs font-bold uppercase tracking-widest text-[#9CA3AF] hover:border-[#eb4899] hover:text-[#eb4899] transition-all flex items-center justify-center gap-2 mt-4" 
                      onClick={() => addItem(ci)}
                    >
                      <Plus size={16} />
                      Add Sub-item
                    </button>
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-white border border-[#F3F4F6] rounded-2xl shadow-sm flex items-center justify-center text-[#D1D5DB]">
                      <LayoutGrid size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-[#111827]">No sub-items yet</p>
                      <p className="text-xs font-medium text-[#9CA3AF]">Add items to create a dropdown menu.</p>
                    </div>
                    <button 
                      className="px-6 py-2 bg-white border border-[#E5E7EB] rounded-xl text-[10px] font-black uppercase tracking-widest text-[#374151] hover:bg-gray-50 transition-all mt-2"
                      onClick={() => addItem(ci)}
                    >
                      Add First Item
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          <button 
            className="w-full py-8 border-2 border-dashed border-[#D1D5DB] rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] text-[#9CA3AF] hover:border-[#eb4899] hover:text-[#eb4899] hover:bg-pink-50/30 transition-all flex flex-col items-center justify-center gap-4 group"
            onClick={addCategory}
          >
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-pink-100 transition-all">
              <Plus size={24} />
            </div>
            Create New Navigation Category
          </button>
        </div>

        {/* Preview Sidebar */}
        <div className="bg-white border border-[#F3F4F6] rounded-[2.5rem] shadow-xl shadow-gray-200/50 sticky top-8 overflow-hidden">
          <div className="p-6 bg-[#111827] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Live Preview</span>
            </div>
            <ExternalLink size={16} className="text-[#D1D5DB]" />
          </div>
          
          <div className="p-8">
            <div className="flex flex-col items-center mb-12">
              <span className="text-2xl font-black tracking-tighter">LUXE<span className="text-[#eb4899]">.</span></span>
            </div>

            <nav className="space-y-8">
              {nav.map((c, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center justify-between group cursor-pointer">
                    <span className={`text-xs font-bold uppercase tracking-widest ${idx === 0 ? 'text-[#111827]' : 'text-[#9CA3AF]'}`}>
                      {c.name || 'Untitled Category'}
                    </span>
                    {c.items.length > 0 && <ChevronRight size={14} className={`transition-transform ${idx === 0 ? 'rotate-90' : ''} text-[#D1D5DB]`} />}
                  </div>
                  {idx === 0 && c.items.length > 0 && (
                    <div className="pl-4 space-y-3 border-l-2 border-[#F3F4F6]">
                      {c.items.map((it, ii) => (
                        <p key={ii} className="text-sm font-medium text-[#6B7280] hover:text-[#eb4899] cursor-pointer transition-colors">
                          {it.label || 'New Item'}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="mt-16 bg-[#F9FAFB] rounded-2xl p-6 border border-[#F3F4F6]">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#9CA3AF] text-center mb-2">Frontend Navigation Style</p>
              <p className="text-xs font-semibold text-[#374151] text-center">Menu style: Minimalist Dropdown</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-12 border-t border-[#F3F4F6] flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">
        <p>© 2024 Luxe Commerce Dashboard • NavManager v2.4</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-[#eb4899] transition-colors">Documentation</a>
          <a href="#" className="hover:text-[#eb4899] transition-colors">Support</a>
        </div>
      </div>
    </div>
  );
}
