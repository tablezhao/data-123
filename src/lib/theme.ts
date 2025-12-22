/**
 * 主题系统 - 数据合规123导航网站
 * 
 * 基于设计令牌构建的主题系统，支持明暗模式切换
 * 集成色彩系统、排版系统、间距系统等设计规范
 */

import { colorTokens, typographyTokens, spacingTokens, shadowTokens, animationTokens } from './design-tokens';
import { useCallback, useEffect, useRef, useState } from 'react';

// 主题模式类型定义
export type ThemeMode = 'light' | 'dark' | 'system';

// 主题配置接口
export interface ThemeConfig {
  mode: ThemeMode;
  colors: Record<string, any>;
  typography: typeof typographyTokens;
  spacing: typeof spacingTokens;
  shadows: Record<string, any>;
  animations: typeof animationTokens;
  components: Record<string, any>;
}

// 基础主题配置
const baseTheme: Omit<ThemeConfig, 'mode'> = {
  colors: colorTokens,
  typography: typographyTokens,
  spacing: spacingTokens,
  shadows: shadowTokens,
  animations: animationTokens,
  components: {},
};

// 亮色主题配置
export const lightTheme: ThemeConfig = {
  ...baseTheme,
  mode: 'light',
  colors: {
    ...colorTokens,
    // 亮色模式特定配置
    background: {
      primary: 'hsl(0, 0%, 100%)',      // 纯白背景
      secondary: 'hsl(210, 20%, 98%)',   // 轻微灰色背景
      tertiary: 'hsl(210, 20%, 95%)',   // 卡片背景
      elevated: 'hsl(0, 0%, 100%)',      //  elevated元素背景
      overlay: 'hsl(0, 0%, 0%, 0.5)',   // 遮罩层
    },
    text: {
      primary: 'hsl(210, 20%, 20%)',     // 深灰文本
      secondary: 'hsl(210, 20%, 40%)',   // 中等灰文本
      tertiary: 'hsl(210, 20%, 60%)',    // 浅灰文本
      disabled: 'hsl(210, 20%, 70%)',    // 禁用文本
      inverse: 'hsl(0, 0%, 100%)',       // 反色文本
      link: colorTokens.primary[600],    // 链接文本
    },
    border: {
      light: 'hsl(210, 20%, 90%)',       // 浅色边框
      medium: 'hsl(210, 20%, 80%)',      // 中等边框
      dark: 'hsl(210, 20%, 70%)',        // 深色边框
      focus: colorTokens.primary[500],   // 焦点边框
    },
  },
};

// 暗色主题配置
export const darkTheme: ThemeConfig = {
  ...baseTheme,
  mode: 'dark',
  colors: {
    ...colorTokens,
    // 暗色模式特定配置
    background: {
      primary: 'hsl(210, 20%, 10%)',     // 深灰背景
      secondary: 'hsl(210, 20%, 15%)',   // 次要背景
      tertiary: 'hsl(210, 20%, 20%)',   // 卡片背景
      elevated: 'hsl(210, 20%, 25%)',   //  elevated元素背景
      overlay: 'hsl(0, 0%, 0%, 0.7)',   // 遮罩层
    },
    text: {
      primary: 'hsl(0, 0%, 95%)',        // 亮白文本
      secondary: 'hsl(210, 20%, 80%)',   // 浅灰文本
      tertiary: 'hsl(210, 20%, 65%)',    // 中等灰文本
      disabled: 'hsl(210, 20%, 50%)',    // 禁用文本
      inverse: 'hsl(210, 20%, 10%)',     // 反色文本
      link: colorTokens.primary[400],    // 链接文本
    },
    border: {
      light: 'hsl(210, 20%, 25%)',       // 浅色边框
      medium: 'hsl(210, 20%, 30%)',      // 中等边框
      dark: 'hsl(210, 20%, 35%)',        // 深色边框
      focus: colorTokens.primary[400],   // 焦点边框
    },
    // 暗色模式下的功能色调整
    success: {
      ...colorTokens.success,
      500: 'hsl(142, 71%, 55%)', // 提高亮度
    },
    warning: {
      ...colorTokens.warning,
      500: 'hsl(45, 100%, 61%)', // 提高亮度
    },
    error: {
      ...colorTokens.error,
      500: 'hsl(0, 84%, 70%)', // 提高亮度
    },
  },
};

// 主题管理器
export class ThemeManager {
  private currentTheme: ThemeConfig;
  private themeMode: ThemeMode;
  private listeners: Set<(theme: ThemeConfig) => void> = new Set();

  constructor(initialMode: ThemeMode = 'system') {
    this.themeMode = initialMode;
    this.currentTheme = this.resolveTheme(initialMode);
    this.setupSystemThemeListener();
  }

  // 解析主题模式
  private resolveTheme(mode: ThemeMode): ThemeConfig {
    if (mode === 'system') {
      return this.getSystemTheme();
    }
    return mode === 'dark' ? darkTheme : lightTheme;
  }

  // 获取系统主题
  private getSystemTheme(): ThemeConfig {
    if (typeof window === 'undefined') {
      return lightTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? darkTheme : lightTheme;
  }

  // 设置系统主题监听器
  private setupSystemThemeListener(): void {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (this.themeMode === 'system') {
        this.currentTheme = this.getSystemTheme();
        this.notifyListeners();
      }
    });
  }

  // 设置主题
  public setTheme(mode: ThemeMode): void {
    this.themeMode = mode;
    this.currentTheme = this.resolveTheme(mode);
    this.notifyListeners();
    this.saveThemePreference(mode);
  }

  // 获取当前主题
  public getTheme(): ThemeConfig {
    return this.currentTheme;
  }

  // 获取当前主题模式
  public getThemeMode(): ThemeMode {
    return this.themeMode;
  }

  // 添加主题变化监听器
  public addListener(listener: (theme: ThemeConfig) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // 通知所有监听器
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentTheme));
  }

  // 保存主题偏好
  private saveThemePreference(mode: ThemeMode): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('theme-preference', mode);
  }

  // 加载主题偏好
  public loadThemePreference(): ThemeMode {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem('theme-preference') as ThemeMode) || 'system';
  }

  // 应用主题到DOM
  public applyTheme(): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const theme = this.currentTheme;

    // 应用色彩变量
    Object.entries(theme.colors).forEach(([colorGroup, colors]) => {
      if (typeof colors === 'object') {
        Object.entries(colors).forEach(([shade, value]) => {
          const cssVar = `--color-${colorGroup}-${shade}`;
          root.style.setProperty(cssVar, String(value));
        });
      } else {
        const cssVar = `--color-${colorGroup}`;
        root.style.setProperty(cssVar, String(colors));
      }
    });

    // 应用排版变量
    Object.entries(theme.typography.fontSize).forEach(([size, value]) => {
      root.style.setProperty(`--font-size-${size}`, String(value));
    });

    Object.entries(theme.typography.fontWeight).forEach(([weight, value]) => {
      root.style.setProperty(`--font-weight-${weight}`, String(value));
    });

    Object.entries(theme.typography.lineHeight).forEach(([height, value]) => {
      root.style.setProperty(`--line-height-${height}`, String(value));
    });

    // 应用间距变量
    Object.entries(theme.spacing).forEach(([space, value]) => {
      root.style.setProperty(`--spacing-${space}`, String(value));
    });

    // 应用阴影变量
    Object.entries(theme.shadows).forEach(([shadow, value]) => {
      root.style.setProperty(`--shadow-${shadow}`, String(value));
    });

    // 应用动画变量
    Object.entries(theme.animations.duration).forEach(([duration, value]) => {
      root.style.setProperty(`--duration-${duration}`, String(value));
    });

    Object.entries(theme.animations.easing).forEach(([easing, value]) => {
      root.style.setProperty(`--ease-${easing}`, String(value));
    });

    // 设置主题类名
    root.classList.remove('light', 'dark');
    root.classList.add(theme.mode);
  }
}

// 主题Hook (用于React组件)
export function useTheme(): {
  theme: ThemeConfig;
  setTheme: (mode: ThemeMode) => void;
  themeMode: ThemeMode;
} {
  const [theme, setThemeState] = useState<ThemeConfig>(lightTheme);
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const themeManagerRef = useRef<ThemeManager | null>(null);

  useEffect(() => {
    if (!themeManagerRef.current) {
      themeManagerRef.current = new ThemeManager();
      const savedMode = themeManagerRef.current.loadThemePreference();
      themeManagerRef.current.setTheme(savedMode);
    }

    const updateTheme = (newTheme: ThemeConfig) => {
      setThemeState(newTheme);
      setThemeModeState(newTheme.mode);
    };

    updateTheme(themeManagerRef.current.getTheme());
    const unsubscribe = themeManagerRef.current.addListener(updateTheme);

    return () => {
      unsubscribe();
    };
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    if (themeManagerRef.current) {
      themeManagerRef.current.setTheme(mode);
    }
  }, []);

  return {
    theme,
    setTheme,
    themeMode,
  };
}

// 主题工具函数
export function createThemedStyles<T extends Record<string, any>>(
  styles: (theme: ThemeConfig) => T
): T {
  return styles(lightTheme); // 默认返回亮色主题样式
}

// 主题预设
export const themePresets = {
  light: lightTheme,
  dark: darkTheme,
} as const;

// 主题CSS变量生成器
export function generateThemeCSS(theme: ThemeConfig): string {
  const cssVars: string[] = [];

  // 生成色彩变量
  Object.entries(theme.colors).forEach(([colorGroup, colors]) => {
    if (typeof colors === 'object') {
      Object.entries(colors).forEach(([shade, value]) => {
        cssVars.push(`--color-${colorGroup}-${shade}: ${value};`);
      });
    } else {
      cssVars.push(`--color-${colorGroup}: ${colors};`);
    }
  });

  // 生成排版变量
  Object.entries(theme.typography.fontSize).forEach(([size, value]) => {
    cssVars.push(`--font-size-${size}: ${value};`);
  });

  Object.entries(theme.typography.fontWeight).forEach(([weight, value]) => {
    cssVars.push(`--font-weight-${weight}: ${value};`);
  });

  Object.entries(theme.typography.lineHeight).forEach(([height, value]) => {
    cssVars.push(`--line-height-${height}: ${value};`);
  });

  // 生成间距变量
  Object.entries(theme.spacing).forEach(([space, value]) => {
    cssVars.push(`--spacing-${space}: ${value};`);
  });

  // 生成阴影变量
  Object.entries(theme.shadows).forEach(([shadow, value]) => {
    cssVars.push(`--shadow-${shadow}: ${value};`);
  });

  // 生成动画变量
  Object.entries(theme.animations.duration).forEach(([duration, value]) => {
    cssVars.push(`--duration-${duration}: ${value};`);
  });

  Object.entries(theme.animations.easing).forEach(([easing, value]) => {
    cssVars.push(`--ease-${easing}: ${value};`);
  });

  return cssVars.join('\n');
}

// 默认主题管理器实例
export const themeManager = new ThemeManager();

export default {
  lightTheme,
  darkTheme,
  themeManager,
  useTheme,
  createThemedStyles,
  generateThemeCSS,
  themePresets,
};
