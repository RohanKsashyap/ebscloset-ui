import { useState, useEffect } from 'react';
import { Camera, Star, Upload } from 'lucide-react';
import type { Product } from '../../services/productService';
import type { Testimonial } from '../../services/siteService';

interface TestimonialFormProps {
  initial?: Testimonial;
  products: Product[];
  onSave: (data: FormData) => void;
  onCancel?: () => void;
}

export default function TestimonialForm({ initial, products, onSave, onCancel }: TestimonialFormProps) {
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
