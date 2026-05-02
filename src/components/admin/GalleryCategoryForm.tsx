import { useState } from 'react';

interface GalleryCategoryFormProps {
  onSave: (data: FormData) => void;
}

export default function GalleryCategoryForm({ onSave }: GalleryCategoryFormProps) {
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
      <button type="submit" className="bg-[#eb4899] text-white px-4 py-2 text-[10px] font-bold uppercase w-full">Create Category</button>
    </form>
  );
}
