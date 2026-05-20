import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  Edit2,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { blogService, BlogPost } from '../../services/blogService';
import { useToast } from '../../context/ToastContext';
import BlogModal from '../../components/admin/BlogModal';

interface BlogManagementProps {
  blogs: BlogPost[];
  onRefresh: () => void;
}

export default function BlogManagement({ blogs, onRefresh }: BlogManagementProps) {
  const [activeTab, setActiveTab] = useState<'All' | 'Published' | 'Draft'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | undefined>(undefined);
  const { showToast } = useToast();

  const handleSaveBlog = async (formData: FormData) => {
    try {
      if (editingBlog) {
        await blogService.updateBlog(editingBlog._id, formData);
        showToast('Blog post updated successfully');
      } else {
        await blogService.createBlog(formData);
        showToast('Blog post created successfully');
      }
      setIsModalOpen(false);
      setEditingBlog(undefined);
      onRefresh();
    } catch (err) {
      console.error('Error saving blog:', err);
      showToast('Error saving blog post', 'error');
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await blogService.deleteBlog(id);
      showToast('Blog post deleted');
      onRefresh();
    } catch (err) {
      showToast('Error deleting blog post', 'error');
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesTab = activeTab === 'All' || 
                      (activeTab === 'Published' && blog.published) || 
                      (activeTab === 'Draft' && !blog.published);
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Blog Management</h2>
          <p className="text-gray-500 text-sm">Create and manage your editorial content.</p>
        </div>
        <button 
          onClick={() => {
            setEditingBlog(undefined);
            setIsModalOpen(true);
          }}
          className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-sm"
        >
          <Plus size={18} />
          Create New Post
        </button>
      </div>

      <BlogModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBlog}
        blog={editingBlog}
      />

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header with Tabs and Search */}
        <div className="px-6 py-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            {['All', 'Published', 'Draft'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-4 text-sm font-semibold transition-all relative ${
                  activeTab === tab ? 'text-pink-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-pink-600/10"
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50/30">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Post Details</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredBlogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {blog.image ? (
                          <img src={blog.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FileText size={20} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-gray-900 block truncate max-w-[300px]">{blog.title}</span>
                        <span className="text-xs text-gray-500">By {blog.author}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-gray-600 text-sm font-medium">{blog.category}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      blog.published ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {blog.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-gray-600 text-sm">{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a 
                        href={`/blog/${blog.slug}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 text-gray-400 hover:text-black transition-colors"
                      >
                        <ExternalLink size={18} />
                      </a>
                      <button 
                        onClick={() => {
                          setEditingBlog(blog);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-pink-600 transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteBlog(blog._id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
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

        {/* Footer */}
        <div className="px-6 py-5 bg-[#fcfcfc] border-t flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {filteredBlogs.length} posts found
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
    </div>
  );
}
