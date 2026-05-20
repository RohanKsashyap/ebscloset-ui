import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { BlogPost } from '../../services/blogService';

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
  blog?: BlogPost;
}

export default function BlogModal({ isOpen, onClose, onSave, blog }: BlogModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: 'Admin',
    category: 'Journal',
    published: true,
    tags: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || '',
        content: blog.content || '',
        excerpt: blog.excerpt || '',
        author: blog.author || 'Admin',
        category: blog.category || 'Journal',
        published: blog.published ?? true,
        tags: blog.tags?.join(', ') || ''
      });
      setImagePreview(blog.image || null);
    } else {
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        author: 'Admin',
        category: 'Journal',
        published: true,
        tags: ''
      });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [blog, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, String(value));
      });
      if (imageFile) {
        data.append('image', imageFile);
      }
      await onSave(data);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="px-8 py-6 border-b flex items-center justify-between flex-shrink-0">
          <h3 className="text-xl font-bold text-gray-900">
            {blog ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Post Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-pink-600/20"
                  placeholder="Enter post title..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Author</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={e => setFormData({ ...formData, author: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-pink-600/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-pink-600/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Excerpt (Short Summary)</label>
                <textarea
                  rows={3}
                  value={formData.excerpt}
                  onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-pink-600/20 resize-none"
                  placeholder="Brief description for listings..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={e => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-pink-600/20"
                  placeholder="fashion, styling, collection..."
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={e => setFormData({ ...formData, published: e.target.checked })}
                  className="w-5 h-5 rounded-lg border-gray-300 text-pink-600 focus:ring-pink-600/20"
                />
                <label htmlFor="published" className="text-sm font-bold text-gray-700">Published (visible to public)</label>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Featured Image</label>
                <div className="relative group aspect-[16/10] bg-gray-50 rounded-[2rem] overflow-hidden border-2 border-dashed border-gray-200 hover:border-pink-600/50 transition-all">
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer bg-white text-black px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest">
                          Change Image
                          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400">
                        <Upload size={20} />
                      </div>
                      <div className="text-center">
                        <span className="block text-sm font-bold text-gray-900">Click to upload</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest">PNG, JPG, WEBP up to 10MB</span>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Content (HTML Support)</label>
                <textarea
                  required
                  rows={8}
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-pink-600/20 font-mono"
                  placeholder="Post content..."
                />
              </div>
            </div>
          </div>
        </form>

        <div className="px-8 py-6 border-t bg-gray-50 flex items-center justify-end gap-4 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-black text-white px-10 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
