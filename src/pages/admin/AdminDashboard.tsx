import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import type { Product } from '../../services/productService';
import { adminService, type Review, type Category } from '../../services/adminService';
import type { Testimonial } from '../../services/siteService';
import { useNavigate } from 'react-router-dom';
import OrdersManagement from './OrdersManagement';
import DiscountsManagement from './DiscountsManagement';
import CustomersManagement from './CustomersManagement';
import CategoryManagement from './CategoryManagement';
import AgeCategoryManager from './AgeCategoryManager';
import Analytics from './Analytics';
import SiteSettingsComp from './SiteSettings';
import { useToast } from '../../context/ToastContext';
import ProductManagementModal from '../../components/admin/ProductManagementModal';
import CategoryManagementModal from '../../components/admin/CategoryManagementModal';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';
import TestimonialForm from '../../components/admin/TestimonialForm';
import BudgetManager from '../../components/admin/BudgetManager';
import InventoryManagement from '../../components/admin/InventoryManagement';
import SidebarItem from '../../components/admin/SidebarItem';
import type { DiscountCode, SiteSettings, Budget } from '../../types/admin';
import { 
  useProducts, 
  useProductSuggestions,
  useOrders, 
  useSiteSettings, 
  useDashboard, 
  useDiscounts, 
  useCategories, 
  useSubscribers, 
  useMessages, 
  useReviews, 
  useTestimonials, 
  useAgeCollections,
  useUsers,
  useCreateProduct,
  useUpdateProduct
} from '../../hooks/useAdminData';
import { useQueryClient } from '@tanstack/react-query';
import { saveSite } from '../../utils/storage';

import { 
  LayoutGrid, 
  ShoppingBag, 
  ShoppingCart,
  Mail, 
  Inbox, 
  Star, 
  MessageSquare, 
  Image as ImageIcon, 
  Settings,
  Layers,
  Users,
  BarChart3 as BarChart,
  Plus,
  Bell,
  Sparkles,
  Edit,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  LogOut,
  Menu,
  TrendingUp,
  Clock,
  AlertCircle,
  Search,
  GripVertical,
  ExternalLink,
  RefreshCcw,
  ClipboardList,
  DollarSign,
  Camera,
  Upload,
  Download,
  CheckCircle,
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'dashboard'|'products'|'categories'|'age-categories'|'budgets'|'discounts'|'site'|'orders'|'newsletter'|'inbox'|'reviews'|'testimonials'|'customers'|'analytics'|'settings'|'inventory'>('dashboard');
  const [productCategoryId, setProductCategoryId] = useState<string>('all');
  const [reviewFilter, setReviewFilter] = useState<'All' | 'Approved' | 'Pending'>('All');
  const [messageFilter, setMessageFilter] = useState<'All' | 'Pending' | 'Resolved'>('All');
  const [productSearch, setProductSearch] = useState<string>('');
  const debouncedSearch = useDebounce(productSearch, 300);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // React Query Hooks
  const { data: catalog = [], isLoading: productsLoading } = useProducts(
    (tab === 'products' || tab === 'inventory') ? { categoryId: productCategoryId, search: debouncedSearch } : undefined,
    tab === 'products' || tab === 'inventory' || tab === 'dashboard' || tab === 'testimonials' || tab === 'reviews'
  );
  
  const { data: suggestions = [], isLoading: suggestionsLoading } = useProductSuggestions(
    searchQuery,
    showSuggestions && tab === 'products'
  );
  const { data: orders = [], isLoading: ordersLoading } = useOrders(tab === 'orders' || tab === 'dashboard');
  const { data: site = null, isLoading: siteLoading } = useSiteSettings(tab === 'site' || tab === 'dashboard' || tab === 'budgets');
  const { data: dashboardData = null, isLoading: dashboardLoading } = useDashboard(tab === 'dashboard' || tab === 'analytics');
  const { data: codes = [], isLoading: codesLoading } = useDiscounts(tab === 'discounts' || tab === 'dashboard');
  const { data: productCategories = [], isLoading: productCategoriesLoading } = useCategories(tab === 'categories' || tab === 'products');
  const { data: subscribers = [], isLoading: subscribersLoading } = useSubscribers(tab === 'newsletter');
  const { data: messages = [], isLoading: messagesLoading } = useMessages(tab === 'inbox');
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews(tab === 'reviews');
  const { data: testimonials = [], isLoading: testimonialsLoading } = useTestimonials(tab === 'testimonials');
  const { data: ageCollections = [], isLoading: ageCollectionsLoading } = useAgeCollections(tab === 'age-categories' || tab === 'dashboard');
  const { data: users = [], isLoading: usersLoading } = useUsers(tab === 'customers');

  const isPageLoading = 
    (tab === 'dashboard' && (dashboardLoading || (productsLoading && catalog.length === 0) || ordersLoading || siteLoading || codesLoading || ageCollectionsLoading)) ||
    (tab === 'products' && ((productsLoading && catalog.length === 0) || productCategoriesLoading)) ||
    (tab === 'categories' && productCategoriesLoading) ||
    (tab === 'age-categories' && ageCollectionsLoading) ||
    (tab === 'budgets' && siteLoading) ||
    (tab === 'discounts' && codesLoading) ||
    (tab === 'site' && siteLoading) ||
    (tab === 'orders' && ordersLoading) ||
    (tab === 'newsletter' && subscribersLoading) ||
    (tab === 'inbox' && messagesLoading) ||
    (tab === 'reviews' && reviewsLoading) ||
    (tab === 'testimonials' && testimonialsLoading) ||
    (tab === 'customers' && usersLoading) ||
    (tab === 'analytics' && dashboardLoading) ||
    (tab === 'inventory' && (productsLoading && catalog.length === 0));

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productEditing, setProductEditing] = useState<Product | undefined>(undefined);
  const [categoryEditing, setCategoryEditing] = useState<Category | undefined>(undefined);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [testimonialEditing, setTestimonialEditing] = useState<Testimonial | undefined>(undefined);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminName, setAdminName] = useState('Administrator');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [newReview, setNewReview] = useState({
    productId: '',
    customerName: '',
    rating: 5,
    comment: '',
    headline: ''
  });
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [reviewVideo, setReviewVideo] = useState<File | null>(null);

  useEffect(() => {
    const adminStr = localStorage.getItem('admin');
    if (adminStr) {
      try {
        const adminObj = JSON.parse(adminStr);
        setAdminName(adminObj.fullName || adminObj.email || 'Administrator');
      } catch (e) {
        console.error('Error parsing admin data:', e);
      }
    }
  }, []);

  const saveProduct = async (p: any) => {
    if (p === null) {
      setIsProductModalOpen(false);
      setProductEditing(undefined);
      return;
    }
    try {
      const productName = p.get ? p.get('name') : p.name;
      if (productEditing?._id) {
        await updateProductMutation.mutateAsync({ id: productEditing._id, data: p });
        showToast(`Product "${productName}" updated successfully`);
      } else {
        await createProductMutation.mutateAsync(p);
        showToast(`Product "${productName}" added successfully`);
      }
      setProductEditing(undefined);
      setIsProductModalOpen(false);
    } catch (err) { 
      console.error('Error saving product:', err);
    }
  };

  const saveCategory = async (formData: FormData) => {
    try {
      if (categoryEditing?._id) {
        await adminService.updateCategory(categoryEditing._id, formData);
        showToast('Category updated successfully');
      } else {
        await adminService.createCategory(formData);
        showToast('Category created successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      setIsCategoryModalOpen(false);
      setCategoryEditing(undefined);
    } catch (err: any) {
      console.error('Error saving category:', err);
      showToast(err.response?.data?.message || 'Error saving category', 'error');
    }
  };

  const removeProduct = async (id: string) => {
    const product = catalog.find(p => p._id === id);
    if (!window.confirm(`Are you sure you want to delete "${product?.name || 'this product'}"?`)) return;
    try {
      await adminService.deleteProduct(id);
      showToast(`Product "${product?.name || 'Product'}" deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      setSelectedProductIds(prev => prev.filter(selectedId => selectedId !== id));
    } catch { showToast('Error deleting product', 'error'); }
  };

  const bulkDeleteProducts = async () => {
    if (selectedProductIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedProductIds.length} products?`)) return;
    try {
      await adminService.bulkDeleteProducts(selectedProductIds);
      showToast(`${selectedProductIds.length} products deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      setSelectedProductIds([]);
    } catch { showToast('Error deleting products', 'error'); }
  };

  const saveCodesAll = async (d: DiscountCode[]) => {
    try {
      for (const c of d) {
        if (c._id) await adminService.createDiscount(c); 
        else await adminService.createDiscount(c);
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'discounts'] });
      showToast('Discount codes saved successfully');
    } catch { showToast('Error saving discount codes', 'error'); }
  };

  const saveSiteAll = async (s: SiteSettings) => {
    try { 
      if (!s) throw new Error('No site settings to save');
      
      const response = await adminService.updateSiteSettings(s); 
      // Update local state and cache with response from server which has _id etc
      const savedData = response;
      
      queryClient.setQueryData(['admin', 'siteSettings'], savedData);
      saveSite(savedData as any);
      window.dispatchEvent(new Event('backend-hydrated'));
      showToast('Settings saved successfully'); 
    } catch (err: any) { 
      console.error('Error saving site settings:', err);
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to save site settings';
      showToast(msg, 'error');
      throw err;
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await adminService.updateOrderStatus(id, status);
      showToast('Order status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    } catch { showToast('Error updating order status', 'error'); }
  };

  const deleteOrder = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await adminService.deleteOrder(id);
      showToast('Order deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    } catch { showToast('Error deleting order', 'error'); }
  };

  const bulkDeleteOrders = async (ids: string[]) => {
    if (!window.confirm(`Are you sure you want to delete ${ids.length} orders?`)) return;
    try {
      await adminService.bulkDeleteOrders(ids);
      showToast(`${ids.length} orders deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    } catch { showToast('Error deleting orders', 'error'); }
  };

  const deleteSubscriber = async (id: string) => {
    try { 
      await adminService.deleteSubscriber(id); 
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscribers'] });
    } catch { alert('Error'); }
  };

  const updateReviewStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await adminService.updateReview(id, { status });
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      showToast(`Review ${status} successfully`);
    } catch { showToast('Error updating review', 'error'); }
  };

  const updateMessageStatus = async (id: string, status: string) => {
    try {
      await adminService.updateMessageStatus(id, status);
      queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] });
      showToast(`Message marked as ${status}`);
    } catch { showToast('Error updating message status', 'error'); }
  };

  const deleteMessage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await adminService.deleteMessage(id);
      showToast('Message deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] });
    } catch { showToast('Error deleting message', 'error'); }
  };

  const deleteReview = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await adminService.deleteReview(id);
      showToast('Review deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    } catch { showToast('Error deleting review', 'error'); }
  };

  const handleCreateReview = async () => {
    if (!newReview.productId || !newReview.customerName || !newReview.comment) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const fd = new FormData();
      fd.append('productId', newReview.productId);
      fd.append('customerName', newReview.customerName);
      fd.append('rating', String(newReview.rating));
      fd.append('reviewText', newReview.comment);
      fd.append('headline', newReview.headline);
      
      reviewImages.forEach(img => fd.append('images', img));
      if (reviewVideo) fd.append('video', reviewVideo);

      await adminService.createReview(fd);
      showToast('Review created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      
      setNewReview({
        productId: '',
        customerName: '',
        rating: 5,
        comment: '',
        headline: ''
      });
      setReviewImages([]);
      setReviewVideo(null);
    } catch (err) {
      console.error('Create review error:', err);
      showToast('Error creating review', 'error');
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!window.confirm('Delete testimonial?')) return;
    try {
      await adminService.deleteTestimonial(id);
      queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] });
    } catch { alert('Error'); }
  };

  const deleteGalleryImage = async (id: string) => {
    if (!window.confirm('Delete gallery image?')) return;
    try {
      await adminService.deleteGalleryImage(id);
      queryClient.invalidateQueries({ queryKey: ['admin', 'galleryImages'] });
    } catch { alert('Error'); }
  };

  const saveTestimonial = async (fd: FormData) => {
    try {
      if (testimonialEditing?._id) {
        await adminService.updateTestimonial(testimonialEditing._id, fd);
        showToast('Testimonial updated successfully');
      } else {
        await adminService.addTestimonial(fd);
        showToast('Testimonial added successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] });
      setTestimonialEditing(undefined);
    } catch { showToast('Error saving testimonial', 'error'); }
  };

  const toggleTestimonialStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'visible' ? 'hidden' : 'visible';
      const fd = new FormData();
      fd.append('status', newStatus);
      await adminService.updateTestimonial(id, fd);
      queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] });
      showToast(`Testimonial is now ${newStatus}`);
    } catch { showToast('Error updating status', 'error'); }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="w-24 h-24 border-8 border-pink-50 rounded-full animate-spin border-t-[#eb4899]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="text-[#eb4899] animate-pulse" size={32} />
          </div>
        </div>
        <p className="mt-8 text-xs font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">Initializing EB'S CLOSET Dashboard</p>
      </div>
    );
  }

  const commandMap: Record<string, string> = {
    'dashboard': 'dashboard',
    'home': 'dashboard',
    'products': 'products',
    'catalog': 'products',
    'categories': 'categories',
    'age categories': 'age-categories',
    'age': 'age-categories',
    'budgets': 'budgets',
    'discounts': 'discounts',
    'codes': 'discounts',
    'site': 'site',
    'settings': 'site',
    'orders': 'orders',
    'sales': 'orders',
    'newsletter': 'newsletter',
    'subscribers': 'newsletter',
    'inbox': 'inbox',
    'messages': 'inbox',
    'reviews': 'reviews',
    'testimonials': 'testimonials',
    'customers': 'customers',
    'users': 'customers',
    'analytics': 'analytics',
    'stats': 'analytics',
    'inventory': 'inventory',
    'stock': 'inventory'
  };

  const handleSearchSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const q = searchQuery.toLowerCase().trim();
      
      if (commandMap[q]) {
        setTab(commandMap[q] as any);
        setSearchQuery(''); 
        showToast(`Navigated to ${q}`);
      } else if (q.length > 0) {
        // Fallback: search products
        setTab('products');
        setProductSearch(searchQuery);
        setShowSuggestions(false);
      }
    }
  };

  const filteredProducts = (tab === 'products' || tab === 'inventory') ? catalog : catalog.filter(p => {
    const matchesSearch = !searchQuery || 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(p._id).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredOrders = orders.filter(o => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      String(o.orderId || o._id).toLowerCase().includes(q) ||
      o.customer?.fullName?.toLowerCase().includes(q) ||
      o.customer?.email?.toLowerCase().includes(q)
    );
  });

  const filteredUsers = users.filter(u => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      String(u._id).toLowerCase().includes(q)
    );
  });

  const filteredSubscribers = subscribers.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.email?.toLowerCase().includes(q);
  });

  const filteredReviews = reviews.filter(r => {
    // Apply status filter
    if (reviewFilter === 'Approved' && r.status !== 'approved') return false;
    if (reviewFilter === 'Pending' && r.status === 'approved') return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.customerName?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q) ||
      r.productId?.name?.toLowerCase().includes(q)
    );
  });

  const filteredTestimonials = testimonials.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.customerName?.toLowerCase().includes(q) ||
      t.content?.toLowerCase().includes(q) ||
      t.tag?.toLowerCase().includes(q)
    );
  });

  const filteredCategories = productCategories.filter(cat => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      cat.name?.toLowerCase().includes(q) ||
      cat.slug?.toLowerCase().includes(q)
    );
  });

  const filteredCodes = codes.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.code?.toLowerCase().includes(q);
  });

  const filteredMessages = messages.filter(m => {
    // Apply status filter
    if (messageFilter === 'Pending' && m.status === 'resolved') return false;
    if (messageFilter === 'Resolved' && m.status !== 'resolved') return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.message?.toLowerCase().includes(q)
    );
  });

  const filteredRecentOrders = (dashboardData?.recentOrders || []).filter((order: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.customer?.fullName?.toLowerCase().includes(q) ||
      (order.orderId || `#${String(order._id || '').substring(0, 8)}`).toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden font-sans selection:bg-pink-100 selection:text-[#eb4899]">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 w-[300px] bg-white border-r border-[#F3F4F6] z-50 transform transition-transform duration-500 ease-out lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-8">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#eb4899] rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20">
                <Sparkles className="text-white" size={20} />
              </div>
              <h1 className="text-2xl font-black text-[#111827] tracking-tighter">EB'S CLOSET<span className="text-[#eb4899]">.</span></h1>
            </div>
            <button className="lg:hidden text-gray-400 hover:text-gray-900" onClick={() => setIsMobileMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar -mx-2 px-2">
            <div className="mb-8">
              <p className="px-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Core Management</p>
              <div className="space-y-1">
                <SidebarItem icon={LayoutGrid} label="Dashboard" active={tab === 'dashboard'} onClick={() => setTab('dashboard')} />
                <SidebarItem icon={ShoppingBag} label="Products" active={tab === 'products'} onClick={() => setTab('products')} />
                <SidebarItem icon={LayoutGrid} label="Categories" active={tab === 'categories'} onClick={() => setTab('categories')} />
                <SidebarItem icon={Layers} label="Age Categories" active={tab === 'age-categories'} onClick={() => setTab('age-categories')} />
                <SidebarItem icon={ShoppingCart} label="Orders" active={tab === 'orders'} onClick={() => setTab('orders')} />
                <SidebarItem icon={Users} label="Customers" active={tab === 'customers'} onClick={() => setTab('customers')} />
                <SidebarItem icon={BarChart} label="Analytics" active={tab === 'analytics'} onClick={() => setTab('analytics')} />
              </div>
            </div>

            <div className="mb-8">
              <p className="px-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Site Content</p>
              <div className="space-y-1">
                <SidebarItem icon={Star} label="Reviews" active={tab === 'reviews'} onClick={() => setTab('reviews')} />
                <SidebarItem icon={MessageSquare} label="Testimonials" active={tab === 'testimonials'} onClick={() => setTab('testimonials')} />
                <SidebarItem icon={DollarSign} label="Budgets" active={tab === 'budgets'} onClick={() => setTab('budgets')} />
              </div>
            </div>

            <div className="mb-8">
              <p className="px-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Storefront Tools</p>
              <div className="space-y-1">
                <SidebarItem icon={Sparkles} label="Discounts" active={tab === 'discounts'} onClick={() => setTab('discounts')} />
                <SidebarItem icon={Inbox} label="Inbox" active={tab === 'inbox'} onClick={() => setTab('inbox')} />
                <SidebarItem icon={Mail} label="Newsletter" active={tab === 'newsletter'} onClick={() => setTab('newsletter')} />
                <SidebarItem icon={ClipboardList} label="Inventory" active={tab === 'inventory'} onClick={() => setTab('inventory')} />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#F3F4F6] space-y-1">
            <SidebarItem icon={Settings} label="Settings" active={tab === 'site'} onClick={() => setTab('site')} />
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-6 py-3.5 text-sm font-bold text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all rounded-[1.25rem] group"
            >
              <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB] relative overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#F3F4F6] px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">{tab}</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">Welcome back, {adminName}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 relative group">
              <Search className="text-gray-400" size={16} />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search products or commands..." 
                className="bg-transparent border-none text-xs font-bold focus:ring-0 w-48 placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setProductSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={handleSearchSubmit}
              />
              <span className="text-[9px] font-black text-gray-300 bg-white px-1.5 py-0.5 rounded border border-gray-100">⌘K</span>

              {/* Global Suggestions Dropdown */}
              {showSuggestions && searchQuery.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 min-w-[250px]">
                  {/* Command Suggestions */}
                  {Object.keys(commandMap).filter(cmd => cmd.includes(searchQuery.toLowerCase())).length > 0 && (
                    <div className="py-2 border-b border-gray-50">
                      <p className="px-4 py-1 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Navigation</p>
                      {Object.keys(commandMap)
                        .filter(cmd => cmd.includes(searchQuery.toLowerCase()))
                        .slice(0, 3)
                        .map(cmd => (
                          <button
                            key={cmd}
                            onMouseDown={(e) => {
                              e.preventDefault(); // Prevent blur before action
                              setTab(commandMap[cmd] as any);
                              setSearchQuery('');
                              setShowSuggestions(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                          >
                            <LayoutGrid size={14} className="text-[#eb4899]" />
                            <span className="text-xs font-bold text-gray-700 capitalize">Go to {cmd}</span>
                          </button>
                        ))}
                    </div>
                  )}

                  {/* Product Suggestions */}
                  {suggestionsLoading ? (
                    <div className="p-4 text-center">
                      <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="py-2">
                      <p className="px-4 py-1 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Products</p>
                      {suggestions.map((p) => (
                        <button
                          key={p._id}
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevent blur before action
                            setTab('products');
                            setSearchQuery(p.name);
                            setProductSearch(p.name);
                            setShowSuggestions(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                            <img src={p.image} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-gray-900 line-clamp-1">{p.name}</p>
                            <p className="text-[9px] font-bold text-[#eb4899]">${p.price}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    // Only show "No results" if NO commands matched either
                    Object.keys(commandMap).filter(cmd => cmd.includes(searchQuery.toLowerCase())).length === 0 && searchQuery.length > 2 && (
                      <div className="p-4 text-center text-[10px] text-gray-400 font-bold">No results found</div>
                    )
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black text-gray-900 leading-none">{adminName}</p>
                <p className="text-[9px] font-bold text-[#eb4899] uppercase tracking-tighter mt-1">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#eb4899] text-white flex items-center justify-center font-black shadow-lg shadow-pink-500/20">
                {(adminName || '').substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <div className="max-w-[1600px] mx-auto">
            {tab === 'dashboard' && dashboardData && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Revenue', value: `$${Number(dashboardData.counts?.sales || 0).toLocaleString()}`, change: '+12.5%', icon: DollarSign, color: 'text-emerald-500 bg-emerald-50' },
                    { label: 'Total Orders', value: dashboardData.counts?.orders || 0, change: '+8.2%', icon: ShoppingBag, color: 'text-blue-500 bg-blue-50' },
                    { label: 'Total Customers', value: dashboardData.counts?.users || 0, change: '+15.3%', icon: Users, color: 'text-purple-500 bg-purple-50' },
                    { label: 'Total Products', value: dashboardData.counts?.products || 0, change: 'Active', icon: LayoutGrid, color: 'text-pink-500 bg-pink-50' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                          <stat.icon size={24} />
                        </div>
                        <span className={`text-[11px] font-black px-2 py-1 rounded-lg ${stat.change.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                      <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{stat.value}</h3>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Recent Activity</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time store updates</p>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-[#eb4899] transition-colors"><RefreshCcw size={20} /></button>
                    </div>
                    
                    <div className="space-y-6">
                      {filteredRecentOrders.map((order: any, i: number) => {
                        const customerName = order.customer?.fullName || 'Guest';
                        const orderNumber = order.orderId || `#${String(order._id || '').substring(0, 8)}`;
                        
                        return (
                          <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-all cursor-pointer group">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm font-black text-[#eb4899] group-hover:scale-110 transition-transform">
                                {(customerName || '').substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">{customerName}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Order {orderNumber}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-gray-900">${order.totalAmount}</p>
                              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">{order.status}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'New Product', icon: Plus, color: 'bg-pink-50 text-[#eb4899]', action: () => { setTab('products'); setIsProductModalOpen(true); } },
                        { label: 'View Orders', icon: ShoppingBag, color: 'bg-blue-50 text-blue-500', action: () => setTab('orders') },
                        { label: 'Customers', icon: Users, color: 'bg-purple-50 text-purple-500', action: () => setTab('customers') },
                        { label: 'Site Settings', icon: Settings, color: 'bg-gray-50 text-gray-500', action: () => setTab('site') }
                      ].map((action, i) => (
                        <button 
                          key={i}
                          onClick={action.action}
                          className="flex flex-col items-center justify-center p-6 rounded-3xl border border-gray-50 hover:border-pink-100 hover:bg-pink-50/10 transition-all group"
                        >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${action.color} mb-3 group-hover:scale-110 transition-transform shadow-sm`}>
                            <action.icon size={20} />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 text-center">{action.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="mt-8 p-6 bg-[#111827] rounded-3xl text-white relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#eb4899]/20 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                      <div className="relative z-10">
                        <Sparkles className="text-[#eb4899] mb-4" size={24} />
                        <h4 className="text-lg font-black tracking-tight mb-2 leading-tight">Pro Features<br/>Unlocked.</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">You have full access to EB'S CLOSET's premium suite.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


{/* product tab starts here */}


            {tab === 'products' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Product Catalog<span className="text-[#eb4899]">.</span></h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Manage {catalog.length} store items</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Category Filter */}
                    <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto max-w-[500px] no-scrollbar">
                      <button
                        onClick={() => setProductCategoryId('all')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                          productCategoryId === 'all' ? 'bg-[#111827] text-white shadow-lg shadow-black/20' : 'text-gray-400 hover:text-gray-900'
                        }`}
                      >
                        All Products
                      </button>
                      {productCategories.map((cat) => (
                        <button
                          key={cat._id}
                          onClick={() => setProductCategoryId(cat._id)}
                          className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                            productCategoryId === cat._id ? 'bg-[#111827] text-white shadow-lg shadow-black/20' : 'text-gray-400 hover:text-gray-900'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>

                    {/* Product Search Bar */}
                    <div className="relative group min-w-[300px]">
                      <div className="flex items-center bg-white px-5 py-3.5 rounded-2xl border border-gray-100 shadow-sm focus-within:border-pink-200 transition-all">
                        <Search className="text-gray-400 mr-3" size={18} />
                        <input 
                          type="text" 
                          placeholder="Search product..." 
                          className="bg-transparent border-none text-xs font-bold focus:ring-0 flex-1 placeholder:text-gray-400"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setProductSearch(e.target.value);
                            setShowSuggestions(true);
                          }}
                          onFocus={() => setShowSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        />
                        {searchQuery && (
                          <button 
                            onClick={() => { setSearchQuery(''); setProductSearch(''); }}
                            className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      {/* Suggestions Dropdown */}
                      {showSuggestions && searchQuery.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                          {suggestionsLoading ? (
                            <div className="p-8 text-center">
                              <div className="w-6 h-6 border-2 border-[#eb4899] border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </div>
                          ) : suggestions.length > 0 ? (
                            <div className="py-3">
                              <p className="px-5 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-2">Suggestions</p>
                              {suggestions.map((p) => (
                                <button
                                  key={p._id}
                                  onClick={() => {
                                    setSearchQuery(p.name);
                                    setProductSearch(p.name);
                                    setShowSuggestions(false);
                                  }}
                                  className="w-full flex items-center gap-4 px-5 py-3 hover:bg-pink-50/30 transition-all text-left group/item"
                                >
                                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 group-hover/item:scale-105 transition-transform">
                                    <img src={p.image} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-black text-gray-900 line-clamp-1 group-hover/item:text-[#eb4899] transition-colors">{p.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[11px] font-black text-[#eb4899]">${p.price}</span>
                                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">in {p.categoryId?.name || 'Uncategorized'}</span>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="p-8 text-center">
                              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <Search className="text-gray-300" size={20} />
                              </div>
                              <p className="text-xs text-gray-400 font-bold">No products found</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => { setProductEditing(undefined); setIsProductModalOpen(true); }}
                      className="px-8 py-4 bg-[#eb4899] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-pink-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <Plus size={16} /> Add Product
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                   {selectedProductIds.length > 0 && (
                    <div className="px-8 py-4 bg-[#111827] text-white flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-widest">{selectedProductIds.length} Products Selected</p>
                      <button 
                        onClick={bulkDeleteProducts}
                        className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Delete Selection
                      </button>
                    </div>
                  )}
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-50 bg-gray-50/30">
                          <th className="px-8 py-5 w-12">
                            <input 
                              type="checkbox" 
                              className="rounded-lg border-gray-200 text-[#eb4899] focus:ring-[#eb4899]" 
                              onChange={(e) => {
                                if (e.target.checked) setSelectedProductIds(catalog.map(p => p._id!));
                                else setSelectedProductIds([]);
                              }}
                            />
                          </th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Product</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Price</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Category</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredProducts.map((product) => (
                          <tr key={product._id} className="group hover:bg-gray-50/50 transition-all">
                            <td className="px-8 py-5">
                              <input 
                                type="checkbox" 
                                checked={selectedProductIds.includes(product._id!)}
                                className="rounded-lg border-gray-200 text-[#eb4899] focus:ring-[#eb4899]"
                                onChange={() => {
                                  setSelectedProductIds(prev => 
                                    prev.includes(product._id!) ? prev.filter(id => id !== product._id) : [...prev, product._id!]
                                  );
                                }}
                              />
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[1.25rem] overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 group-hover:scale-110 transition-transform">
                                  {product.images?.[0] || product.image ? (
                                    <img src={product.images?.[0] || product.image} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-200"><ImageIcon size={24} /></div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-black text-gray-900 group-hover:text-[#eb4899] transition-colors">{product.name}</p>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">ID: {String(product._id || '').substring(0, 8)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5 font-black text-sm text-gray-900">${product.price}</td>
                            <td className="px-8 py-5">
                              <span className="px-4 py-1.5 bg-gray-50 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100">
                                {product.categoryId?.name || 'Uncategorized'}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button 
                                  onClick={() => { setProductEditing(product); setIsProductModalOpen(true); }}
                                  className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-[#eb4899] hover:border-pink-100 rounded-xl transition-all shadow-sm"
                                >
                                  <Edit size={16} />
                                </button>
                                <button 
                                  onClick={() => removeProduct(product._id!)}
                                  className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 rounded-xl transition-all shadow-sm"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {tab === 'inventory' && (
              <InventoryManagement 
                products={filteredProducts} 
                onEdit={(p) => {
                  setProductEditing(p);
                  setIsProductModalOpen(true);
                }} 
              />
            )}



            {/* categories tab starts from here */}

            {tab === 'categories' && (
              <CategoryManagement 
                categories={filteredCategories}
                onRefresh={() => queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })}
                onEdit={(cat) => {
                  setCategoryEditing(cat);
                  setIsCategoryModalOpen(true);
                }}
                onAdd={() => {
                  setCategoryEditing(undefined);
                  setIsCategoryModalOpen(true);
                }}
              />
            )}

            {tab === 'age-categories' && (
              <AgeCategoryManager />
            )}

            {tab === 'budgets' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <BudgetManager initial={site?.budgets || []} onSave={(b) => saveSiteAll({ ...site!, budgets: b })} />
              </div>
            )}

            {tab === 'discounts' && <DiscountsManagement codes={filteredCodes} onRefresh={() => adminService.getDiscounts().then(setCodes as any)} />}

            {tab === 'orders' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <OrdersManagement 
  orders={filteredOrders} 
  onUpdateStatus={updateOrderStatus} 
  onDeleteOrder={deleteOrder}
  onBulkDeleteOrders={bulkDeleteOrders}
  onViewDetails={(order) => {
    setSelectedOrder(order);
    setIsOrderDetailsModalOpen(true);
  }}
/>
              </div>
            )}

            {tab === 'site' && <SiteSettingsComp initial={site} onSave={saveSiteAll} />}

            {tab === 'newsletter' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between">
                  <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Subscribers<span className="text-[#eb4899]">.</span></h1>
                  <button className="px-8 py-4 bg-[#111827] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-105 transition-all flex items-center gap-2">
                    <Download size={16} /> Export List
                  </button>
                </div>
                
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-50 bg-gray-50/30">
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Subscribed On</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredSubscribers.map((s) => (
                          <tr key={s._id} className="group hover:bg-gray-50/50 transition-all">
                            <td className="px-8 py-5 font-bold text-sm text-gray-900">{s.email}</td>
                            <td className="px-8 py-5 text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                            <td className="px-8 py-5 text-right">
                              <button onClick={() => deleteSubscriber(s._id)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {tab === 'inbox' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Messages<span className="text-[#eb4899]">.</span></h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Manage customer inquiries</p>
                  </div>
                  <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                    {(['All', 'Pending', 'Resolved'] as const).map((filter) => (
                      <button 
                        key={filter} 
                        onClick={() => setMessageFilter(filter)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          messageFilter === filter 
                            ? 'bg-gray-900 text-white shadow-lg shadow-black/10' 
                            : 'text-gray-400 hover:text-gray-900'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMessages.map((m) => (
                    <div key={m._id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all group">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-[#eb4899] group-hover:scale-110 transition-transform">
                          <Mail size={24} />
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${m.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-pink-50 text-[#eb4899]'}`}>
                          {m.status || 'new'}
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-gray-900 tracking-tight mb-1">{m.name}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">{m.email}</p>
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-6">"{m.message}"</p>
                      <div className="flex items-center gap-3 pt-6 border-t border-gray-50">
                        {m.status !== 'resolved' ? (
                          <button 
                            onClick={() => updateMessageStatus(m._id, 'resolved')}
                            className="flex-1 py-3 bg-[#eb4899] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-pink-600 transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle size={14} /> Mark Resolved
                          </button>
                        ) : (
                          <button className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">Reply</button>
                        )}
                        <button 
                          onClick={() => deleteMessage(m._id)}
                          className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'reviews' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Customer Reviews<span className="text-[#eb4899]">.</span></h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Manage verified feedback</p>
                  </div>
                  <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                    {(['All', 'Approved', 'Pending'] as const).map((filter) => (
                      <button 
                        key={filter} 
                        onClick={() => setReviewFilter(filter)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          reviewFilter === filter 
                            ? 'bg-gray-900 text-white shadow-lg shadow-black/10' 
                            : 'text-gray-400 hover:text-gray-900'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1fr,400px] gap-8">
                  <div className="space-y-4">
                    {filteredReviews.map((r) => (
                      <div 
                        key={r._id} 
                        onClick={() => {
                          if (r.status === 'approved' && r.productId) {
                            setProductEditing(r.productId as any);
                            setIsProductModalOpen(true);
                          }
                        }}
                        className={`bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm group ${r.status === 'approved' ? 'cursor-pointer hover:border-pink-200 transition-all' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-[#eb4899] border border-gray-100 group-hover:scale-110 transition-transform">
                              {String(r.customerName || 'Anonymous').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900">{r.customerName || 'Anonymous'}</p>
                              <div className="flex gap-0.5 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={10} className={i < r.rating ? 'text-[#eb4899] fill-[#eb4899]' : 'text-gray-200'} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              r.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-pink-50 text-[#eb4899]'
                            }`}>
                              {r.status || 'Pending'}
                            </span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteReview(r._id);
                              }} 
                              className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        <h4 className="text-base font-black text-gray-900 tracking-tight mb-1">"{r.headline || 'Product Review'}"</h4>
                        {r.productId && (
                          <p className="text-[10px] font-bold text-[#eb4899] uppercase tracking-widest mb-2">For: {r.productId.name}</p>
                        )}
                        <p className="text-sm text-gray-600 leading-relaxed mb-6">"{r.reviewText}"</p>
                        
                        {/* Review Media Display */}
                        {(r.images?.length || r.video) && (
                          <div className="flex flex-wrap gap-4 mb-6">
                            {r.images?.map((img: string, i: number) => (
                              <div key={i} className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 group/img relative">
                                <img src={img} alt="" className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                                <a 
                                  href={img} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                  <ExternalLink size={16} className="text-white" />
                                </a>
                              </div>
                            ))}
                            {r.video && (
                              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 group/vid relative">
                                <video src={r.video} className="w-full h-full object-cover" />
                                <a 
                                  href={r.video} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute inset-0 bg-black/40 opacity-0 group-hover/vid:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                  <ExternalLink size={16} className="text-white" />
                                </a>
                                <div className="absolute top-1 right-1 bg-[#eb4899] p-1 rounded-md">
                                  <Camera size={8} className="text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-3 pt-6 border-t border-gray-50">
                          {r.status !== 'approved' && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                updateReviewStatus(r._id, 'approved');
                              }}
                              className="px-6 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
                            >
                              Approve
                            </button>
                          )}
                          <button 
                            onClick={(e) => e.stopPropagation()}
                            className="px-6 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm sticky top-8 h-fit">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">Manual Entry</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">Add offline customer feedback</p>
                    
                    <div className="space-y-6">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Customer Name</label>
                        <input className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-pink-100" placeholder="e.g. Sarah J." value={newReview.customerName} onChange={e => setNewReview({...newReview, customerName: e.target.value})} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Product</label>
                        <select className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-pink-100 appearance-none" value={newReview.productId} onChange={e => setNewReview({...newReview, productId: e.target.value})}>
                          <option value="">Select a product...</option>
                          {catalog.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Feedback</label>
                        <textarea className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-medium placeholder:text-gray-300 focus:ring-2 focus:ring-pink-100 h-32 resize-none" placeholder="What did they say?" value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Images</label>
                          <label className="flex flex-col items-center justify-center w-full h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all">
                            <Camera size={20} className="text-gray-300 mb-1" />
                            <span className="text-[8px] font-bold text-gray-400 uppercase">{reviewImages.length} Images Selected</span>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={e => setReviewImages(Array.from(e.target.files || []))} />
                          </label>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Video</label>
                          <label className="flex flex-col items-center justify-center w-full h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all">
                            <Upload size={20} className="text-gray-300 mb-1" />
                            <span className="text-[8px] font-bold text-gray-400 uppercase">{reviewVideo ? '1 Video Selected' : 'No Video'}</span>
                            <input type="file" accept="video/*" className="hidden" onChange={e => setReviewVideo(e.target.files?.[0] || null)} />
                          </label>
                        </div>
                      </div>

                      <button onClick={handleCreateReview} className="w-full py-4 bg-[#eb4899] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-pink-500/20 hover:scale-[1.02] transition-all">Publish Review</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'testimonials' && (
              <div className="grid grid-cols-1 xl:grid-cols-[1fr,400px] gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Testimonials<span className="text-[#eb4899]">.</span></h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">High-impact social proof</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredTestimonials.map((t) => (
                      <div key={t._id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group-hover:scale-110 transition-transform">
                              {t.avatarUrl ? <img src={t.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><ImageIcon size={20} /></div>}
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900">{t.customerName}</p>
                              <p className="text-[10px] font-bold text-[#eb4899] uppercase tracking-widest mt-0.5">{t.tag || 'Verified Customer'}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => setTestimonialEditing(t)} className="p-2 text-gray-300 hover:text-[#eb4899] transition-colors"><Edit size={16} /></button>
                             <button onClick={() => deleteTestimonial(t._id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed mb-6 italic">"{t.content}"</p>
                        <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                           <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={10} className={i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-100'} />
                            ))}
                          </div>
                          <button 
                            onClick={() => toggleTestimonialStatus(t._id, t.status)}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${t.status === 'visible' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}
                          >
                            {t.status}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <TestimonialForm 
                  initial={testimonialEditing} 
                  products={catalog} 
                  onSave={saveTestimonial} 
                  onCancel={() => setTestimonialEditing(undefined)} 
                />
              </div>
            )}

{/* customer tab starts here */}


            {tab === 'customers' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <CustomersManagement users={filteredUsers} />
              </div>
            )}

            {tab === 'analytics' && <Analytics data={dashboardData} />}

            {tab === 'settings' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Account Settings<span className="text-[#eb4899]">.</span></h1>
                <div className="max-w-2xl bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <div className="space-y-8">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-3xl bg-[#eb4899] text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-pink-500/20">
                        {(adminName || '').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">{adminName}</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Primary Administrator</p>
                      </div>
                    </div>

                    <div className="grid gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-pink-100" value={adminName} onChange={e => setAdminName(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                        <input className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-400 cursor-not-allowed" value="admin@ebscloset.com" disabled />
                      </div>
                    </div>
                    
                    <button className="w-full py-5 bg-[#111827] text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-black/10 hover:bg-black transition-all">Update Account</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {isProductModalOpen && (
        <ProductManagementModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          onSave={saveProduct}
          initialProduct={productEditing}
        />
      )}
      
      {isCategoryModalOpen && (
        <CategoryManagementModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onSave={saveCategory}
          initialCategory={categoryEditing}
        />
      )}

      {isOrderDetailsModalOpen && selectedOrder && (
        <OrderDetailsModal
          isOpen={isOrderDetailsModalOpen}
          onClose={() => {
            setIsOrderDetailsModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onUpdateStatus={updateOrderStatus}
        />
      )}
    </div>
  );
}
