import apiClient from './api';

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image: string;
  author: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const blogService = {
  getBlogs: async (): Promise<BlogPost[]> => {
    const response = await apiClient.get('/blogs');
    return response.data;
  },
  getBlogBySlug: async (slug: string): Promise<BlogPost> => {
    const response = await apiClient.get(`/blogs/${slug}`);
    return response.data;
  },
  // Admin methods
  adminGetBlogs: async (): Promise<BlogPost[]> => {
    const response = await apiClient.get('/admin/blogs');
    return response.data;
  },
  createBlog: async (formData: FormData): Promise<BlogPost> => {
    const response = await apiClient.post('/admin/blogs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  updateBlog: async (id: string, formData: FormData): Promise<BlogPost> => {
    const response = await apiClient.put(`/admin/blogs/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  deleteBlog: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/blogs/${id}`);
  }
};
