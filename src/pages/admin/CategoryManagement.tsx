import { useState, useMemo } from 'react';
import { 
  LayoutGrid, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { adminService, type GalleryCategory } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

interface CategoryManagementProps {
  categories: GalleryCategory[];
  onRefresh: () => void;
  onEdit: (category: GalleryCategory) => void;
  onAdd: () => void;
}

export default function CategoryManagement({ categories, onRefresh, onEdit, onAdd }: CategoryManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'all' | 'archived' | 'recent'>('all');
  const itemsPerPage = 10;
  const { showToast } = useToast();

  const filteredCategories = useMemo(() => {
    let result = categories;
    
    // Search filter
    if (searchTerm) {
      result = result.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Tab filter
    if (activeTab === 'archived') {
      result = result.filter(cat => !cat.isActive);
    } else if (activeTab === 'recent') {
      // Sort by newest if there was a createdAt, otherwise just top 5
      // Categories from backend have createdAt
      result = [...result].sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ).slice(0, 10);
    }
    
    return result;
  }, [categories, searchTerm, activeTab]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const currentCategories = filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the category "${name}"?`)) return;
    
    try {
      await adminService.deleteGalleryCategory(id);
      showToast(`Category "${name}" deleted successfully`);
      onRefresh();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error deleting category', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-1">Manage and organize your product catalog collections</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search categories..."
              className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl w-full md:w-80 text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={onAdd}
            className="flex items-center gap-2 bg-[#eb4899] hover:bg-[#d43f8a] text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-pink-200"
          >
            <Plus size={18} />
            Add New Category
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-gray-100 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('all')}
          className={`pb-4 text-sm font-bold transition-all relative whitespace-nowrap ${
            activeTab === 'all' ? 'text-pink-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          All Categories
          {activeTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600" />}
        </button>
        <button 
          onClick={() => setActiveTab('archived')}
          className={`pb-4 text-sm font-bold transition-all relative whitespace-nowrap ${
            activeTab === 'archived' ? 'text-pink-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Archived
          {activeTab === 'archived' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600" />}
        </button>
        <button 
          onClick={() => setActiveTab('recent')}
          className={`pb-4 text-sm font-bold transition-all relative whitespace-nowrap ${
            activeTab === 'recent' ? 'text-pink-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Recently Added
          {activeTab === 'recent' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600" />}
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Category Name</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Slug</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Product Count</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentCategories.map((cat) => (
                <tr key={cat._id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      {cat.imageUrl ? (
                        <img 
                          src={cat.imageUrl} 
                          alt={cat.name} 
                          className="w-10 h-10 rounded-xl object-cover border border-gray-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 border border-pink-100 shadow-sm">
                          <LayoutGrid size={20} />
                        </div>
                      )}
                      <span className="font-bold text-gray-900">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <code className="text-[11px] font-bold bg-gray-50 text-gray-500 px-2 py-1 rounded">
                      {cat.slug}
                    </code>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-center text-gray-600">
                    {cat.productCount || 0}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      cat.isActive 
                        ? 'bg-green-50 text-green-600 border border-green-100' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onEdit(cat)}
                        className="p-2 text-pink-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat._id, cat.name)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentCategories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-50 rounded-full">
                        <LayoutGrid size={32} className="text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium">No categories found matching your criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-8 py-6 bg-gray-50/30 border-t border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCategories.length)} of {filteredCategories.length} categories
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white disabled:opacity-30 transition-all rounded-xl"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                      currentPage === i + 1 
                        ? 'bg-pink-600 text-white shadow-lg shadow-pink-200' 
                        : 'text-gray-500 hover:bg-white'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white disabled:opacity-30 transition-all rounded-xl"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
