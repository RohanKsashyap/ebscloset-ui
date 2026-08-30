import { useState, useMemo } from 'react';
import {
  LayoutGrid,
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FolderTree,
  Folder,
  FolderOpen,
  CheckSquare,
  Square,
  AlertTriangle,
  X,
  Loader2,
} from 'lucide-react';
import { adminService, type Category } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

interface CategoryManagementProps {
  categories: Category[];
  onRefresh: () => void;
  onEdit: (category: Category) => void;
  onAdd: () => void;
}

// ── Confirmation dialog ───────────────────────────────────────────────────────
function BulkDeleteConfirmDialog({
  count,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 animate-slideUp">
        {/* Icon */}
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-red-500" />
        </div>

        <h3 className="text-2xl font-black text-gray-900 text-center mb-2">
          Delete {count} Categor{count === 1 ? 'y' : 'ies'}?
        </h3>
        <p className="text-gray-500 text-sm text-center leading-relaxed mb-8">
          This will permanently delete{' '}
          <span className="font-bold text-gray-800">{count} selected categor{count === 1 ? 'y' : 'ies'}</span>{' '}
          along with their subcategories and images. This action{' '}
          <span className="text-red-500 font-bold">cannot be undone</span>.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-2xl transition-all text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-red-200"
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Yes, Delete All
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CategoryManagement({
  categories,
  onRefresh,
  onEdit,
  onAdd,
}: CategoryManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const itemsPerPage = 10;
  const { showToast } = useToast();

  // ── Hierarchy ──────────────────────────────────────────────────────────────
  const { parents, childrenByParent } = useMemo(() => {
    const parents = categories.filter((c) => !c.parentCategory);
    const childrenByParent: Record<string, Category[]> = {};
    categories.forEach((c) => {
      if (!c.parentCategory) return;
      const pid = (c.parentCategory as any)?._id || (c.parentCategory as string);
      if (!pid) return;
      if (!childrenByParent[pid]) childrenByParent[pid] = [];
      childrenByParent[pid].push(c);
    });
    return { parents, childrenByParent };
  }, [categories]);

  // ── Search ─────────────────────────────────────────────────────────────────
  const filteredFlat = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.slug.toLowerCase().includes(term)
    );
  }, [categories, searchTerm]);

  const displayList = searchTerm ? filteredFlat : parents;
  const totalPages = Math.ceil(displayList.length / itemsPerPage);
  const visibleItems = displayList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ── All selectable IDs on current view (parents + their visible children) ──
  const allVisibleIds = useMemo(() => {
    if (searchTerm) return filteredFlat.map((c) => c._id);
    // When not searching, include expanded children too
    const ids: string[] = [];
    visibleItems.forEach((p) => {
      ids.push(p._id);
      if (expandedParents.has(p._id)) {
        (childrenByParent[p._id] ?? []).forEach((ch) => ids.push(ch._id));
      }
    });
    return ids;
  }, [searchTerm, filteredFlat, visibleItems, expandedParents, childrenByParent]);

  const allChecked =
    allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.has(id));
  const someChecked =
    !allChecked && allVisibleIds.some((id) => selectedIds.has(id));

  const toggleSelectAll = () => {
    if (allChecked) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allVisibleIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allVisibleIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Single delete ──────────────────────────────────────────────────────────
  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Delete "${name}"? Subcategories will also be affected.`
      )
    )
      return;
    try {
      await adminService.deleteCategory(id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      showToast(`"${name}" deleted`);
      onRefresh();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error deleting category', 'error');
    }
  };

  // ── Bulk delete ────────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      await adminService.bulkDeleteCategories(ids);
      showToast(
        `${ids.length} categor${ids.length === 1 ? 'y' : 'ies'} deleted successfully`
      );
      setSelectedIds(new Set());
      setShowBulkConfirm(false);
      onRefresh();
    } catch (err: any) {
      showToast(
        err.response?.data?.message || 'Error deleting categories',
        'error'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Row component ──────────────────────────────────────────────────────────
  const CategoryRow = ({
    cat,
    isChild = false,
  }: {
    cat: Category;
    isChild?: boolean;
  }) => {
    const children = childrenByParent[cat._id] ?? [];
    const isExpanded = expandedParents.has(cat._id);
    const isSelected = selectedIds.has(cat._id);

    return (
      <>
        <tr
          className={`group transition-colors ${
            isSelected ? 'bg-pink-50/60' : 'hover:bg-gray-50/50'
          }`}
        >
          {/* Checkbox cell */}
          <td className="pl-6 pr-2 py-5 w-10">
            <button
              onClick={() => toggleSelect(cat._id)}
              className="text-gray-300 hover:text-[#eb4899] transition-colors"
            >
              {isSelected ? (
                <CheckSquare size={18} className="text-[#eb4899]" />
              ) : (
                <Square size={18} />
              )}
            </button>
          </td>

          {/* Name cell */}
          <td className="px-4 py-5">
            <div
              className="flex items-center gap-3"
              style={{ paddingLeft: isChild ? '1.75rem' : '0' }}
            >
              {/* Expand toggle */}
              {!isChild && children.length > 0 ? (
                <button
                  onClick={() => toggleExpand(cat._id)}
                  className="p-1 rounded-lg hover:bg-pink-50 text-gray-400 hover:text-[#eb4899] transition-colors flex-shrink-0"
                >
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              ) : (
                <div className="w-6 flex-shrink-0" />
              )}

              {/* Thumbnail / icon */}
              {isChild ? (
                <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-[#eb4899] border border-pink-100 flex-shrink-0">
                  <LayoutGrid size={14} />
                </div>
              ) : cat.imageUrl ? (
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-9 h-9 rounded-xl object-cover border border-gray-100 shadow-sm flex-shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 border border-pink-100 flex-shrink-0">
                  {isExpanded ? <FolderOpen size={18} /> : <Folder size={18} />}
                </div>
              )}

              <div>
                <span
                  className={`font-bold ${
                    isChild ? 'text-gray-700 text-sm' : 'text-gray-900'
                  }`}
                >
                  {cat.name}
                </span>
                {!isChild && children.length > 0 && (
                  <p className="text-[10px] text-[#eb4899] font-bold uppercase tracking-widest mt-0.5">
                    {children.length} subcategor
                    {children.length === 1 ? 'y' : 'ies'}
                  </p>
                )}
                {isChild && (
                  <p className="text-[10px] text-gray-400 font-medium">
                    Subcategory
                  </p>
                )}
              </div>
            </div>
          </td>

          {/* Slug */}
          <td className="px-6 py-5">
            <code className="text-[11px] font-bold bg-gray-50 text-gray-500 px-2 py-1 rounded">
              {cat.slug}
            </code>
          </td>

          {/* Products */}
          <td className="px-6 py-5 text-sm font-bold text-center text-gray-600">
            {cat.productCount || 0}
          </td>

          {/* Status */}
          <td className="px-6 py-5 text-center">
            <span
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                cat.isActive
                  ? 'bg-green-50 text-green-600 border border-green-100'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              {cat.isActive ? 'Active' : 'Inactive'}
            </span>
          </td>

          {/* Actions */}
          <td className="px-6 py-5 text-right">
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

        {/* Children rows */}
        {!isChild &&
          isExpanded &&
          children.map((child) => (
            <CategoryRow key={child._id} cat={child} isChild />
          ))}
      </>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-8 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Categories
            </h1>
            <p className="text-gray-500 mt-1">
              Manage main categories and their subcategories
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search categories..."
                className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl w-full md:w-64 text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Add */}
            <button
              onClick={onAdd}
              className="flex items-center gap-2 bg-[#eb4899] hover:bg-[#d43d8a] text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-pink-200 whitespace-nowrap"
            >
              <Plus size={18} />
              Add Category
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: 'Main Categories',
              value: parents.length,
              icon: <FolderTree size={20} />,
            },
            {
              label: 'Subcategories',
              value: categories.length - parents.length,
              icon: <LayoutGrid size={20} />,
            },
            {
              label: 'Total Categories',
              value: categories.length,
              icon: <Folder size={20} />,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm"
            >
              <div className="p-3 bg-pink-50 rounded-xl text-[#eb4899]">
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Bulk action bar (appears when items are selected) ── */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-2xl px-6 py-4 animate-slideUp">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
                <CheckSquare size={16} className="text-red-500" />
              </div>
              <p className="text-sm font-bold text-gray-900">
                <span className="text-red-500">{selectedIds.size}</span>{' '}
                categor{selectedIds.size === 1 ? 'y' : 'ies'} selected
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedIds(new Set())}
                className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors px-4 py-2 rounded-xl hover:bg-white"
              >
                <X size={14} />
                Clear
              </button>
              <button
                onClick={() => setShowBulkConfirm(true)}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-red-200"
              >
                <Trash2 size={15} />
                Delete Selected ({selectedIds.size})
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50">
                  {/* Select-all checkbox */}
                  <th className="pl-6 pr-2 py-6 w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="text-gray-300 hover:text-[#eb4899] transition-colors"
                      title={allChecked ? 'Deselect all' : 'Select all visible'}
                    >
                      {allChecked ? (
                        <CheckSquare size={18} className="text-[#eb4899]" />
                      ) : someChecked ? (
                        <CheckSquare size={18} className="text-[#eb4899]/50" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Category Name
                  </th>
                  <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Slug
                  </th>
                  <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">
                    Products
                  </th>
                  <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">
                    Status
                  </th>
                  <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {searchTerm ? (
                  filteredFlat.length > 0 ? (
                    filteredFlat.map((cat) => (
                      <CategoryRow
                        key={cat._id}
                        cat={cat}
                        isChild={!!cat.parentCategory}
                      />
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-8 py-20 text-center"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-4 bg-gray-50 rounded-full">
                            <Search size={32} className="text-gray-300" />
                          </div>
                          <p className="text-gray-500 font-medium">
                            No categories found for "{searchTerm}"
                          </p>
                        </div>
                      </td>
                    </tr>
                  )
                ) : visibleItems.length > 0 ? (
                  visibleItems.map((cat) => (
                    <CategoryRow key={cat._id} cat={cat} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-gray-50 rounded-full">
                          <FolderTree size={32} className="text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium">
                          No categories yet. Add your first one!
                        </p>
                        <button
                          onClick={onAdd}
                          className="mt-2 flex items-center gap-2 bg-[#eb4899] text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all"
                        >
                          <Plus size={16} /> Add Category
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!searchTerm && totalPages > 1 && (
            <div className="px-8 py-6 bg-gray-50/30 border-t border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1}–
                {Math.min(currentPage * itemsPerPage, displayList.length)} of{' '}
                {displayList.length} categories
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white disabled:opacity-30 transition-all rounded-xl"
                >
                  <ChevronLeft size={20} />
                </button>
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
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
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

      {/* ── Bulk-delete confirmation dialog ── */}
      {showBulkConfirm && (
        <BulkDeleteConfirmDialog
          count={selectedIds.size}
          onConfirm={handleBulkDelete}
          onCancel={() => !isDeleting && setShowBulkConfirm(false)}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
}
