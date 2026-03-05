import React, { useState, useEffect } from 'react';
import { 
  X, 
  Tag, 
  FileText, 
  LayoutGrid, 
  Upload, 
  Image as ImageIcon,
  ChevronDown,
  Hash
} from 'lucide-react';
import type { GalleryCategory } from '../../services/adminService';

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => void;
  initialCategory?: GalleryCategory;
}

export default function CategoryManagementModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialCategory 
}: CategoryManagementModalProps) {
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    displayOrder: 0,
    isActive: true
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (initialCategory) {
      setForm({
        name: initialCategory.name || '',
        slug: initialCategory.slug || '',
        description: initialCategory.description || '',
        displayOrder: initialCategory.displayOrder || 0,
        isActive: initialCategory.isActive ?? true
      });
      setPreview(initialCategory.imageUrl || '');
    } else {
      setForm({
        name: '',
        slug: '',
        description: '',
        displayOrder: 0,
        isActive: true
      });
      setPreview('');
    }
    setFile(null);
  }, [initialCategory, isOpen]);

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    setForm(prev => ({ ...prev, name, slug: initialCategory ? prev.slug : slug }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('slug', form.slug);
    formData.append('description', form.description);
    formData.append('displayOrder', String(form.displayOrder));
    formData.append('isActive', String(form.isActive));
    
    if (file) {
      formData.append('image', file);
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md animate-fadeIn" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-slideUp">
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {initialCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            <p className="text-gray-400 text-sm font-medium mt-0.5">
              Organize your product catalog with collections.
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
        <div className="p-8">
          <form id="category-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Image */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-900">Category Image</label>
                <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:bg-gray-100 transition-all relative overflow-hidden group flex flex-col items-center justify-center gap-2">
                  {preview ? (
                    <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center">
                        <Upload size={20} className="text-pink-500" />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-gray-400">Upload Image</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Category Name</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      required
                      className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-pink-200 outline-none" 
                      placeholder="e.g. Summer Collection" 
                      value={form.name} 
                      onChange={(e) => handleNameChange(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Slug</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      required
                      className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-pink-200 outline-none" 
                      placeholder="summer-collection" 
                      value={form.slug} 
                      onChange={(e) => setForm({ ...form, slug: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Display Order</label>
                  <div className="relative">
                    <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="number"
                      className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-pink-200 outline-none" 
                      placeholder="0" 
                      value={form.displayOrder} 
                      onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Description</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 text-gray-400" size={18} />
                <textarea 
                  className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-pink-200 outline-none h-24 resize-none" 
                  placeholder="Enter category description..." 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${form.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                  <LayoutGrid size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Category Status</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {form.isActive ? 'Visible on storefront' : 'Hidden from storefront'}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 px-8 py-4 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl text-sm font-bold transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 px-8 py-4 bg-[#eb4899] hover:bg-[#d43f8a] text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-pink-200"
              >
                {initialCategory ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
