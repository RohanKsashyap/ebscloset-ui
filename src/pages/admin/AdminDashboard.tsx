import { useState, useEffect, useMemo } from 'react';
import type { Product } from '../../services/productService';
import { adminService, type Review, type GalleryCategory } from '../../services/adminService';
import type { Testimonial, GalleryImage } from '../../services/siteService';
import { useNavigate } from 'react-router-dom';
import OrdersManagement from './OrdersManagement';
import DiscountsManagement from './DiscountsManagement';
import CustomersManagement from './CustomersManagement';
import Analytics from './Analytics';
import SiteSettings from './SiteSettings';
import { useToast } from '../../context/ToastContext';
import { 
  LayoutGrid, 
  ShoppingBag, 
  Mail, 
  Inbox, 
  Star, 
  MessageSquare, 
  Image as ImageIcon, 
  Tag, 
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
  X,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Video,
  Upload,
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
  budgets?: any[];
};

async function filesToBase64(files: FileList | File[]): Promise<string[]> {
  const list: File[] = Array.from(files instanceof FileList ? files : files as File[]);
  const results = await Promise.all(
    list.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        })
    )
  );
  return results;
}

async function uploadImages(files: FileList | File[]): Promise<string[]> {
  return filesToBase64(files);
}

function ProductForm({ initial, onSave }: { initial?: Product; onSave: (p: Product) => void }) {
  const makeDefault = (): Product => ({
    name: '', price: 0, image: '', images: [], category: 'Age 7-9', description: '', sizes: ['7-8','9-10','11-12','12-13'], reviews: [], sku: '', materials: '', care: '', stock: { '7-8': 0, '9-10': 0, '11-12': 0, '12-13': 0 }
  });
  const [form, setForm] = useState<Product>(initial ?? makeDefault());
  useEffect(() => { setForm(initial ?? makeDefault()); }, [initial]);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const base64 = await uploadImages(e.target.files);
    setForm((f) => ({ ...f, images: [...(f.images || []), ...base64], image: f.image || base64[0] }));
  };

  const onCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const base64 = await uploadImages(e.target.files);
    setForm((f) => ({ ...f, image: base64[0] }));
  };

  const removeImageAt = (i: number) => {
    setForm((f) => {
      const imgs = [...(f.images ?? [])];
      imgs.splice(i, 1);
      return { ...f, images: imgs };
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Product Name</label>
          <input className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5" placeholder="e.g. Silk Midi Dress" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Price (₹)</label>
          <input className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5" type="number" placeholder="0.00" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Category</label>
          <input className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5" placeholder="e.g. Dresses" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">SKU</label>
          <input className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5" placeholder="LUX-2024-001" value={form.sku ?? ''} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Description</label>
        <textarea className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5 h-32 resize-none" placeholder="Describe your product..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Materials</label>
          <input className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5" value={form.materials ?? ''} onChange={(e) => setForm({ ...form, materials: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Care Instructions</label>
          <input className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5" value={form.care ?? ''} onChange={(e) => setForm({ ...form, care: e.target.value })} />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Stock by Size</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(form.sizes || []).map((s) => (
            <div key={s} className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-gray-400">{s}</span>
              <input className="bg-transparent border-none p-0 text-sm font-bold focus:ring-0" type="number" value={form.stock?.[s] ?? 0} onChange={(e) => setForm({ ...form, stock: { ...(form.stock ?? {}), [s]: Number(e.target.value) } })} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-6 py-2">
         <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${form.isTrending ? 'bg-black border-black' : 'border-gray-200 group-hover:border-gray-300'}`}>
              {form.isTrending && <CheckCircle2 size={12} className="text-white" />}
            </div>
            <input type="checkbox" className="hidden" checked={!!form.isTrending} onChange={(e) => setForm({...form, isTrending: e.target.checked})} />
            <span className="text-sm font-medium text-gray-600">Trending Product</span>
         </label>
         <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${form.isNewArrival ? 'bg-black border-black' : 'border-gray-200 group-hover:border-gray-300'}`}>
              {form.isNewArrival && <CheckCircle2 size={12} className="text-white" />}
            </div>
            <input type="checkbox" className="hidden" checked={!!form.isNewArrival} onChange={(e) => setForm({...form, isNewArrival: e.target.checked})} />
            <span className="text-sm font-medium text-gray-600">New Arrival</span>
         </label>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <label className="bg-white border-2 border-dashed border-gray-200 px-6 py-4 rounded-2xl cursor-pointer hover:border-gray-300 transition-all flex flex-col items-center gap-1 flex-1">
            <Plus size={20} className="text-gray-400" />
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Add Images</span>
            <input type="file" multiple accept="image/*" className="hidden" onChange={onFile} />
          </label>
          <label className="bg-white border-2 border-dashed border-gray-200 px-6 py-4 rounded-2xl cursor-pointer hover:border-gray-300 transition-all flex flex-col items-center gap-1 flex-1">
            <ImageIcon size={20} className="text-gray-400" />
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Set Cover</span>
            <input type="file" accept="image/*" className="hidden" onChange={onCoverFile} />
          </label>
        </div>

        {form.images?.length ? (
          <div className="flex flex-wrap gap-3">
            {form.images.map((src, i) => (
              <div key={i} className="relative w-20 h-24 group rounded-xl overflow-hidden shadow-sm border">
                <img src={src} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  className="absolute top-1 right-1 w-6 h-6 rounded-lg bg-white/90 backdrop-blur shadow-sm text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                  onClick={() => removeImageAt(i)}
                >
                  <Trash2 size={14} />
                </button>
                {form.image === src && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm text-white text-[8px] text-center font-bold uppercase py-1">
                    Cover
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="pt-4">
        <button 
          className="w-full bg-[#f26322] text-white py-4 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-[#d9561b] transition-all shadow-lg shadow-orange-500/20" 
          onClick={() => onSave(form)}
        >
          Save Product Details
        </button>
      </div>
    </div>
  );
}

function NavManager({ initial, onSave }: { initial: NavCategory[]; onSave: (n: NavCategory[]) => void }) {
  const [nav, setNav] = useState<NavCategory[]>(initial);
  useEffect(() => { setNav(initial); }, [initial]);

  const addCategory = () => setNav([...nav, { name: 'New Category', items: [] }]);
  const addItem = (ci: number) => {
    const copy = [...nav];
    copy[ci].items.push({ label: 'New Item', href: '/shop' });
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
    <div className="space-y-4">
      {nav.map((c, ci) => (
        <div key={ci} className="border p-4 bg-gray-50 rounded">
          <div className="flex gap-2 mb-3">
            <input className="border px-3 py-2 flex-1" placeholder="Category Name" value={c.name} onChange={(e) => {
              const copy = [...nav]; copy[ci].name = e.target.value; setNav(copy);
            }} />
            <input className="border px-3 py-2 flex-1" placeholder="Category Link (optional)" value={c.href ?? ''} onChange={(e) => {
              const copy = [...nav]; copy[ci].href = e.target.value; setNav(copy);
            }} />
            <button className="text-red-500 hover:text-red-700 text-xs uppercase font-bold px-2" onClick={() => removeCategory(ci)}>Remove</button>
          </div>
          <div className="space-y-2 pl-4 border-l-2 border-gray-300">
            {c.items.map((it, ii) => (
              <div key={ii} className="flex gap-2 items-center">
                <input className="border px-3 py-2 flex-1 text-sm" placeholder="Label" value={it.label} onChange={(e) => {
                  const copy = [...nav]; copy[ci].items[ii].label = e.target.value; setNav(copy);
                }} />
                <input className="border px-3 py-2 flex-1 text-sm" placeholder="Link" value={it.href} onChange={(e) => {
                  const copy = [...nav]; copy[ci].items[ii].href = e.target.value; setNav(copy);
                }} />
                <button className="text-gray-400 hover:text-red-500 text-lg" onClick={() => removeItem(ci, ii)}>×</button>
              </div>
            ))}
            <button className="text-xs text-hot-pink font-bold uppercase hover:underline mt-1" onClick={() => addItem(ci)}>+ Add Item</button>
          </div>
        </div>
      ))}
      <div className="flex gap-3">
        <button className="border border-gray-300 px-4 py-2 text-xs tracking-widest uppercase hover:bg-gray-50" onClick={addCategory}>Add Category</button>
        <button className="bg-hot-pink text-white px-6 py-2 text-xs tracking-widest uppercase hover:bg-hot-pink/90" onClick={() => onSave(nav)}>Save Navigation</button>
      </div>
    </div>
  );
}

function TestimonialForm({ onSave }: { onSave: (data: FormData) => void }) {
  const [form, setForm] = useState({ name: '', role: '', content: '', rating: 5 });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('role', form.role);
    fd.append('content', form.content);
    fd.append('rating', String(form.rating));
    if (file) fd.append('image', file);
    onSave(fd);
    setForm({ name: '', role: '', content: '', rating: 5 });
    setFile(null);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border p-4 space-y-3 rounded">
      <input className="border px-3 py-2 w-full" placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
      <input className="border px-3 py-2 w-full" placeholder="Role (e.g. Happy Customer)" value={form.role} onChange={e => setForm({...form, role: e.target.value})} />
      <textarea className="border px-3 py-2 w-full" placeholder="Content" value={form.content} onChange={e => setForm({...form, content: e.target.value})} required />
      <select className="border px-3 py-2 w-full" value={form.rating} onChange={e => setForm({...form, rating: Number(e.target.value)})}>
        {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
      </select>
      <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button type="submit" className="bg-hot-pink text-white px-4 py-2 text-[10px] font-bold uppercase w-full">Add Testimonial</button>
    </form>
  );
}

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
  const [tab, setTab] = useState<'products'|'navigation'|'discounts'|'site'|'orders'|'newsletter'|'inbox'|'reviews'|'testimonials'|'gallery'|'customers'|'analytics'|'settings'>('analytics');
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [productEditing, setProductEditing] = useState<Product | undefined>(undefined);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [nav, setNav] = useState<NavCategory[]>([]);
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [site, setSite] = useState<SiteSettings | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
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
    if (tab === 'analytics') adminService.getDashboard().then(setDashboardData);
    if (tab === 'orders') adminService.getOrders().then(setOrders);
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

  const saveProduct = async (p: Product) => {
    try {
      if (p._id) await adminService.updateProduct(p._id, p);
      else await adminService.createProduct(p);
      setCatalog(await adminService.getProducts());
      setProductEditing(undefined);
      setIsProductModalOpen(false);
      alert('Saved');
    } catch { alert('Error'); }
  };

  const removeProduct = async (id: string) => {
    if (!window.confirm('Delete?')) return;
    try {
      await adminService.deleteProduct(id);
      setCatalog(await adminService.getProducts());
    } catch { alert('Error'); }
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
      setOrders(await adminService.getOrders());
    } catch { alert('Error'); }
  };

  const deleteSubscriber = async (id: string) => {
    try { await adminService.deleteSubscriber(id); setSubscribers(await adminService.getSubscribers()); } catch { alert('Error'); }
  };

  const deleteMessage = async (id: string) => {
    try { await adminService.deleteMessage(id); setMessages(await adminService.getMessages()); } catch { alert('Error'); }
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
      await adminService.addTestimonial(fd);
      setTestimonials(await adminService.getAdminTestimonials());
      alert('Testimonial added');
    } catch { alert('Error adding testimonial'); }
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

  const navItems = [{ id: 'analytics', label: 'Analytics', icon: BarChart },
    { id: 'products', label: 'Products', icon: LayoutGrid },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'discounts', label: 'Discounts', icon: Tag },
  ] as const;

  const secondaryNavItems = [
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'navigation', label: 'Navigation', icon: NavIcon },
  ] as const;

  if (loading) return <div className="p-20 text-center font-serif text-2xl">Loading Magic...</div>;

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
                {tab === 'products' ? 'Catalog Management' : `${tab} Management`}
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

        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#fafafa]">
          {tab === 'products' && (
            <div className="max-w-[1200px] mx-auto space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Product Catalog</h2>
                  <p className="text-gray-500 mt-1">Manage, update and track your store Products.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="bg-white border px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
                    <Filter size={18} />
                    Filters
                  </button>
                  <button 
                    onClick={() => { setProductEditing(undefined); setIsProductModalOpen(true); }}
                    className="bg-[#f26322] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#d9561b] transition-all shadow-md shadow-orange-500/20"
                  >
                    <Plus size={18} />
                    New Product
                  </button>
                </div>
              </div>

              {/* Tabs / Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                {['All Products', 'Trending', 'New Arrivals', 'Best Sellers', 'Out of Stock'].map((filter, i) => (
                  <button 
                    key={filter}
                    className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                      i === 0 ? 'bg-black text-white' : 'bg-[#f1f1f1] text-[#333] hover:bg-[#e1e1e1]'
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
                        <th className="px-6 py-5">Product</th>
                        <th className="px-6 py-5">Category</th>
                        <th className="px-6 py-5">Price</th>
                        <th className="px-6 py-5">Status</th>
                        <th className="px-6 py-5">Stock</th>
                        <th className="px-6 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                      {catalog.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50/50 transition-colors group">
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
                            <span className="text-gray-600 font-medium">{p.category}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-gray-900">₹{p.price.toFixed(2)}</span>
                          </td>
                          <td className="px-6 py-4">
                            {p.isTrending ? (
                              <span className="bg-[#fdf2f8] text-[#be185d] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Trending</span>
                            ) : p.isNewArrival ? (
                              <span className="bg-[#eff6ff] text-[#1d4ed8] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">New Arrival</span>
                            ) : (
                              <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Classic</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-32">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className={`text-[10px] font-bold uppercase ${
                                  Object.values(p.stock || {}).reduce((a, b) => a + b, 0) < 10 ? 'text-orange-500' : 'text-green-600'
                                }`}>
                                  {Object.values(p.stock || {}).reduce((a, b) => a + b, 0)} in stock
                                </span>
                              </div>
                              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all ${
                                    Object.values(p.stock || {}).reduce((a, b) => a + b, 0) < 10 ? 'bg-orange-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min(100, (Object.values(p.stock || {}).reduce((a, b) => a + b, 0) / 100) * 100)}%` }}
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
                    Showing {catalog.length} of {catalog.length} Products
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
                    <p className="text-2xl font-bold mt-1">₹{catalog.reduce((acc, p) => acc + (p.price * Object.values(p.stock || {}).reduce((a, b) => a + b, 0)), 0).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-green-600">
                    <TrendingUp size={14} />
                    <span className="text-xs font-bold">12% growth</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Low Stock</p>
                    <p className="text-2xl font-bold mt-1">{catalog.filter(p => Object.values(p.stock || {}).reduce((a, b) => a + b, 0) < 10).length} Items</p>
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

          {tab === 'products' && isProductModalOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
                <div className="sticky top-0 bg-white px-8 py-6 border-b flex items-center justify-between z-10">
                  <h3 className="text-2xl font-bold">{productEditing ? 'Edit Product' : 'New Product'}</h3>
                  <button 
                    onClick={() => { setProductEditing(undefined); setIsProductModalOpen(false); }}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="p-8">
                  <ProductForm initial={productEditing} onSave={saveProduct} />
                </div>
              </div>
            </div>
          )}

        {tab === 'navigation' && (
          <div className="max-w-3xl">
            <h2 className="font-serif text-2xl mb-4">Store Navigation</h2>
            <NavManager initial={nav} onSave={saveNavAll} />
          </div>
        )}

        {tab === 'discounts' && (
          <DiscountsManagement codes={codes} onSave={saveCodesAll} />
        )}

        {tab === 'site' && site && (
          <SiteSettings initial={site} onSave={saveSiteAll} />
        )}

        {tab === 'orders' && (
          <OrdersManagement orders={orders} onUpdateStatus={updateOrderStatus} />
        )}

        {tab === 'customers' && (
          <CustomersManagement users={users} />
        )}

        {tab === 'analytics' && (
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
          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m._id} className="bg-white border p-6 rounded shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-lg">{m.name} <span className="text-xs font-normal text-gray-400 font-sans ml-2">&lt;{m.email}&gt;</span></p>
                  <button onClick={() => deleteMessage(m._id)} className="text-red-500 text-xs font-bold uppercase">Delete</button>
                </div>
                <p className="text-gray-600 text-sm italic border-l-4 border-hot-pink/20 pl-4 py-2 bg-gray-50">{m.message}</p>
                <p className="text-[10px] text-gray-400 mt-4 text-right">{new Date(m.createdAt).toLocaleString()}</p>
              </div>
            ))}
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
          <div className="space-y-6">
             <h2 className="font-serif text-2xl">Testimonials</h2>
             <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                   <h3 className="font-serif text-xl mb-4">Add New</h3>
                   <TestimonialForm onSave={saveTestimonial} />
                </div>
                <div className="lg:col-span-2">
                   <h3 className="font-serif text-xl mb-4">Existing Testimonials ({testimonials.length})</h3>
                   <div className="grid sm:grid-cols-2 gap-4">
                      {testimonials.map(t => (
                        <div key={t._id} className="bg-white border p-4 rounded shadow-sm flex gap-4">
                          {t.image && <img src={t.image} className="w-16 h-16 rounded-full object-cover border shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between">
                              <p className="font-bold truncate">{t.name}</p>
                              <button onClick={() => deleteTestimonial(t._id)} className="text-red-500 text-[10px] uppercase font-bold ml-2">Delete</button>
                            </div>
                            <p className="text-xs text-gray-400 mb-2">{t.role}</p>
                            <p className="text-sm italic text-gray-600 line-clamp-3">"{t.content}"</p>
                            <div className="text-hot-pink text-xs mt-2">{'★'.repeat(t.rating)}</div>
                          </div>
                        </div>
                      ))}
                   </div>
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
    </div>
  );
}
