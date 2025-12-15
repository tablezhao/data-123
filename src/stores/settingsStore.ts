import { create } from 'zustand';
import { getSiteSettings } from '@/services/settingsService';

interface SettingsState {
  siteName: string;
  siteDescription: string;
  siteKeywords: string[];
  footerText: string;
  loading: boolean;
  loadSettings: () => Promise<void>;
  refreshSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  siteName: '数据合规123导航',
  siteDescription: '专业的数据合规网站导航',
  siteKeywords: [],
  footerText: '© 2025 数据合规123导航. All rights reserved.',
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
        loading: false,
      });
    } catch (error) {
      console.error('加载网站设置失败:', error);
      set({ loading: false });
    }
  },

  refreshSettings: async () => {
    await getSiteSettingsStore.getState().loadSettings();
  },
}));

// 导出 store 实例，方便在非组件中使用
export const getSiteSettingsStore = () => useSettingsStore;
