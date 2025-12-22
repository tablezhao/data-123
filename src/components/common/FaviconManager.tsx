import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

/**
 * FaviconManager 组件用于动态管理网站的 favicon
 * 监听 settingsStore 中的 faviconUrl 变化，自动更新 favicon
 */
export const FaviconManager = () => {
  const { faviconUrl } = useSettingsStore();

  useEffect(() => {
    if (!faviconUrl) return;
    const iconLinks = Array.from(document.querySelectorAll('link[rel="icon"]')) as HTMLLinkElement[];
    let faviconElement = iconLinks[0];

    if (!faviconElement) {
      faviconElement = document.createElement('link');
      faviconElement.rel = 'icon';
      document.head.appendChild(faviconElement);
    }

    iconLinks.slice(1).forEach((el) => el.parentNode?.removeChild(el));

    const nextFaviconHref = faviconUrl;
    const nextFaviconAbsHref = new URL(nextFaviconHref, window.location.href).href;
    if (faviconElement.href !== nextFaviconAbsHref) {
      faviconElement.href = nextFaviconHref;
    }

    if (faviconUrl.endsWith('.svg')) {
      faviconElement.type = 'image/svg+xml';
    } else if (faviconUrl.endsWith('.png')) {
      faviconElement.type = 'image/png';
    } else if (faviconUrl.endsWith('.ico')) {
      faviconElement.type = 'image/x-icon';
    }

    const appleLinks = Array.from(
      document.querySelectorAll('link[rel="apple-touch-icon"]')
    ) as HTMLLinkElement[];
    let appleTouchIcon = appleLinks[0];

    if (!appleTouchIcon) {
      appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      document.head.appendChild(appleTouchIcon);
    }

    appleLinks.slice(1).forEach((el) => el.parentNode?.removeChild(el));

    const appleHref = faviconUrl.endsWith('.png') ||
      faviconUrl.endsWith('.jpg') ||
      faviconUrl.endsWith('.jpeg') ||
      faviconUrl.endsWith('.webp')
        ? faviconUrl
        : '/favicon.png';

    const appleAbsHref = new URL(appleHref, window.location.href).href;
    if (appleTouchIcon.href !== appleAbsHref) {
      appleTouchIcon.href = appleHref;
    }

    appleTouchIcon.sizes = '180x180';
    appleTouchIcon.type = 'image/png';
  }, [faviconUrl]);

  return null;
};
