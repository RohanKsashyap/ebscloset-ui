import { useState, useEffect } from 'react';
import type { Product } from '../../services/productService';
import { adminService, type Review, type GalleryCategory } from '../../services/adminService';
import type { Testimonial, GalleryImage } from '../../services/siteService';
import { useNavigate } from 'react-router-dom';

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
    <div className="border p-4 space-y-3 bg-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className="border px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="border px-3 py-2" type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        <input className="border px-3 py-2" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input className="border px-3 py-2" placeholder="SKU" value={form.sku ?? ''} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
      </div>
      <textarea className="border px-3 py-2 w-full" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className="border px-3 py-2" placeholder="Materials" value={form.materials ?? ''} onChange={(e) => setForm({ ...form, materials: e.target.value })} />
        <input className="border px-3 py-2" placeholder="Care" value={form.care ?? ''} onChange={(e) => setForm({ ...form, care: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(form.sizes || []).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <label className="text-sm">{s}</label>
            <input className="border px-2 py-1 w-20" type="number" value={form.stock?.[s] ?? 0} onChange={(e) => setForm({ ...form, stock: { ...(form.stock ?? {}), [s]: Number(e.target.value) } })} />
          </div>
        ))}
      </div>
      <div className="flex gap-2 items-center">
         <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!form.isTrending} onChange={(e) => setForm({...form, isTrending: e.target.checked})} />
            Trending
         </label>
         <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!form.isNewArrival} onChange={(e) => setForm({...form, isNewArrival: e.target.checked})} />
            New Arrival
         </label>
      </div>
      <div>
        <div className="flex items-center gap-3">
          <label className="text-xs border px-2 py-1 rounded cursor-pointer hover:bg-gray-50">
            Upload Images
            <input type="file" multiple accept="image/*" className="hidden" onChange={onFile} />
          </label>
          <label className="text-xs border px-2 py-1 rounded cursor-pointer hover:bg-gray-50">
            Cover Image
            <input type="file" accept="image/*" className="hidden" onChange={onCoverFile} />
          </label>
        </div>
        {form.images?.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {form.images.map((src, i) => (
              <div key={i} className="relative w-16 h-20 group">
                <img src={src} alt="preview" className="w-full h-full object-cover rounded border" />
                <button
                  type="button"
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImageAt(i)}
                >
                  ✕
                </button>
                {form.image === src && <span className="absolute bottom-0 left-0 right-0 bg-hot-pink text-white text-[8px] text-center uppercase py-0.5">Cover</span>}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div className="pt-2">
        <button className="bg-hot-pink text-white px-6 py-2 text-xs tracking-widest uppercase hover:bg-hot-pink/90 transition-colors" onClick={() => onSave(form)}>Save Product</button>
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

function DiscountsManager({ initial, onSave }: { initial: DiscountCode[]; onSave: (d: DiscountCode[]) => void }) {
  const [codes, setCodes] = useState<DiscountCode[]>(initial);
  useEffect(() => { setCodes(initial); }, [initial]);

  const addCode = () => setCodes([...codes, { code: 'NEWCODE', type: 'percent', value: 10 }]);
  const removeCode = (i: number) => setCodes(codes.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      {codes.map((c, i) => (
        <div key={i} className="grid grid-cols-4 gap-2 items-center border p-2 rounded">
          <input className="border px-3 py-2 uppercase" value={c.code} onChange={(e) => {
            const copy = [...codes]; copy[i].code = e.target.value.toUpperCase(); setCodes(copy);
          }} />
          <select className="border px-3 py-2" value={c.type} onChange={(e) => { const copy = [...codes]; copy[i].type = e.target.value as any; setCodes(copy); }}>
            <option value="percent">Percent (%)</option>
            <option value="amount">Amount (₹)</option>
          </select>
          <input type="number" className="border px-3 py-2" value={c.value} onChange={(e) => { const copy = [...codes]; copy[i].value = Number(e.target.value); setCodes(copy); }} />
          <button className="text-red-500 hover:underline text-xs" onClick={() => removeCode(i)}>Remove</button>
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <button className="border border-gray-300 px-4 py-2 text-xs tracking-widest uppercase hover:bg-gray-50" onClick={addCode}>Add Code</button>
        <button className="bg-hot-pink text-white px-6 py-2 text-xs tracking-widest uppercase hover:bg-hot-pink/90" onClick={() => onSave(codes)}>Save Codes</button>
      </div>
    </div>
  );
}

function SiteManager({ initial, onSave }: { initial: SiteSettings; onSave: (s: SiteSettings) => void }) {
  const [site, setSite] = useState<SiteSettings>(initial);
  useEffect(() => { setSite(initial); }, [initial]);

  const onHeroBannerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const imgs = await uploadImages(e.target.files);
    setSite((s) => ({ ...s, hero: { ...s.hero, bannerImage: imgs[0] } }));
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="border p-6 space-y-4 rounded shadow-sm bg-white">
        <h3 className="font-serif text-xl border-b pb-2">Hero Section</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
            <input className="border px-3 py-2 w-full" value={site.hero.title} onChange={(e) => setSite({ ...site, hero: { ...site.hero, title: e.target.value } })} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Subtitle</label>
            <input className="border px-3 py-2 w-full" value={site.hero.subtitle} onChange={(e) => setSite({ ...site, hero: { ...site.hero, subtitle: e.target.value } })} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Banner Title</label>
            <textarea className="border px-3 py-2 w-full h-20" value={site.hero.bannerTitle} onChange={(e) => setSite({ ...site, hero: { ...site.hero, bannerTitle: e.target.value } })} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Banner Subtitle</label>
            <input className="border px-3 py-2 w-full" value={site.hero.bannerSubtitle} onChange={(e) => setSite({ ...site, hero: { ...site.hero, bannerSubtitle: e.target.value } })} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Banner CTA Text</label>
            <input className="border px-3 py-2 w-full" value={site.hero.bannerCtaText} onChange={(e) => setSite({ ...site, hero: { ...site.hero, bannerCtaText: e.target.value } })} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Banner CTA Link</label>
            <input className="border px-3 py-2 w-full" value={site.hero.bannerCtaHref} onChange={(e) => setSite({ ...site, hero: { ...site.hero, bannerCtaHref: e.target.value } })} />
          </div>
        </div>
        <div className="pt-2">
           <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Banner Image</label>
           <div className="flex items-center gap-4">
              <input type="file" accept="image/*" onChange={onHeroBannerFile} />
              {site.hero.bannerImage && <img src={site.hero.bannerImage} className="w-20 h-20 object-cover border rounded" />}
           </div>
        </div>
      </div>
      
      <div className="flex justify-start">
        <button className="bg-hot-pink text-white px-10 py-3 text-sm tracking-widest uppercase hover:bg-hot-pink/90 shadow-lg" onClick={() => onSave(site)}>Save All Site Settings</button>
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'products'|'navigation'|'discounts'|'site'|'orders'|'newsletter'|'inbox'|'reviews'|'testimonials'|'gallery'>('products');
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [productEditing, setProductEditing] = useState<Product | undefined>(undefined);
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
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [p, n, s, d] = await Promise.all([
          adminService.getProducts(),
          adminService.getNavigation(),
          adminService.getSiteSettings(),
          adminService.getDiscounts()
        ]);
        setCatalog(p);
        setNav(n);
        setSite(s);
        setCodes(d);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  useEffect(() => {
    if (tab === 'orders') adminService.getOrders().then(setOrders);
    if (tab === 'newsletter') adminService.getSubscribers().then(setSubscribers);
    if (tab === 'inbox') adminService.getMessages().then(setMessages);
    if (tab === 'reviews') adminService.getReviews().then(setReviews);
    if (tab === 'testimonials') adminService.getAdminTestimonials().then(setTestimonials);
    if (tab === 'gallery') {
      adminService.getAdminGalleryImages().then(setGalleryImages);
      adminService.getAdminGalleryCategories().then(setGalleryCategories);
    }
  }, [tab]);

  const saveProduct = async (p: Product) => {
    try {
      if (p._id) await adminService.updateProduct(p._id, p);
      else await adminService.createProduct(p);
      setCatalog(await adminService.getProducts());
      setProductEditing(undefined);
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

  if (loading) return <div className="p-20 text-center font-serif text-2xl">Loading Magic...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-[60] shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          <h1 className="font-serif text-xl md:text-2xl text-hot-pink truncate">Admin Dashboard</h1>
        </div>
        <button onClick={logout} className="text-[10px] md:text-sm font-bold text-gray-500 hover:text-black uppercase tracking-widest bg-gray-50 md:bg-transparent px-3 py-1.5 md:p-0 rounded-lg">Logout</button>
      </nav>

      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto relative">
        {/* Sidebar / Tab Navigation */}
        <aside className={`
          fixed lg:sticky lg:top-20 inset-y-0 left-0 z-50
          w-64 bg-white border-r lg:border-none lg:bg-transparent
          transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform duration-300 ease-in-out
          flex flex-col p-6
        `}>
          <div className="space-y-1">
            {(['products','navigation','discounts','site','orders','newsletter','inbox','reviews','testimonials','gallery'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${tab === t ? 'bg-hot-pink text-white shadow-lg shadow-hot-pink/20' : 'text-gray-500 hover:bg-white hover:text-hot-pink hover:shadow-sm'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <main className="flex-1 p-4 md:p-8 min-w-0">
          {tab === 'products' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-1">
                <h2 className="font-serif text-2xl mb-6 text-gray-800">Add / Edit</h2>
                <ProductForm initial={productEditing} onSave={saveProduct} />
                {productEditing && (
                  <button className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-hot-pink transition-colors" onClick={() => setProductEditing(undefined)}>
                    Cancel Editing
                  </button>
                )}
              </div>
              <div className="xl:col-span-2">
                <h2 className="font-serif text-2xl mb-6 text-gray-800">Catalog ({catalog.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {catalog.map((p) => (
                  <div key={p._id} className="bg-white border p-4 rounded flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
                    <img src={p.image} className="w-20 h-28 object-cover rounded border" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{p.name}</p>
                      <p className="text-hot-pink font-bold text-xs mt-1">₹{p.price}</p>
                      <p className="text-[10px] text-gray-400 uppercase mt-1">{p.category}</p>
                      <div className="flex gap-2 mt-4">
                        <button onClick={() => setProductEditing(p)} className="text-[10px] font-bold uppercase tracking-tighter border px-2 py-1 hover:bg-gray-50">Edit</button>
                        <button onClick={() => removeProduct(p._id!)} className="text-[10px] font-bold uppercase tracking-tighter border border-red-100 text-red-500 px-2 py-1 hover:bg-red-50">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
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
          <div className="max-w-2xl">
            <h2 className="font-serif text-2xl mb-4">Discount Codes</h2>
            <DiscountsManager initial={codes} onSave={saveCodesAll} />
          </div>
        )}

        {tab === 'site' && site && (
          <SiteManager initial={site} onSave={saveSiteAll} />
        )}

        {tab === 'orders' && (
          <div className="space-y-4">
             <h2 className="font-serif text-2xl mb-4">Orders ({orders.length})</h2>
             {orders.map((o) => (
               <div key={o._id} className="bg-white border p-6 rounded shadow-sm">
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <p className="font-bold">Order #{o._id.slice(-6).toUpperCase()}</p>
                     <p className="text-xs text-gray-500">{o.email} • {new Date(o.createdAt).toLocaleString()}</p>
                   </div>
                   <div className="text-right">
                     <p className="font-serif text-xl text-hot-pink">₹{o.total}</p>
                     <select 
                       className="text-xs border mt-2 px-2 py-1 rounded" 
                       value={o.status || 'new'} 
                       onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                     >
                       <option value="new">New</option>
                       <option value="paid">Paid</option>
                       <option value="shipped">Shipped</option>
                       <option value="delivered">Delivered</option>
                       <option value="cancelled">Cancelled</option>
                     </select>
                   </div>
                 </div>
                 <div className="flex flex-wrap gap-4 mt-4 border-t pt-4">
                   {(o.items || []).map((it: any, i: number) => (
                     <div key={i} className="flex gap-2 items-center">
                       <img src={it.image} className="w-10 h-12 object-cover rounded" />
                       <p className="text-[10px] leading-tight"><span className="font-bold">{it.name}</span><br/>Qty: {it.qty}</p>
                     </div>
                   ))}
                 </div>
               </div>
             ))}
          </div>
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
