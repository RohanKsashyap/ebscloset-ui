import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { useToast } from '../context/ToastContext';
import type { DiscountCode, SiteSettings } from '../types/admin';

export function useProducts(filters?: { categoryId?: string; search?: string }, enabled: boolean = true) {
  return useQuery({
    queryKey: ['admin', 'products', filters],
    queryFn: () => adminService.getProducts(filters),
    enabled,
    placeholderData: (previousData) => previousData,
  });
}

export function useProductSuggestions(search: string, enabled: boolean = false) {
  return useQuery({
    queryKey: ['admin', 'products', 'suggestions', search],
    queryFn: () => adminService.getProductSuggestions(search),
    enabled: enabled && search.length > 0,
  });
}

export function useOrders(enabled: boolean = true) {
  return useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: () => adminService.getOrders(),
    enabled,
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

export function useNavigation(enabled: boolean = true) {
  return useQuery({
    queryKey: ['admin', 'navigation'],
    queryFn: () => adminService.getNavigation(),
    enabled,
  });
}

export function useSiteSettings(enabled: boolean = true) {
  return useQuery({
    queryKey: ['admin', 'siteSettings'],
    queryFn: () => adminService.getSiteSettings(),
    enabled,
  });
}

export function useDashboard(enabled: boolean = true) {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminService.getDashboard(),
    enabled,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useDiscounts(enabled: boolean = true) {
  return useQuery({
    queryKey: ['admin', 'discounts'],
    queryFn: () => adminService.getDiscounts(),
    enabled,
  });
}

export function useGalleryCategories(enabled: boolean = true) {
  return useQuery({
    queryKey: ['admin', 'galleryCategories'],
    queryFn: () => adminService.getAdminGalleryCategories(),
    enabled,
  });
}

export function useCategories(enabled: boolean = true) {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminService.getCategories(),
    enabled,
  });
}

export function useSubscribers(enabled: boolean = true) {
  return useQuery({
    queryKey: ['admin', 'subscribers'],
    queryFn: () => adminService.getSubscribers(),
    enabled,
  });
}

export function useMessages(enabled: boolean = true) {
  return useQuery({
    queryKey: ['admin', 'messages'],
    queryFn: () => adminService.getMessages(),
    enabled,
  });
}

export function useReviews(enabled: boolean = true) {
  return useQuery({
    queryKey: ['admin', 'reviews'],
    queryFn: () => adminService.getReviews(),
    enabled,
  });
}

export function useTestimonials(enabled: boolean = true) {
  return useQuery({
    queryKey: ['admin', 'testimonials'],
    queryFn: () => adminService.getAdminTestimonials(),
    enabled,
  });
}

export function useGalleryImages(enabled: boolean = true) {
  return useQuery({
    queryKey: ['admin', 'galleryImages'],
    queryFn: () => adminService.getAdminGalleryImages(),
    enabled,
  });
}

export function useUsers(enabled: boolean = true) {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminService.getUsers(),
    enabled,
  });
}

export function useAgeCollections(enabled: boolean = true) {
  return useQuery({
    queryKey: ['admin', 'ageCollections'],
    queryFn: () => adminService.getAgeCollections(),
    enabled,
  });
}

// Mutations
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
    onError: (err) => {
      console.error('Update product error:', err);
      showToast('Error updating product', 'error');
    }
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: (data: any) => adminService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
    onError: (err) => {
      console.error('Create product error:', err);
      showToast('Error creating product', 'error');
    }
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: (data: any) => adminService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      showToast('User created successfully');
    },
    onError: (err: any) => {
      console.error('Create user error:', err);
      showToast(err.response?.data?.message || 'Error creating user', 'error');
    }
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      showToast('User updated successfully');
    },
    onError: (err: any) => {
      console.error('Update user error:', err);
      showToast(err.response?.data?.message || 'Error updating user', 'error');
    }
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      showToast('User deleted successfully');
    },
    onError: (err: any) => {
      console.error('Delete user error:', err);
      showToast(err.response?.data?.message || 'Error deleting user', 'error');
    }
  });
}
