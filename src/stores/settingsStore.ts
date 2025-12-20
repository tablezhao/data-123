import { create } from 'zustand';
import { getSiteSettings } from '@/services/settingsService';

interface SettingsState {
  siteName: string;
  siteDescription: string;
  siteKeywords: string[];
  footerText: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  showFeaturedSection: boolean;
  loading: boolean;
  loadSettings: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  toggleFeaturedSection: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  siteName: '数据合规123导航',
  siteDescription: '专业的数据合规网站导航',
  siteKeywords: [],
  footerText: '© 2025 数据合规123导航. All rights reserved.',
  logoUrl: null,
  faviconUrl: null,
  showFeaturedSection: true,
  loading: true,

  loadSettings: async () => {
    try {
      const settings = await getSiteSettings();
      set({
        siteName: (settings.site_name as string) || '数据合规123导航',
        siteDescription: (settings.site_description as string) || '专业的数据合规网站导航',
        siteKeywords: Array.isArray(settings.site_keywords) 
          ? settings.site_keywords 
          : typeof settings.site_keywords === 'string' 
          ? settings.site_keywords.split(',').map((k: string) => k.trim()) 
          : [],
        footerText: (settings.footer_text as string) || '© 2025 数据合规123导航. All rights reserved.',
        logoUrl: (settings.logo_url as string) || null,
        faviconUrl: (settings.favicon_url as string) || null,
        showFeaturedSection: typeof settings.show_featured_section === 'boolean' ? settings.show_featured_section : true,
        loading: false,
      });
    } catch (error) {
      console.error('加载网站设置失败:', error);
      set({ loading: false });
    }
  },

  refreshSettings: async () => {
    await useSettingsStore.getState().loadSettings();
  },

  toggleFeaturedSection: async () => {
    try {
      const state = useSettingsStore.getState();
      const newShowFeaturedSection = !state.showFeaturedSection;
      
      // 更新本地状态
      set({ showFeaturedSection: newShowFeaturedSection });
      
      // 导入需要的函数
      const { updateSiteSetting } = await import('@/services/settingsService');
      
      // 更新服务器设置
      await updateSiteSetting('show_featured_section', newShowFeaturedSection);
    } catch (error) {
      console.error('切换热门推荐模块显示状态失败:', error);
      // 恢复原来的状态
      set((state) => ({ showFeaturedSection: !state.showFeaturedSection }));
    }
  },
}));

// 导出 store 实例，方便在非组件中使用
export const getSiteSettingsStore = () => useSettingsStore;
