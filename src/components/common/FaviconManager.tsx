import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

/**
 * FaviconManager 组件用于动态管理网站的 favicon
 * 监听 settingsStore 中的 faviconUrl 变化，自动更新 favicon
 */
export const FaviconManager = () => {
  const { faviconUrl } = useSettingsStore();

  useEffect(() => {
    // 获取或创建 favicon 元素
    let faviconElement = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    
    if (!faviconElement) {
      // 如果不存在，创建新元素
      faviconElement = document.createElement('link');
      faviconElement.rel = 'icon';
      faviconElement.type = 'image/x-icon';
      document.head.appendChild(faviconElement);
    }

    // 更新 favicon URL
    if (faviconUrl) {
      faviconElement.href = faviconUrl;
      // 根据文件扩展名设置正确的 MIME 类型
      if (faviconUrl.endsWith('.svg')) {
        faviconElement.type = 'image/svg+xml';
      } else if (faviconUrl.endsWith('.png')) {
        faviconElement.type = 'image/png';
      } else if (faviconUrl.endsWith('.ico')) {
        faviconElement.type = 'image/x-icon';
      }
    } else {
      // 使用默认 favicon
      faviconElement.href = '/favicon.png';
      faviconElement.type = 'image/png';
    }

    // 同时更新 apple-touch-icon
    let appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
    
    if (!appleTouchIcon) {
      appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      document.head.appendChild(appleTouchIcon);
    }

    appleTouchIcon.href = faviconUrl || '/favicon.png';
    appleTouchIcon.sizes = '180x180';
    appleTouchIcon.type = faviconUrl?.endsWith('.png') || !faviconUrl ? 'image/png' : 'image/x-icon';
  }, [faviconUrl]);

  return null;
};
