import { useState, useEffect } from 'react';
import type { Product } from '../../services/productService';
import { adminService, type Review, type GalleryCategory } from '../../services/adminService';
import type { Testimonial, GalleryImage } from '../../services/siteService';
import { useNavigate } from 'react-router-dom';
import OrdersManagement from './OrdersManagement';
import DiscountsManagement from './DiscountsManagement';
import CustomersManagement from './CustomersManagement';
import CategoryManagement from './CategoryManagement';
import Analytics from './Analytics';
import SiteSettings from './SiteSettings';
import { useToast } from '../../context/ToastContext';
import ProductManagementModal from '../../components/admin/ProductManagementModal';
import CategoryManagementModal from '../../components/admin/CategoryManagementModal';
import { 
  LayoutGrid, 
  ShoppingBag, 
  ShoppingCart,
  Mail, 
  Inbox, 
  Star, 
  MessageSquare, 
  Image as ImageIcon, 
  Navigation as NavIcon, 
  Settings,
  Users,
  BarChart3 as BarChart,
  Plus,
  Bell,
  Sparkles,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  LogOut,
  Menu,
  TrendingUp,
  Clock,
  AlertCircle,
  Search,
  GripVertical,
  ExternalLink,
  Package,
  RefreshCcw,
  ClipboardList,
  DollarSign,
  Camera,
  Upload,
  Download,
} from 'lucide-react';

type NavCategory = { _id?: string; name: string; href?: string; items: { label: string; href: string }[] };
type DiscountCode = { _id?: string; code: string; type: 'percent' | 'amount'; value: number };
type SiteSettings = {
  hero: { title: string; subtitle: string; slides: any[]; bannerImage: string; bannerTitle: string; bannerSubtitle: string; bannerCtaText: string; bannerCtaHref: string };
  editorial: { image: string; kicker: string; title: string; body: string; ctaText: string; ctaHref: string };
  collections: any[];
  footerGroups: any[];
  social: any[];
  newsletter: { heading: string; subtext: string };
  legalLabels: { privacy: string; terms: string; cookies: string };
  infoPages: Record<string, any>;
  budgets?: { label: string; slug: string; min: number; max: number }[];
  sparkleEffectEnabled?: boolean;
};


function TestimonialForm({ initial, products, onSave, onCancel }: { initial?: Testimonial, products: Product[], onSave: (data: FormData) => void, onCancel?: () => void }) {
  const [form, setForm] = useState({ 
    customerName: '', 
    tag: '', 
    product: '', 
    content: '', 
    rating: 5,
    status: 'visible' as 'visible' | 'hidden'
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setForm({
        customerName: initial.customerName || '',
        tag: initial.tag || '',
        product: initial.product || '',
        content: initial.content || '',
        rating: initial.rating || 5,
        status: initial.status || 'visible'
      });
      setPreview(initial.avatarUrl || null);
    } else {
      setForm({ customerName: '', tag: '', product: '', content: '', rating: 5, status: 'visible' });
      setPreview(null);
      setFile(null);
    }
  }, [initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('customerName', form.customerName);
    fd.append('tag', form.tag);
    fd.append('product', form.product);
    fd.append('content', form.content);
    fd.append('rating', String(form.rating));
    fd.append('status', form.status);
    if (file) fd.append('avatar', file);
    onSave(fd);
    if (!initial) {
      setForm({ customerName: '', tag: '', product: '', content: '', rating: 5, status: 'visible' });
      setFile(null);
      setPreview(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-50/50 sticky top-8">
      <div className="mb-8">
        <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
          {initial ? 'Edit Testimonial' : 'Add New Testimonial'}
        </h3>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
          {initial ? 'Update existing high-value customer feedback.' : 'Manually add high-value customer feedback.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center justify-center mb-8">
          <label className="relative group cursor-pointer">
            <div className={`w-24 h-24 rounded-full border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${
              preview ? 'border-[#eb4899]' : 'border-gray-200 group-hover:border-pink-300'
            }`}>
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" alt="Avatar preview" />
              ) : (
                <>
                  <Camera className="text-gray-300 group-hover:text-pink-400 mb-1" size={24} />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Upload</span>
                </>
              )}
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3">Customer Avatar</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Customer Name</label>
            <input 
              className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-pink-100 transition-all" 
              placeholder="e.g. Julianne Smith" 
              value={form.customerName} 
              onChange={e => setForm({...form, customerName: e.target.value})} 
              required 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Tag/Title</label>
            <input 
              className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-pink-100 transition-all" 
              placeholder="e.g. Verified Buyer" 
              value={form.tag} 
              onChange={e => setForm({...form, tag: e.target.value})} 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Product Name</label>
            <select 
              className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-pink-100 transition-all appearance-none" 
              value={form.product} 
              onChange={e => setForm({...form, product: e.target.value})}
            >
              <option value="">Select a product...</option>
              {products.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Rating</label>
            <div className="flex gap-2 bg-gray-50 rounded-2xl px-5 py-3.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm({ ...form, rating: n })}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    size={20}
                    className={`${n <= form.rating ? 'text-[#eb4899] fill-[#eb4899]' : 'text-gray-200'}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Testimonial</label>
            <textarea 
              className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-medium placeholder:text-gray-300 focus:ring-2 focus:ring-pink-100 transition-all h-32 resize-none" 
              placeholder="Write the customer's feedback here..." 
              value={form.content} 
              onChange={e => setForm({...form, content: e.target.value})} 
              required 
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          {initial && (
            <button 
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 bg-white border border-gray-100 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          )}
          <button 
            type="submit" 
            className="flex-[2] py-4 bg-[#111827] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-gray-200"
          >
            <Upload size={14} />
            {initial ? 'Update Testimonial' : 'Publish Testimonial'}
          </button>
        </div>
      </form>
    </div>
  );
}

function NavManager({ initial, onSave }: { initial: NavCategory[]; onSave: (n: NavCategory[]) => void }) {
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
                      <p className="font-bold text-[#111827]">No sub-items yet</p>
                      <p className="text-sm text-[#9CA3AF] mt-1">Add sub-items to create a dropdown menu for this category.</p>
                    </div>
                    <button 
                      className="mt-4 px-6 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-xs font-bold uppercase tracking-widest text-[#374151] hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
                      onClick={() => addItem(ci)}
                    >
                      <Plus size={14} />
                      Add First Sub-item
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          <button 
            className="w-full py-12 border-2 border-dashed border-[#E5E7EB] rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:border-[#eb4899] hover:bg-pink-50/10 transition-all group"
            onClick={addCategory}
          >
            <div className="w-14 h-14 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm flex items-center justify-center text-[#eb4899] group-hover:scale-110 transition-transform">
              <Plus size={28} />
            </div>
            <span className="text-lg font-bold text-[#374151]">Add New Category</span>
          </button>
        </div>

        {/* Live Preview Sidebar */}
        <div className="sticky top-8 bg-white border border-[#F3F4F6] rounded-[2rem] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#F3F4F6] flex justify-between items-center">
            <div className="flex items-center gap-2">
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

function BudgetManager({ initial, onSave }: { initial: { label: string; slug: string; min: number; max: number }[]; onSave: (b: { label: string; slug: string; min: number; max: number }[]) => void }) {
  const [budgets, setBudgets] = useState(initial);
  useEffect(() => { setBudgets(initial); }, [initial]);

  const addBudget = () => setBudgets([...budgets, { label: '', slug: '', min: 0, max: 0 }]);
  const removeBudget = (idx: number) => setBudgets(budgets.filter((_, i) => i !== idx));
  const updateBudget = (idx: number, field: string, val: any) => {
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

// function TestimonialForm({ onSave }: { onSave: (data: FormData) => void }) {
//   const [form, setForm] = useState({ name: '', role: '', content: '', rating: 5 });
//   const [file, setFile] = useState<File | null>(null);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const fd = new FormData();
//     fd.append('name', form.name);
//     fd.append('role', form.role);
//     fd.append('content', form.content);
//     fd.append('rating', String(form.rating));
//     if (file) fd.append('image', file);
//     onSave(fd);
//     setForm({ name: '', role: '', content: '', rating: 5 });
//     setFile(null);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="bg-white border p-4 space-y-3 rounded">
//       <input className="border px-3 py-2 w-full" placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
//       <input className="border px-3 py-2 w-full" placeholder="Role (e.g. Happy Customer)" value={form.role} onChange={e => setForm({...form, role: e.target.value})} />
//       <textarea className="border px-3 py-2 w-full" placeholder="Content" value={form.content} onChange={e => setForm({...form, content: e.target.value})} required />
//       <select className="border px-3 py-2 w-full" value={form.rating} onChange={e => setForm({...form, rating: Number(e.target.value)})}>
//         {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
//       </select>
//       <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
//       <button type="submit" className="bg-hot-pink text-white px-4 py-2 text-[10px] font-bold uppercase w-full">Add Testimonial</button>
//     </form>
//   );
// }

function GalleryImageForm({ categories, onSave }: { categories: GalleryCategory[], onSave: (data: FormData) => void }) {
  const [form, setForm] = useState({ title: '', category: '', featured: false });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Image is required');
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('category', form.category);
    fd.append('featured', String(form.featured));
    fd.append('image', file);
    onSave(fd);
    setForm({ title: '', category: '', featured: false });
    setFile(null);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border p-4 space-y-3 rounded shadow-sm">
      <h3 className="text-sm font-bold border-b pb-2 uppercase">Add Gallery Image</h3>
      <input className="border px-3 py-2 w-full text-sm" placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
      <select className="border px-3 py-2 w-full text-sm" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
        <option value="">Select Category</option>
        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
      </select>
      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} />
        Featured
      </label>
      <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} required />
      <button type="submit" className="bg-hot-pink text-white px-4 py-2 text-[10px] font-bold uppercase w-full">Upload Image</button>
    </form>
  );
}

function GalleryCategoryForm({ onSave }: { onSave: (data: FormData) => void }) {
  const [form, setForm] = useState({ name: '', slug: '', description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('slug', form.slug || form.name.toLowerCase().replace(/ /g, '-'));
    fd.append('description', form.description);
    fd.append('isActive', 'true');
    onSave(fd);
    setForm({ name: '', slug: '', description: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border p-4 space-y-3 rounded shadow-sm mt-4">
      <h3 className="text-sm font-bold border-b pb-2 uppercase">Add Category</h3>
      <input className="border px-3 py-2 w-full text-sm" placeholder="Category Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
      <input className="border px-3 py-2 w-full text-sm" placeholder="Slug (optional)" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} />
      <button type="submit" className="bg-hot-pink text-white px-4 py-2 text-[10px] font-bold uppercase w-full">Create Category</button>
    </form>
  );
}

function InventoryManagement({ products }: { products: Product[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const totalProducts = products.length;
  const inStockCount = products.filter(p => ((p as any).inStock || 0) > 0).length;
  const outOfStockCount = products.filter(p => ((p as any).inStock || 0) === 0).length;

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
                <thead className="sticky top-0 bg-white z-10 shadow-sm shadow-gray-50">
                  <tr className="text-[9px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-50">
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">SKU</th>
                    <th className="px-6 py-4">Size</th>
                    <th className="px-6 py-4">Color</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.filter(p => (p.name || '').toLowerCase().includes(searchTerm.toLowerCase())).map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                            <img src={product.images?.[0] || product.image || '/placeholder.png'} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 group-hover:text-[#eb4899] transition-colors line-clamp-1">{product.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{product.categoryId?.name || 'Uncategorized'}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Premium</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-400 text-xs tracking-wider">
                        {product.sku || 'VCR-882-L'}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-600 text-[10px] tracking-wider uppercase">
                        {Array.isArray((product as any).sizes) ? (product as any).sizes.join(', ') : (product as any).size || '—'}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-600 text-[10px] tracking-wider uppercase">
                        {(product as any).color || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black text-gray-900 tracking-tighter">{(product as any).inStock || 0}</span>
                          {((product as any).inStock || 0) === 0 ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter bg-red-100 text-red-500">
                              Out
                            </span>
                          ) : ((product as any).inStock || 0) < 10 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter bg-red-50 text-red-500">
                              Low
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button className="px-4 py-2 bg-[#eb4899] text-white rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-[#d43f8a] transition-all shadow-md shadow-pink-500/10">
                          Edit
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
          <div className="bg-[#fdf2f8] rounded-[2rem] p-6 border border-pink-100 relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-pink-400 mb-1">Total Products</p>
                    <h3 className="text-4xl font-black text-[#eb4899] tracking-tighter">{totalProducts.toLocaleString()}</h3>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-[#eb4899]">
                    <ClipboardList size={20} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-pink-100">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-pink-400 mb-1">In Stock</p>
                    <p className="text-xl font-black text-gray-900 tracking-tighter">{inStockCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-pink-400 mb-1">Out of Stock</p>
                    <div className="flex items-center gap-1.5">
                       <p className="text-xl font-black text-[#eb4899] tracking-tighter">{outOfStockCount.toLocaleString()}</p>
                       <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-[8px] font-black text-[#eb4899]">
                         {outOfStockCount}
                       </div>
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
              <button className="text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors flex items-center gap-1.5 border-b border-gray-800 pb-0.5">
                See Analytics <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-6 py-3.5 text-sm font-bold transition-all rounded-[1.25rem] ${
      active 
        ? 'bg-[#eb4899] text-white shadow-lg shadow-pink-500/20' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <Icon size={20} className={active ? 'text-white' : 'text-gray-400'} />
    <span>{label}</span>
  </button>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tab, setTab] = useState<'dashboard'|'products'|'categories'|'navigation'|'budgets'|'discounts'|'site'|'orders'|'newsletter'|'inbox'|'reviews'|'testimonials'|'gallery'|'customers'|'analytics'|'settings'|'inventory'>('dashboard');
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [productFilter, setProductFilter] = useState('All Products');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productEditing, setProductEditing] = useState<Product | undefined>(undefined);
  const [categoryEditing, setCategoryEditing] = useState<GalleryCategory | undefined>(undefined);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [nav, setNav] = useState<NavCategory[]>([]);
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [site, setSite] = useState<SiteSettings | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialEditing, setTestimonialEditing] = useState<Testimonial | undefined>(undefined);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [galleryCategories, setGalleryCategories] = useState<GalleryCategory[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminName, setAdminName] = useState('Administrator');

  useEffect(() => {
    const adminStr = localStorage.getItem('admin');
    if (adminStr) {
      try {
        const adminObj = JSON.parse(adminStr);
        setAdminName(adminObj.fullName || adminObj.email || 'Administrator');
      } catch (e) {
        console.error('Error parsing admin data:', e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [p, n, s, d, db] = await Promise.all([
          adminService.getProducts(),
          adminService.getNavigation(),
          adminService.getSiteSettings(),
          adminService.getDiscounts(),
          adminService.getDashboard()
        ]);
        setCatalog(p);
        setNav(n);
        setSite(s);
        setCodes(d);
        setDashboardData(db);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  useEffect(() => {
    if (tab === 'analytics' || tab === 'dashboard') adminService.getDashboard().then(setDashboardData);
    if (tab === 'orders') adminService.getOrders().then(setOrders);
    if (tab === 'categories') adminService.getAdminGalleryCategories().then(setGalleryCategories);
    if (tab === 'products') adminService.getProducts().then(setCatalog);
    if (tab === 'newsletter') adminService.getSubscribers().then(setSubscribers);
    if (tab === 'inbox') adminService.getMessages().then(setMessages);
    if (tab === 'reviews') adminService.getReviews().then(setReviews);
    if (tab === 'testimonials') adminService.getAdminTestimonials().then(setTestimonials);
    if (tab === 'gallery') {
      adminService.getAdminGalleryImages().then(setGalleryImages);
      adminService.getAdminGalleryCategories().then(setGalleryCategories);
    }
    if (tab === 'customers') adminService.getUsers().then(setUsers);
  }, [tab]);

  const saveProduct = async (p: any) => {
    if (p === null) {
      setIsProductModalOpen(false);
      setProductEditing(undefined);
      return;
    }
    try {
      const productName = p.get ? p.get('name') : p.name;
      if (productEditing?._id) {
        await adminService.updateProduct(productEditing._id, p);
        showToast(`Product "${productName}" updated successfully`);
      } else {
        await adminService.createProduct(p);
        showToast(`Product "${productName}" added successfully`);
      }
      setCatalog(await adminService.getProducts());
      setProductEditing(undefined);
      setIsProductModalOpen(false);
    } catch (err) { 
      console.error('Error saving product:', err);
      showToast('Error saving product', 'error'); 
    }
  };

  const saveCategory = async (formData: FormData) => {
    try {
      if (categoryEditing?._id) {
        await adminService.updateGalleryCategory(categoryEditing._id, formData);
        showToast('Category updated successfully');
      } else {
        await adminService.createGalleryCategory(formData);
        showToast('Category created successfully');
      }
      setGalleryCategories(await adminService.getAdminGalleryCategories());
      setIsCategoryModalOpen(false);
      setCategoryEditing(undefined);
    } catch (err: any) {
      console.error('Error saving category:', err);
      showToast(err.response?.data?.message || 'Error saving category', 'error');
    }
  };

  const removeProduct = async (id: string) => {
    const product = catalog.find(p => p._id === id);
    if (!window.confirm(`Are you sure you want to delete "${product?.name || 'this product'}"?`)) return;
    try {
      await adminService.deleteProduct(id);
      showToast(`Product "${product?.name || 'Product'}" deleted successfully`);
      setCatalog(await adminService.getProducts());
      setSelectedProductIds(prev => prev.filter(selectedId => selectedId !== id));
    } catch { showToast('Error deleting product', 'error'); }
  };

  const bulkDeleteProducts = async () => {
    if (selectedProductIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedProductIds.length} products?`)) return;
    try {
      await adminService.bulkDeleteProducts(selectedProductIds);
      showToast(`${selectedProductIds.length} products deleted successfully`);
      setCatalog(await adminService.getProducts());
      setSelectedProductIds([]);
    } catch { showToast('Error deleting products', 'error'); }
  };

  const saveNavAll = async (n: NavCategory[]) => {
    try { await adminService.updateNavigation(n); setNav(n); alert('Saved'); } catch { alert('Error'); }
  };

  const saveCodesAll = async (d: DiscountCode[]) => {
    try {
      for (const c of d) {
        if (c._id) await adminService.createDiscount(c); // Update not implemented separately, using create as upsert logic potentially
        else await adminService.createDiscount(c);
      }
      setCodes(await adminService.getDiscounts());
      alert('Saved');
    } catch { alert('Error'); }
  };

  const saveSiteAll = async (s: SiteSettings) => {
    try { await adminService.updateSiteSettings(s); setSite(s); alert('Saved'); } catch { alert('Error'); }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await adminService.updateOrderStatus(id, status);
      showToast('Order status updated successfully');
      setOrders(await adminService.getOrders());
    } catch { showToast('Error updating order status', 'error'); }
  };

  const deleteOrder = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await adminService.deleteOrder(id);
      showToast('Order deleted successfully');
      setOrders(await adminService.getOrders());
    } catch { showToast('Error deleting order', 'error'); }
  };

  const bulkDeleteOrders = async (ids: string[]) => {
    if (!window.confirm(`Are you sure you want to delete ${ids.length} orders?`)) return;
    try {
      await adminService.bulkDeleteOrders(ids);
      showToast(`${ids.length} orders deleted successfully`);
      setOrders(await adminService.getOrders());
    } catch { showToast('Error deleting orders', 'error'); }
  };

  const deleteSubscriber = async (id: string) => {
    try { await adminService.deleteSubscriber(id); setSubscribers(await adminService.getSubscribers()); } catch { alert('Error'); }
  };

  const updateReviewStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await adminService.updateReview(id, { status });
      setReviews(await adminService.getReviews());
    } catch { alert('Error'); }
  };

  const deleteReview = async (id: string) => {
    if (!window.confirm('Delete review?')) return;
    try {
      await adminService.deleteReview(id);
      setReviews(await adminService.getReviews());
    } catch { alert('Error'); }
  };

  const deleteTestimonial = async (id: string) => {
    if (!window.confirm('Delete testimonial?')) return;
    try {
      await adminService.deleteTestimonial(id);
      setTestimonials(await adminService.getAdminTestimonials());
    } catch { alert('Error'); }
  };

  const deleteGalleryImage = async (id: string) => {
    if (!window.confirm('Delete gallery image?')) return;
    try {
      await adminService.deleteGalleryImage(id);
      setGalleryImages(await adminService.getAdminGalleryImages());
    } catch { alert('Error'); }
  };

  const saveTestimonial = async (fd: FormData) => {
    try {
      if (testimonialEditing?._id) {
        await adminService.updateTestimonial(testimonialEditing._id, fd);
        showToast('Testimonial updated successfully');
      } else {
        await adminService.addTestimonial(fd);
        showToast('Testimonial added successfully');
      }
      setTestimonials(await adminService.getAdminTestimonials());
      setTestimonialEditing(undefined);
    } catch { showToast('Error saving testimonial', 'error'); }
  };

  const toggleTestimonialStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'visible' ? 'hidden' : 'visible';
      await adminService.updateTestimonial(id, { status: newStatus });
      setTestimonials(await adminService.getAdminTestimonials());
      showToast(`Testimonial is now ${newStatus}`);
    } catch { showToast('Error updating status', 'error'); }
  };

  const saveGalleryImage = async (fd: FormData) => {
    try {
      await adminService.createGalleryImage(fd);
      setGalleryImages(await adminService.getAdminGalleryImages());
      alert('Image uploaded');
    } catch { alert('Error uploading image'); }
  };

  const saveGalleryCategory = async (fd: FormData) => {
    try {
      await adminService.createGalleryCategory(fd);
      setGalleryCategories(await adminService.getAdminGalleryCategories());
      alert('Category created');
    } catch { alert('Error creating category'); }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    navigate('/');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'categories', label: 'Catalog', icon: ShoppingBag },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'inventory', label: 'Inventory', icon: ClipboardList },
    { id: 'analytics', label: 'Analytics', icon: BarChart },
    { id: 'discounts', label: 'Discounts', icon: Sparkles },
  ] as const;

  const secondaryNavItems = [
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'navigation', label: 'Navigation', icon: NavIcon },
    { id: 'budgets', label: 'Budget', icon: DollarSign },
  ] as const;

  const [inboxSearch, setInboxSearch] = useState('');
  const [inboxStatusFilter, setInboxStatusFilter] = useState('All Status');
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [testimonialsSearch, setTestimonialsSearch] = useState('');

  const filteredMessages = messages.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(inboxSearch.toLowerCase()) || 
      m.email.toLowerCase().includes(inboxSearch.toLowerCase());
    
    if (inboxStatusFilter === 'All Status') return matchesSearch;
    if (inboxStatusFilter === 'Pending') return matchesSearch && m.status === 'new';
    if (inboxStatusFilter === 'Resolved') return matchesSearch && m.status === 'resolved';
    return matchesSearch;
  });

  const totalMessages = messages.length;
  const pendingMessagesCount = messages.filter(m => m.status === 'new').length;
  const resolvedMessagesCount = messages.filter(m => m.status === 'resolved').length;

  const handleUpdateMessageStatus = async (id: string, status: 'new' | 'read' | 'resolved') => {
    try {
      await adminService.updateMessageStatus(id, status);
      setMessages(await adminService.getMessages());
      showToast('Message status updated');
    } catch {
      showToast('Error updating status', 'error');
    }
  };

  const handleBulkDeleteMessages = async () => {
    if (selectedMessageIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedMessageIds.length} messages?`)) return;
    try {
      await adminService.bulkDeleteMessages(selectedMessageIds);
      setMessages(await adminService.getMessages());
      setSelectedMessageIds([]);
      showToast('Messages deleted');
    } catch {
      showToast('Error deleting messages', 'error');
    }
  };

  if (loading) return <div className="p-20 text-center font-serif text-2xl">Loading Admin Panel...</div>;

  const filteredCatalog = catalog.filter(p => {
    if (productFilter === 'All Products') return true;
    if (productFilter === 'Trending') return p.trending;
    if (productFilter === 'New Arrivals') return p.newarrival;
    if (productFilter === 'Best Sellers') return p.bestseller;
    if (productFilter === 'Out of Stock') return ((p as any).inStock || 0) <= 0;
    return true;
  });

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col px-4 py-6">
          <div className="flex items-center gap-3 px-4 mb-10">
            <div className="w-10 h-10 bg-[#eb4899] rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
              <ShoppingBag className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-gray-900">Admin Panel</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ecommerce Manager</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={tab === item.id}
                onClick={() => { setTab(item.id as any); setIsMobileMenuOpen(false); }}
              />
            ))}
            
            <div className="pt-6 pb-2">
              <p className="px-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Management</p>
              {secondaryNavItems.map((item) => (
                <SidebarItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  active={tab === item.id}
                  onClick={() => { setTab(item.id as any); setIsMobileMenuOpen(false); }}
                />
              ))}
            </div>
          </nav>

          <div className="pt-6 border-t border-gray-100">
            <SidebarItem 
              icon={Settings} 
              label="Settings" 
              active={tab === 'site'} 
              onClick={() => setTab('site')} 
            />
            <button 
              onClick={logout}
              className="mt-2 w-full flex items-center gap-3 px-6 py-3.5 text-sm font-bold text-gray-400 hover:text-red-500 transition-all"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-20 border-b flex items-center justify-between px-4 md:px-8 bg-white sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} className="text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-500">
                <Sparkles size={18} />
              </div>
              <h2 className="text-sm font-bold text-gray-900 tracking-tight capitalize">
                {tab === 'categories' ? 'Manage Categories' : `${tab} Management`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-4 pl-6 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900">{adminName}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Store Administrator</p>
              </div>
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=fdf2f8&color=eb4899&bold=true`} 
                alt="Profile" 
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-pink-50 ring-offset-2"
              />
            </div>
          </div>
        </header>
{/* product section */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#fafafa]">
          {tab === 'products' && (
            <div className="max-w-[1200px] mx-auto space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Product Catalog</h2>
                  <p className="text-gray-500 mt-1">Manage, update and track your store Products.</p>
                </div>
                <div className="flex items-center gap-3">
                  {selectedProductIds.length > 0 && (
                    <button 
                      onClick={bulkDeleteProducts}
                      className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-red-100 transition-all border border-red-100"
                    >
                      <Trash2 size={18} />
                      Delete ({selectedProductIds.length})
                    </button>
                  )}
                  <button className="bg-white border px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
                    <Filter size={18} />
                    Filters
                  </button>
                  <button 
                    onClick={() => { setProductEditing(undefined); setIsProductModalOpen(true); }}
                    className="bg-[#eb4899] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#d43f8a] transition-all shadow-md shadow-pink-500/20"
                  >
                    <Plus size={18} />
                    New Product
                  </button>
                </div>
              </div>

              {/* Tabs / Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                {['All Products', 'Trending', 'New Arrivals', 'Best Sellers', 'Out of Stock'].map((filter) => (
                  <button 
                    key={filter}
                    onClick={() => setProductFilter(filter)}
                    className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                      productFilter === filter ? 'bg-black text-white' : 'bg-[#f1f1f1] text-[#333] hover:bg-[#e1e1e1]'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Product Table */}
              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#fcfcfc] border-b text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      <tr>
                        <th className="px-6 py-5 w-10">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-[#eb4899] focus:ring-[#eb4899]"
                            checked={catalog.length > 0 && selectedProductIds.length === catalog.length}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedProductIds(catalog.map(p => p._id!));
                              else setSelectedProductIds([]);
                            }}
                          />
                        </th>
                        <th className="px-6 py-5">Product</th>
                        <th className="px-6 py-5">Category</th>
                        <th className="px-6 py-5">Price</th>
                        <th className="px-6 py-5">Status</th>
                        <th className="px-6 py-5">Stock</th>
                        <th className="px-6 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                      {filteredCatalog.map((p) => (
                        <tr key={p._id} className={`hover:bg-gray-50/50 transition-colors group ${selectedProductIds.includes(p._id!) ? 'bg-pink-50/30' : ''}`}>
                          <td className="px-6 py-4">
                            <input 
                              type="checkbox" 
                              className="rounded border-gray-300 text-[#eb4899] focus:ring-[#eb4899]"
                              checked={selectedProductIds.includes(p._id!)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedProductIds([...selectedProductIds, p._id!]);
                                else setSelectedProductIds(selectedProductIds.filter(id => id !== p._id));
                              }}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <img src={p.image} className="w-12 h-14 object-cover rounded-lg bg-gray-100" />
                              <div className="min-w-0">
                                <p className="font-bold text-gray-900 truncate">{p.name}</p>
                                <p className="text-[10px] text-gray-400 uppercase font-medium mt-0.5">SKU: {p.sku || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-600 font-medium">{p.categoryId?.name || "N/A"}</span>
                            {(p as any).size && <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Size: {(p as any).size}</p>}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-gray-900">${p.price.toFixed(2)}</span>
                          </td>
                          <td className="px-6 py-4">
                            {p.assured ? (
                              <span className="bg-pink-100 text-[#eb4899] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Assured</span>
                            ) : p.trending ? (
                              <span className="bg-[#fdf2f8] text-[#be185d] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Trending</span>
                            ) : p.bestseller ? (
                              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Bestseller</span>
                            ) : p.newarrival ? (
                              <span className="bg-[#eff6ff] text-[#1d4ed8] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">New Arrival</span>
                            ) : (
                              <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Classic</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-32">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className={`text-[10px] font-bold uppercase ${
                                  ((p as any).inStock || 0) < 10 ? 'text-orange-500' : 'text-green-600'
                                }`}>
                                  {(p as any).inStock || 0} in stock
                                </span>
                              </div>
                              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all ${
                                    ((p as any).inStock || 0) < 10 ? 'bg-orange-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min(100, (((p as any).inStock || 0) / 100) * 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => { setProductEditing(p); setIsProductModalOpen(true); }}
                                className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => removeProduct(p._id!)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-5 bg-[#fcfcfc] border-t flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Showing {filteredCatalog.length} of {catalog.length} Products
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

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Value</p>
                    <p className="text-2xl font-bold mt-1">${catalog.reduce((acc, p) => acc + (p.price * ((p as any).inStock || 0)), 0).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-green-600">
                    <TrendingUp size={14} />
                    <span className="text-xs font-bold">12% growth</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Low Stock</p>
                    <p className="text-2xl font-bold mt-1">{catalog.filter(p => ((p as any).inStock || 0) < 10).length} Items</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-orange-500">
                    <AlertCircle size={14} />
                    <span className="text-xs font-bold">Needs restock</span>
                  </div>
                </div>

                <div className="bg-[#fdf2f8] p-6 rounded-2xl shadow-sm border border-pink-100 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-pink-400">Active Discounts</p>
                    <p className="text-2xl font-bold mt-1 text-[#be185d]">{codes.length} Promos</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#be185d]">
                    <Clock size={14} />
                    <span className="text-xs font-bold">3 ends soon</span>
                  </div>
                </div>

                <div className="bg-[#111827] p-6 rounded-2xl shadow-sm space-y-4 text-white">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">New Reviews</p>
                    <p className="text-2xl font-bold mt-1">+{reviews.length} This Week</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold">4.8 Avg Rating</span>
                  </div>
                </div>
              </div>
            </div>
          )}

         

        {tab === 'navigation' && (
          <div className="max-w-[1200px] mx-auto">
            <NavManager initial={nav} onSave={saveNavAll} />
          </div>
        )}

        {tab === 'budgets' && site && (
          <div className="max-w-[1200px] mx-auto">
            <BudgetManager 
              initial={site.budgets || []} 
              onSave={(b) => saveSiteAll({ ...site, budgets: b })} 
            />
          </div>
        )}

        {tab === 'discounts' && (
          <DiscountsManagement 
            codes={codes} 
            onSave={saveCodesAll} 
            onRefresh={async () => setCodes(await adminService.getDiscounts())} 
          />
        )}

        {tab === 'site' && site && (
          <SiteSettings initial={site} onSave={saveSiteAll} />
        )}

        {tab === 'orders' && (
          <OrdersManagement 
            orders={orders} 
            onUpdateStatus={updateOrderStatus} 
            onDeleteOrder={deleteOrder}
            onBulkDeleteOrders={bulkDeleteOrders}
          />
        )}

        {tab === 'customers' && (
          <CustomersManagement users={users} />
        )}

        {tab === 'inventory' && (
          <InventoryManagement products={catalog} />
        )}

        {tab === 'categories' && (
          <CategoryManagement 
            categories={galleryCategories} 
            onRefresh={async () => setGalleryCategories(await adminService.getAdminGalleryCategories())}
            onEdit={(cat) => { setCategoryEditing(cat); setIsCategoryModalOpen(true); }}
            onAdd={() => { setCategoryEditing(undefined); setIsCategoryModalOpen(true); }}
          />
        )}

        {(tab === 'analytics' || tab === 'dashboard') && (
          <Analytics data={dashboardData} />
        )}

        {tab === 'newsletter' && (
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-serif">Email</th>
                    <th className="px-6 py-4 font-serif">Joined</th>
                    <th className="px-6 py-4 font-serif">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((s) => (
                    <tr key={s._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">{s.email}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4"><button onClick={() => deleteSubscriber(s._id)} className="text-red-500 text-xs font-bold uppercase hover:underline">Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'inbox' && (
          <div className="max-w-[1200px] mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Customer Inbox</h2>
                <p className="text-gray-500 mt-1">Manage and respond to customer inquiries.</p>
              </div>
              <button className="bg-[#eb4899] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#d43f8a] transition-all shadow-md shadow-pink-500/20">
                <Plus size={18} />
                New Message
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Total Messages</p>
                <div className="flex items-end justify-between">
                  <p className="text-4xl font-bold">{totalMessages.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-green-500 text-xs font-bold">
                    <TrendingUp size={14} />
                    <span>+12%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Pending</p>
                <div className="flex items-end justify-between">
                  <p className="text-4xl font-bold">{pendingMessagesCount.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-pink-500 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                    <span>-5%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Resolved</p>
                <div className="flex items-end justify-between">
                  <p className="text-4xl font-bold">{resolvedMessagesCount.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-green-500 text-xs font-bold">
                    <span>+18%</span>
                    <span className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center text-[10px]">✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by customer name or email..."
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none"
                  value={inboxSearch}
                  onChange={(e) => setInboxSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <select 
                  className="flex-1 md:flex-none px-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-pink-500/20"
                  value={inboxStatusFilter}
                  onChange={(e) => setInboxStatusFilter(e.target.value)}
                >
                  <option>All Status</option>
                  <option>Pending</option>
                  <option>Resolved</option>
                </select>
                <div className="relative">
                  <button 
                    onClick={handleBulkDeleteMessages}
                    disabled={selectedMessageIds.length === 0}
                    className={`px-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all ${selectedMessageIds.length > 0 ? 'text-red-500 border-red-100 hover:bg-red-50' : 'text-gray-500 opacity-50 cursor-not-allowed'}`}
                  >
                    <LayoutGrid size={18} />
                    Bulk Delete {selectedMessageIds.length > 0 && `(${selectedMessageIds.length})`}
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#fcfcfc] border-b text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    <tr>
                      <th className="px-8 py-6 w-10">
                        <input 
                          type="checkbox" 
                          className="rounded-md border-gray-300 text-[#eb4899] focus:ring-[#eb4899] w-4 h-4"
                          checked={filteredMessages.length > 0 && selectedMessageIds.length === filteredMessages.length}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedMessageIds(filteredMessages.map(m => m._id));
                            else setSelectedMessageIds([]);
                          }}
                        />
                      </th>
                      <th className="px-6 py-6">Customer</th>
                      <th className="px-6 py-6">Subject</th>
                      <th className="px-6 py-6">Date</th>
                      <th className="px-6 py-6 text-center">Status</th>
                      <th className="px-6 py-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredMessages.map((m) => (
                      <tr key={m._id} className={`hover:bg-gray-50/50 transition-colors group ${selectedMessageIds.includes(m._id) ? 'bg-pink-50/30' : ''}`}>
                        <td className="px-8 py-6">
                          <input 
                            type="checkbox" 
                            className="rounded-md border-gray-300 text-[#eb4899] focus:ring-[#eb4899] w-4 h-4"
                            checked={selectedMessageIds.includes(m._id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedMessageIds([...selectedMessageIds, m._id]);
                              else setSelectedMessageIds(selectedMessageIds.filter(id => id !== m._id));
                            }}
                          />
                        </td>
                        <td className="px-6 py-6">
                          <div>
                            <p className="font-bold text-gray-900">{m.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{m.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <p className="text-sm text-gray-600 font-medium max-w-xs truncate">{m.subject || 'No Subject'}</p>
                          <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">{m.message}</p>
                        </td>
                        <td className="px-6 py-6 text-sm text-gray-500 font-medium">
                          {new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-6 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-tight ${
                            m.status === 'resolved' 
                              ? 'bg-pink-100 text-pink-600' 
                              : 'bg-white border-2 border-pink-100 text-pink-500'
                          }`}>
                            {m.status === 'resolved' ? 'Resolved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center justify-end gap-2">
                            {m.status !== 'resolved' && (
                              <button 
                                onClick={() => handleUpdateMessageStatus(m._id, 'resolved')}
                                className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-xl transition-all"
                                title="Mark as Resolved"
                              >
                                <Sparkles size={18} />
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                if (window.confirm('Delete message?')) {
                                  adminService.deleteMessage(m._id).then(() => {
                                    setMessages(messages.filter(msg => msg._id !== m._id));
                                    showToast('Message deleted');
                                  });
                                }
                              }}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              title="Delete Message"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-8 py-6 bg-[#fcfcfc] border-t flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  Showing 1 to {filteredMessages.length} of {totalMessages} entries
                </p>
                <div className="flex items-center gap-2">
                  <button className="p-2 border border-gray-100 rounded-xl hover:bg-white transition-all disabled:opacity-50 shadow-sm" disabled>
                    <ChevronLeft size={16} />
                  </button>
                  <div className="flex gap-1">
                    <button className="w-8 h-8 rounded-xl bg-pink-500 text-white text-xs font-bold shadow-lg shadow-pink-500/20 transition-all">1</button>
                    <button className="w-8 h-8 rounded-xl bg-white border border-gray-100 text-gray-500 text-xs font-bold hover:bg-gray-50 transition-all shadow-sm">2</button>
                    <button className="w-8 h-8 rounded-xl bg-white border border-gray-100 text-gray-500 text-xs font-bold hover:bg-gray-50 transition-all shadow-sm">3</button>
                  </div>
                  <button className="p-2 border border-gray-100 rounded-xl hover:bg-white transition-all disabled:opacity-50 shadow-sm" disabled>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'reviews' && (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl mb-4">Product Reviews ({reviews.length})</h2>
            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 font-serif">Product</th>
                      <th className="px-6 py-4 font-serif">User</th>
                      <th className="px-6 py-4 font-serif">Rating</th>
                      <th className="px-6 py-4 font-serif">Comment</th>
                      <th className="px-6 py-4 font-serif">Status</th>
                      <th className="px-6 py-4 font-serif">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((r) => (
                      <tr key={r._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-bold">{r.product?.name || 'N/A'}</td>
                        <td className="px-6 py-4">{r.user?.name || 'Anonymous'}</td>
                        <td className="px-6 py-4 text-hot-pink font-bold">{'★'.repeat(r.rating)}</td>
                        <td className="px-6 py-4 max-w-xs truncate">{r.comment}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold ${r.status === 'approved' ? 'bg-green-100 text-green-700' : r.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 space-x-3">
                          {r.status !== 'approved' && <button onClick={() => updateReviewStatus(r._id, 'approved')} className="text-green-600 hover:underline text-xs font-bold uppercase">Approve</button>}
                          {r.status !== 'rejected' && <button onClick={() => updateReviewStatus(r._id, 'rejected')} className="text-orange-600 hover:underline text-xs font-bold uppercase">Reject</button>}
                          <button onClick={() => deleteReview(r._id)} className="text-red-600 hover:underline text-xs font-bold uppercase">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'testimonials' && (
          <div className="space-y-12 max-w-[1400px] mx-auto pb-24">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex-1 max-w-2xl">
                <div className="relative group mb-6">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#eb4899] transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search testimonials..." 
                    className="w-full pl-16 pr-8 py-5 bg-white border-none rounded-[2rem] text-sm font-bold shadow-xl shadow-gray-100/50 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-gray-300"
                    value={testimonialsSearch}
                    onChange={(e) => setTestimonialsSearch(e.target.value)}
                  />
                </div>
                <h1 className="text-[3.5rem] font-black tracking-tighter text-gray-900 leading-[0.9] mb-4">
                  Manage Testimonials<span className="text-[#eb4899]">.</span>
                </h1>
                <p className="text-lg font-bold text-gray-400 uppercase tracking-widest leading-relaxed max-w-xl">
                  Curate and publish high-impact customer feedback to your storefront.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button className="px-8 py-5 bg-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] text-gray-900 shadow-xl shadow-gray-100/50 hover:bg-gray-50 transition-all flex items-center gap-3">
                  <Download size={16} className="text-[#eb4899]" />
                  Export CSV
                </button>
                <button className="px-10 py-5 bg-[#be185d] text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-pink-900/20 hover:bg-black transition-all">
                  Batch Actions
                </button>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr,420px] gap-12 items-start">
              <div className="space-y-8">
                {testimonials
                  .filter(t => t.customerName.toLowerCase().includes(testimonialsSearch.toLowerCase()) || t.content.toLowerCase().includes(testimonialsSearch.toLowerCase()))
                  .map((t) => (
                    <div key={t._id} className="bg-white rounded-[3rem] p-10 shadow-xl shadow-gray-100/50 border border-gray-50/50 group hover:shadow-2xl hover:shadow-pink-100/20 transition-all duration-500">
                      <div className="flex gap-8 items-start mb-8">
                        <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg shadow-gray-200 ring-4 ring-gray-50 group-hover:ring-pink-50 transition-all flex-shrink-0 bg-gray-50">
                          <img src={t.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.customerName)}&background=fdf2f8&color=eb4899&bold=true`} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex-1 pt-2">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="text-2xl font-black text-gray-900 tracking-tight mb-1">{t.customerName}</h4>
                              <p className="text-[10px] font-black text-[#eb4899] uppercase tracking-[0.2em]">
                                {t.tag} {t.product && <span className="text-gray-300 mx-1">•</span>} {t.product}
                              </p>
                            </div>
                            <div className="flex gap-1 bg-pink-50/50 px-3 py-1.5 rounded-full">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} className={`${i < t.rating ? 'text-[#eb4899] fill-[#eb4899]' : 'text-gray-200'}`} />
                              ))}
                            </div>
                          </div>
                          <blockquote className="text-xl font-medium text-gray-600 leading-relaxed italic mt-4">
                            "{t.content}"
                          </blockquote>
                        </div>
                      </div>

                      <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Visible on Storefront</span>
                            <button 
                              onClick={() => toggleTestimonialStatus(t._id, t.status)}
                              className={`w-12 h-6 rounded-full transition-all relative ${t.status === 'visible' ? 'bg-[#eb4899]' : 'bg-gray-200'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${t.status === 'visible' ? 'left-7' : 'left-1'}`} />
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <button 
                            onClick={() => setTestimonialEditing(t)}
                            className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 hover:bg-pink-50 hover:text-[#eb4899] transition-all flex items-center justify-center group/btn"
                          >
                            <Edit size={20} className="group-hover/btn:scale-110 transition-transform" />
                          </button>
                          <button 
                            onClick={() => deleteTestimonial(t._id)}
                            className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center group/btn"
                          >
                            <Trash2 size={20} className="group-hover/btn:scale-110 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                {testimonials.length === 0 && (
                  <div className="py-32 flex flex-col items-center justify-center text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-gray-100 flex items-center justify-center text-[#eb4899] mb-6">
                      <MessageSquare size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">No testimonials found</h3>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Start by adding some feedback from your happy customers.</p>
                  </div>
                )}
              </div>

              <div className="sticky top-28">
                <TestimonialForm 
                  products={catalog} 
                  initial={testimonialEditing} 
                  onSave={saveTestimonial}
                  onCancel={() => setTestimonialEditing(undefined)}
                />
              </div>
            </div>
          </div>
        )}

        {tab === 'gallery' && (
          <div className="space-y-6">
             <h2 className="font-serif text-2xl">Gallery Management</h2>
             <div className="grid lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-4">
                   <GalleryImageForm categories={galleryCategories} onSave={saveGalleryImage} />
                   <GalleryCategoryForm onSave={saveGalleryCategory} />
                </div>
                <div className="lg:col-span-3 space-y-8">
                  <div className="space-y-4">
                    <h3 className="font-serif text-xl border-b pb-2">Images ({galleryImages.length})</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {galleryImages.map(img => (
                        <div key={img._id} className="bg-white border p-2 rounded relative group">
                          <img src={img.imageUrl} className="w-full h-40 object-cover rounded" />
                          <div className="mt-2">
                            <p className="text-xs font-bold truncate">{img.title}</p>
                            <p className="text-[10px] text-gray-400 uppercase">{(img.category as any)?.name}</p>
                          </div>
                          <button onClick={() => deleteGalleryImage(img._id)} className="absolute top-4 right-4 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-serif text-xl border-b pb-2">Categories ({galleryCategories.length})</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {galleryCategories.map(cat => (
                          <div key={cat._id} className="flex justify-between items-center bg-white border p-3 rounded">
                             <div className="min-w-0">
                               <p className="text-sm font-bold truncate">{cat.name}</p>
                               <p className="text-[10px] text-gray-400 truncate">{cat.slug}</p>
                             </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
             </div>
          </div>
        )}
        </main>
        
      </div>
      <ProductManagementModal 
            isOpen={isProductModalOpen}
            onClose={() => { setProductEditing(undefined); setIsProductModalOpen(false); }}
            onSave={saveProduct}
            initialProduct={productEditing}
          />
          <CategoryManagementModal
            isOpen={isCategoryModalOpen}
            onClose={() => { setCategoryEditing(undefined); setIsCategoryModalOpen(false); }}
            onSave={saveCategory}
            initialCategory={categoryEditing}
          />
    </div>
  );
}
