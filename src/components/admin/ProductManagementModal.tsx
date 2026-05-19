import React, { useState, useEffect } from 'react';
import { 
  X, 
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
  ChevronDown,
  Loader2
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { Product } from '../../services/productService';

interface ProductManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => void;
  initialProduct?: Product;
}

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];

export default function ProductManagementModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialProduct 
}: ProductManagementModalProps) {
  const [form, setForm] = useState<any>({
    id: '', // Item Code / Legacy ID
    name: '',
    price: '',
    originalPrice: '',
    description: '',
    categoryId: '',
    brand: '',
    size: '',
    sizes: [],
    color: '',
    colors: [],
    newarrival:false,
    trending: false,
    bestseller: false,
    assured: false,
    ageGroups: [],
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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setForm({
        ...initialProduct,
        categoryId: (initialProduct as any).categoryId?._id || (initialProduct as any).categoryId || '',
        sizes: Array.isArray((initialProduct as any).sizes) ? (initialProduct as any).sizes : [],
        colors: Array.isArray((initialProduct as any).colors) ? (initialProduct as any).colors : [],
        ageGroups: (initialProduct as any).ageGroups || [],
        color: (initialProduct as any).color || '',
        brand: (initialProduct as any).brand || '',
        variants: Array.isArray((initialProduct as any).variants) ? (initialProduct as any).variants : [],
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
        price: '',
        originalPrice: '',
        description: '',
        categoryId: '',
        size: '',
        sizes: [],
        ageGroups: [],
        color: '',
        newarrival:false,
        trending: false,
        bestseller: false,
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
        const res = await adminService.getCategories();
        setCategories(res);
      } catch (e) {
        console.error('Error fetching categories:', e);
      }
    };
    if (isOpen) fetchCats();
  }, [isOpen]);

  // Automatically sync variants when colors or sizes change
  useEffect(() => {
    const colors = form.colors || [];
    const sizes = form.sizes || [];

    if (colors.length === 0 && sizes.length === 0) {
      if (form.variants?.length > 0) {
        setForm((f: any) => ({ ...f, variants: [] }));
      }
      return;
    }

    const currentVariants = form.variants || [];
    let combinations: { name: string; size: string }[] = [];

    if (colors.length > 0 && sizes.length > 0) {
      combinations = colors.flatMap((c: string) => sizes.map((s: string) => ({ name: c, size: s })));
    } else if (colors.length > 0) {
      combinations = colors.map((c: string) => ({ name: c, size: '' }));
    } else if (sizes.length > 0) {
      combinations = sizes.map((s: string) => ({ name: 'Default', size: s }));
    }

    const newVariants = combinations.map(combo => {
      const existing = currentVariants.find(
        (v: any) => (v.name || '').toLowerCase() === (combo.name || '').toLowerCase() && 
                    (v.size || '').toLowerCase() === (combo.size || '').toLowerCase()
      );
      return existing || { name: combo.name, size: combo.size, price: form.price, inStock: 0, sku: '' };
    });

    const hasChanged = newVariants.length !== currentVariants.length || 
      newVariants.some((v, i) => v.name !== currentVariants[i]?.name || v.size !== currentVariants[i]?.size);

    if (hasChanged) {
      setForm((f: any) => ({ ...f, variants: newVariants }));
    }
  }, [form.colors, form.sizes]);

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

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...(form.variants || [])];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setForm((f: any) => ({ ...f, variants: newVariants }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      
      // Skip fields that are being uploaded as files to avoid duplicate keys in req.body/req.files
      const fileKeys = Object.keys(files).filter(k => files[k]);

      Object.keys(form).forEach(key => {
        // Don't send fields that are being replaced by files
        if (fileKeys.includes(key)) return;
        
        // Filter out internal MongoDB/Mongoose fields and redundant IDs
        const skipFields = [
          '_id', '__v', 'createdAt', 'updatedAt', 
          'imageId', 'hoverImageId', 'image3Id', 'image4Id', 
          'videoId', 'video2Id', 'video3Id', 'thumbnailUrl',
          'inStock', 'minStock'
        ];
        if (skipFields.includes(key)) return;

        if (key === 'variants') {
          formData.append(key, JSON.stringify(form[key]));
        } else if (key === 'sizes' && Array.isArray(form[key])) {
          form[key].forEach((s: string) => formData.append('sizes', s));
        } else if (key === 'colors' && Array.isArray(form[key])) {
          form[key].forEach((c: string) => formData.append('colors', c));
        } else if (key === 'ageGroups' && Array.isArray(form[key])) {
          form[key].forEach((a: string) => formData.append('ageGroups', a));
        } else {
          // Only append if it's defined and not null
          if (form[key] !== null && form[key] !== undefined) {
            formData.append(key, form[key]);
          }
        }
      });

      // Append the actual files
      Object.keys(files).forEach(key => {
        if (files[key]) {
          formData.append(key, files[key]!);
        }
      });

      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2 col-span-1 sm:col-span-2">
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
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Item Code (Numeric)</label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-pink-200 outline-none" 
                      placeholder="e.g. 101" 
                      type="number"
                      value={form.id} 
                      onChange={(e) => setForm({ ...form, id: e.target.value })} 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Price (AUD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      required
                      className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-pink-200 outline-none" 
                      type="number" 
                      placeholder="285.00" 
                      value={form.price} 
                      onChange={(e) => setForm({ ...form, price: e.target.value === '' ? '' : Number(e.target.value) })} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Original Price (AUD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-pink-200 outline-none" 
                      type="number" 
                      placeholder="350.00" 
                      value={form.originalPrice} 
                      onChange={(e) => setForm({ ...form, originalPrice: e.target.value === '' ? '' : Number(e.target.value) })} 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Brand</label>
                  <div className="relative">
                    <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-pink-200 outline-none" 
                      placeholder="e.g. EB's Closet" 
                      value={form.brand} 
                      onChange={(e) => setForm({ ...form, brand: e.target.value })} 
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
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-bold text-gray-900">Colors</label>
                  <div className="flex gap-2 mb-2">
                    <div className="relative flex-1">
                      <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-pink-200 outline-none" 
                        placeholder="Add a color (e.g. Black)" 
                        value={form.color} 
                        onChange={(e) => setForm({ ...form, color: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (form.color.trim()) {
                              const newColors = Array.from(new Set([...(form.colors || []), form.color.trim()]));
                              setForm({ ...form, colors: newColors, color: '' });
                            }
                          }
                        }}
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        if (form.color.trim()) {
                          const newColors = Array.from(new Set([...(form.colors || []), form.color.trim()]));
                          setForm({ ...form, colors: newColors, color: '' });
                        }
                      }}
                      className="px-6 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(form.colors || []).map((c: string) => (
                      <span key={c} className="inline-flex items-center gap-1 px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-pink-100">
                        {c}
                        <button 
                          type="button" 
                          onClick={() => setForm({ ...form, colors: form.colors.filter((x: string) => x !== c) })}
                          className="hover:text-pink-800"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-900">Available Sizes</label>
                    <button
                      type="button"
                      onClick={() => {
                        const allSelected = (form.sizes || []).length === AVAILABLE_SIZES.length;
                        setForm({ ...form, sizes: allSelected ? [] : [...AVAILABLE_SIZES] });
                      }}
                      className="text-[10px] font-bold uppercase tracking-wider text-pink-500 hover:text-pink-600 transition-colors"
                    >
                      {(form.sizes || []).length === AVAILABLE_SIZES.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          const current = form.sizes || [];
                          const updated = current.includes(size)
                            ? current.filter((s: string) => s !== size)
                            : [...current, size];
                          setForm({ ...form, sizes: updated });
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          (form.sizes || []).includes(size)
                            ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                            : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3 col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-900">Age Groups</label>
                    <button
                      type="button"
                      onClick={() => {
                        const allAges = ["0-1", "1-2", "3-4", "5-6", "7-8", "9-10", "11-12", "13-14"];
                        const allSelected = (form.ageGroups || []).length === allAges.length;
                        setForm({ ...form, ageGroups: allSelected ? [] : [...allAges] });
                      }}
                      className="text-[10px] font-bold uppercase tracking-wider text-pink-500 hover:text-pink-600 transition-colors"
                    >
                      {(form.ageGroups || []).length === 8 ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["0-1", "1-2", "3-4", "5-6", "7-8", "9-10", "11-12", "13-14"].map((age) => (
                      <button
                        key={age}
                        type="button"
                        onClick={() => {
                          const current = form.ageGroups || [];
                          const updated = current.includes(age)
                            ? current.filter((a: string) => a !== age)
                            : [...current, age];
                          setForm({ ...form, ageGroups: updated });
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          (form.ageGroups || []).includes(age)
                            ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                            : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        {age} Yrs
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-gray-900">Product Highlights</label>
                  <button
                    type="button"
                    onClick={() => {
                      const allSelected = form.newarrival && form.trending && form.bestseller && form.assured;
                      setForm({ 
                        ...form, 
                        newarrival: !allSelected,
                        trending: !allSelected,
                        bestseller: !allSelected,
                        assured: !allSelected
                      });
                    }}
                    className="text-[10px] font-bold uppercase tracking-wider text-pink-500 hover:text-pink-600 transition-colors"
                  >
                    {form.newarrival && form.trending && form.bestseller && form.assured ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-4">
                  {/* newarrival */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-11 h-6 rounded-full relative transition-all ${form.newarrival ? 'bg-pink-500' : 'bg-gray-200'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${form.newarrival ? 'left-6' : 'left-1'}`} />
                    </div>
                    <input type="checkbox" className="hidden" checked={form.newarrival} onChange={(e) => setForm({...form, newarrival: e.target.checked})} />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-gray-700">Arrival</span>
                  </label>
                  {/* trending */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-11 h-6 rounded-full relative transition-all ${form.trending ? 'bg-pink-500' : 'bg-gray-200'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${form.trending ? 'left-6' : 'left-1'}`} />
                    </div>
                    <input type="checkbox" className="hidden" checked={form.trending} onChange={(e) => setForm({...form, trending: e.target.checked})} />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-gray-700">Trending</span>
                  </label>
                  {/* bestseller */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-11 h-6 rounded-full relative transition-all ${form.bestseller ? 'bg-pink-500' : 'bg-gray-200'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${form.bestseller ? 'left-6' : 'left-1'}`} />
                    </div>
                    <input type="checkbox" className="hidden" checked={form.bestseller} onChange={(e) => setForm({...form, bestseller: e.target.checked})} />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-gray-700">Bestseller</span>
                  </label>
                  {/* assured */}
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
                  <h3 className="text-sm font-bold">Inventory by Variant</h3>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {(form.variants || []).length} Combinations
                </div>
              </div>

              <div className="space-y-3">
                {form.variants?.map((v: any, i: number) => (
                  <div key={`${v.name}-${v.size}-${i}`} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-gray-50/50 p-3 rounded-2xl border border-transparent hover:border-pink-100 transition-all">
                    <div className="flex-1 w-full sm:w-auto bg-white rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700">
                      {v.name} {v.size ? `(${v.size})` : ''}
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-[10px] font-bold uppercase text-gray-400">SKU</span>
                      <input 
                        className="flex-1 sm:w-32 bg-white border-none rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-pink-100 font-bold" 
                        type="text" 
                        placeholder="SKU" 
                        value={v.sku || ''} 
                        onChange={e => updateVariant(i, 'sku', e.target.value)} 
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-[10px] font-bold uppercase text-gray-400">Stock</span>
                      <input 
                        className="w-20 bg-white border-none rounded-xl px-4 py-2.5 text-xs outline-none text-center focus:ring-2 focus:ring-pink-100 font-bold" 
                        type="number" 
                        placeholder="Stock" 
                        value={v.inStock} 
                        onChange={e => updateVariant(i, 'inStock', Number(e.target.value))} 
                      />
                    </div>
                  </div>
                ))}
                {(!form.variants || form.variants.length === 0) && (
                  <div className="text-center py-8 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                    <p className="text-[10px] font-bold uppercase text-gray-400">Select colors and sizes above to generate variants</p>
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
            disabled={isSaving}
            className={`bg-[#ec4899] text-white px-10 py-2.5 rounded-full text-sm font-bold hover:bg-pink-600 transition-all shadow-lg shadow-pink-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                {initialProduct ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              initialProduct ? 'Update Product' : 'Save Product'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
