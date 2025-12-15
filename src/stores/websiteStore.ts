import { create } from 'zustand';
import type { Category, Website } from '@/types';
import { getCategories } from '@/services/categoryService';
import { getWebsites, getFeaturedWebsites, searchWebsites } from '@/services/websiteService';

interface WebsiteState {
  categories: Category[];
  websites: Website[];
  featuredWebsites: Website[];
  searchResults: Website[];
  loading: boolean;
  categoryLoading: boolean;
  searchLoading: boolean;
  fetchCategories: () => Promise<void>;
  fetchWebsites: (categoryId?: string) => Promise<void>;
  fetchFeaturedWebsites: (limit?: number) => Promise<void>;
  searchWebsites: (query: string) => Promise<void>;
  clearSearchResults: () => void;
}

export const useWebsiteStore = create<WebsiteState>((set) => ({
  categories: [],
  websites: [],
  featuredWebsites: [],
  searchResults: [],
  loading: false,
  categoryLoading: false,
  searchLoading: false,

  fetchCategories: async () => {
    set({ categoryLoading: true });
    try {
      const data = await getCategories();
      set({ categories: data, categoryLoading: false });
    } catch (error) {
      console.error('获取分类失败:', error);
      set({ categoryLoading: false });
    }
  },

  fetchWebsites: async (categoryId?: string) => {
    set({ loading: true });
    try {
      const data = await getWebsites(categoryId);
      set({ websites: data, loading: false });
    } catch (error) {
      console.error('获取网站失败:', error);
      set({ loading: false });
    }
  },

  fetchFeaturedWebsites: async (limit = 10) => {
    set({ loading: true });
    try {
      const data = await getFeaturedWebsites(limit);
      set({ featuredWebsites: data, loading: false });
    } catch (error) {
      console.error('获取热门网站失败:', error);
      set({ loading: false });
    }
  },

  searchWebsites: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [], searchLoading: false });
      return;
    }
    
    set({ searchLoading: true });
    try {
      const data = await searchWebsites(query);
      set({ searchResults: data, searchLoading: false });
    } catch (error) {
      console.error('搜索网站失败:', error);
      set({ searchLoading: false });
    }
  },

  clearSearchResults: () => {
    set({ searchResults: [] });
  },
}));
