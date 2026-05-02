import { useState } from 'react';
import type { GalleryCategory } from '../../services/adminService';

interface GalleryImageFormProps {
  categories: GalleryCategory[];
  onSave: (data: FormData) => void;
}

export default function GalleryImageForm({ categories, onSave }: GalleryImageFormProps) {
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
      <button type="submit" className="bg-[#eb4899] text-white px-4 py-2 text-[10px] font-bold uppercase w-full">Upload Image</button>
    </form>
  );
}
