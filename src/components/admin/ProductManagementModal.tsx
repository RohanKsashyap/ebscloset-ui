import React, { useState, useEffect } from 'react';
import { 
  X, 
  Info, 
  ShoppingBag, 
  Sparkles, 
  Image as ImageIcon,
  Video,
  Upload,
  Tag,
  DollarSign,
  LayoutGrid,
  Package,
  AlertCircle,
  FileText,
  Maximize,
  ChevronDown
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { Product } from '../../services/productService';

interface ProductManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => void;
  initialProduct?: Product;
}

export default function ProductManagementModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialProduct 
}: ProductManagementModalProps) {
  const [form, setForm] = useState<any>({
    name: '',
    price: 0,
    description: '',
    categoryId: '',
    inStock: 0,
    minStock: 5,
    size: '',
    featured: false,
    assured: false,
    variants: []
  });
  
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    image: null,
    hoverImage: null,
    image3: null,
    image4: null,
    video: null,
    video2: null,
    video3: null
  });

  const [previews, setPreviews] = useState<{ [key: string]: string }>({
    image: '',
    hoverImage: '',
    image3: '',
    image4: '',
  });

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (initialProduct) {
      setForm({
        ...initialProduct,
        categoryId: (initialProduct as any).categoryId?._id || (initialProduct as any).categoryId || '',
      });
      setPreviews({
        image: initialProduct.image || '',
        hoverImage: (initialProduct as any).hoverImage || '',
        image3: (initialProduct as any).image3 || '',
        image4: (initialProduct as any).image4 || '',
      });
    } else {
      setForm({
        name: '',
        price: 0,
        description: '',
        categoryId: '',
        inStock: 0,
        minStock: 5,
        size: '',
        featured: false,
        assured: false,
        variants: []
      });
      setPreviews({
        image: '',
        hoverImage: '',
        image3: '',
        image4: '',
      });
    }
  }, [initialProduct, isOpen]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await adminService.getAdminGalleryCategories();
        setCategories(res);
      } catch (e) {
        console.error('Error fetching categories:', e);
      }
    };
    if (isOpen) fetchCats();
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFiles(prev => ({ ...prev, [key]: file }));
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreviews(prev => ({ ...prev, [key]: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const addVariant = () => {
    setForm((f: any) => ({
      ...f,
      variants: [...(f.variants || []), { name: '', size: '', price: f.price, inStock: 0 }]
    }));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...(form.variants || [])];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setForm((f: any) => ({ ...f, variants: newVariants }));
  };

  const removeVariant = (index: number) => {
    setForm((f: any) => ({
      ...f,
      variants: f.variants.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach(key => {
      if (key === 'variants') {
        formData.append(key, JSON.stringify(form[key]));
      } else {
        formData.append(key, form[key]);
      }
    });

    Object.keys(files).forEach(key => {
      if (files[key]) {
        formData.append(key, files[key]!);
      }
    });

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md animate-fadeIn" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-slideUp my-0 sm:my-2 max-h-screen sm:max-h-[95vh]">
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {initialProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-gray-400 text-sm font-medium mt-0.5">
              Fill in the details to list a product in your store.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900">Product Name</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required
                    className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-pink-200 outline-none" 
                    placeholder="e.g. Silk Oversized Blouse" 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Price (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      required
                      className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-pink-200 outline-none" 
                      type="number" 
                      placeholder="285.00" 
                      value={form.price} 
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Category</label>
                  <div className="relative">
                    <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select 
                      required
                      className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-10 py-3 text-sm focus:ring-2 focus:ring-pink-200 outline-none appearance-none"
                      value={form.categoryId}
                      onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Stock Quantity</label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-pink-200 outline-none" 
                      type="number" 
                      placeholder="100"
                      value={form.inStock} 
                      onChange={(e) => setForm({ ...form, inStock: Number(e.target.value) })} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Min Stock Alert</label>
                  <div className="relative">
                    <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-pink-200 outline-none" 
                      type="number" 
                      placeholder="5"
                      value={form.minStock} 
                      onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900">Description</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 text-gray-400" size={18} />
                  <textarea 
                    className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-pink-200 outline-none h-28 resize-none" 
                    placeholder="Enter premium product description..." 
                    value={form.description} 
                    onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Base Size</label>
                  <div className="relative">
                    <Maximize className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-pink-200 outline-none" 
                      placeholder="e.g. Medium" 
                      value={form.size} 
                      onChange={(e) => setForm({ ...form, size: e.target.value })} 
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-8">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-11 h-6 rounded-full relative transition-all ${form.featured ? 'bg-pink-500' : 'bg-gray-200'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${form.featured ? 'left-6' : 'left-1'}`} />
                    </div>
                    <input type="checkbox" className="hidden" checked={form.featured} onChange={(e) => setForm({...form, featured: e.target.checked})} />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-gray-700">Featured</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-11 h-6 rounded-full relative transition-all ${form.assured ? 'bg-pink-500' : 'bg-gray-200'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${form.assured ? 'left-6' : 'left-1'}`} />
                    </div>
                    <input type="checkbox" className="hidden" checked={form.assured} onChange={(e) => setForm({...form, assured: e.target.checked})} />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-gray-700">Assured</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Product Media */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2 text-gray-900">
                <ImageIcon size={18} className="text-pink-500" />
                <h3 className="text-sm font-bold">Product Media</h3>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                {/* Main Image */}
                <label className="col-span-2 aspect-[4/3] bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:bg-gray-100 transition-all relative overflow-hidden group">
                  {previews.image ? (
                    <img src={previews.image} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                        <Upload size={18} className="text-pink-500" />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-gray-400">Main Image</span>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'image')} />
                </label>

                {/* Additional Media */}
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  {['hoverImage', 'image3', 'image4'].map((key) => (
                    <label key={key} className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all relative overflow-hidden">
                      {previews[key as keyof typeof previews] ? (
                        <img src={previews[key as keyof typeof previews]} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageIcon size={18} className="text-gray-300" />
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={e => handleFileChange(e, key)} />
                    </label>
                  ))}
                  <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video size={18} className="text-gray-300" />
                    </div>
                    <input type="file" className="hidden" accept="video/*" onChange={e => handleFileChange(e, 'video')} />
                  </label>
                </div>
              </div>
            </div>

            {/* Product Variants */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-900">
                  <Sparkles size={18} className="text-pink-500" />
                  <h3 className="text-sm font-bold">Product Variants</h3>
                </div>
                <button 
                  type="button"
                  onClick={addVariant}
                  className="text-[10px] font-bold uppercase tracking-wider text-[#eb4899] bg-pink-50 px-4 py-2 rounded-xl hover:bg-pink-100 transition-all shadow-sm"
                >
                  + Add Variant
                </button>
              </div>

              <div className="space-y-3">
                {form.variants.map((v: any, i: number) => (
                  <div key={i} className="flex gap-3 items-center bg-gray-50/50 p-3 rounded-2xl border border-transparent hover:border-pink-100 transition-all">
                    <input className="flex-1 bg-white border-none rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-pink-100" placeholder="Variant Name (e.g. Red)" value={v.name} onChange={e => updateVariant(i, 'name', e.target.value)} />
                    <input className="w-20 bg-white border-none rounded-xl px-4 py-2.5 text-xs outline-none text-center focus:ring-2 focus:ring-pink-100" placeholder="Size" value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)} />
                    <input className="w-20 bg-white border-none rounded-xl px-4 py-2.5 text-xs outline-none text-center focus:ring-2 focus:ring-pink-100" type="number" placeholder="Stock" value={v.inStock} onChange={e => updateVariant(i, 'inStock', Number(e.target.value))} />
                    <button type="button" onClick={() => removeVariant(i)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {form.variants.length === 0 && (
                  <div className="text-center py-8 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                    <p className="text-[10px] font-bold uppercase text-gray-400">No variants added yet</p>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 flex items-center justify-end gap-4 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
          >
            Discard
          </button>
          <button 
            type="submit"
            form="product-form"
            className="bg-[#ec4899] text-white px-10 py-2.5 rounded-full text-sm font-bold hover:bg-pink-600 transition-all shadow-lg shadow-pink-200 transform hover:-translate-y-0.5"
          >
            {initialProduct ? 'Update Product' : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
