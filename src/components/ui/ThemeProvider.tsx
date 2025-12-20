/**
 * 主题提供者组件 - 数据合规123导航网站
 * 
 * 提供主题切换功能和主题上下文，支持明暗模式切换
 * 集成系统主题检测、本地存储和响应式主题切换
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { themeManager, ThemeMode, ThemeConfig, lightTheme, darkTheme } from '@/lib/theme';

// 主题上下文类型定义
interface ThemeContextType {
  theme: ThemeConfig;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
  toggleTheme: () => void;
  loading: boolean;
}

// 主题提供者属性
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  enableSystem?: boolean;
  enableTransition?: boolean;
  storageKey?: string;
}

// 创建主题上下文
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 主题提供者组件
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
  enableSystem = true,
  enableTransition = true,
  storageKey = 'theme-preference',
}) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(defaultTheme);
  const [theme, setTheme] = useState<ThemeConfig>(lightTheme);
  const [loading, setLoading] = useState(true);

  // 初始化主题
  useEffect(() => {
    const initTheme = async () => {
      try {
        // 从本地存储加载主题偏好
        const savedTheme = localStorage.getItem(storageKey);
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeModeState(savedTheme as ThemeMode);
        }

        // 应用初始主题
        const initialTheme = themeManager.getTheme();
        setTheme(initialTheme);
        themeManager.applyTheme();
        
        setLoading(false);
      } catch (error) {
        console.warn('Failed to initialize theme:', error);
        setLoading(false);
      }
    };

    initTheme();
  }, [storageKey]);

  // 监听主题变化
  useEffect(() => {
    const unsubscribe = themeManager.addListener((newTheme) => {
      setTheme(newTheme);
      
      // 应用主题到DOM
      themeManager.applyTheme();
      
      // 触发自定义事件
      window.dispatchEvent(new CustomEvent('theme-change', { detail: newTheme }));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 设置主题模式
  const setThemeMode = useCallback((mode: ThemeMode) => {
    if (!enableSystem && mode === 'system') {
      mode = 'light'; // 如果不启用系统主题，则默认为亮色主题
    }

    setThemeModeState(mode);
    themeManager.setTheme(mode);
    
    // 保存到本地存储
    try {
      localStorage.setItem(storageKey, mode);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }, [enableSystem, storageKey]);

  // 切换主题
  const toggleTheme = useCallback(() => {
    const modes: ThemeMode[] = enableSystem 
      ? ['light', 'dark', 'system']
      : ['light', 'dark'];
    
    const currentIndex = modes.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const nextMode = modes[nextIndex];
    
    setThemeMode(nextMode);
  }, [themeMode, enableSystem, setThemeMode]);

  // 计算主题状态
  const isDark = theme.mode === 'dark';
  const isLight = theme.mode === 'light';
  const isSystem = themeMode === 'system';

  // 添加强制主题类名（用于防止闪烁）
  useEffect(() => {
    const root = document.documentElement;
    
    // 移除所有主题类名
    root.classList.remove('light', 'dark', 'system');
    
    // 添加当前主题类名
    if (theme.mode) {
      root.classList.add(theme.mode);
    }
    
    // 添加过渡效果
    if (enableTransition) {
      root.classList.add('theme-transition');
      
      // 延迟移除过渡类名，避免影响性能
      const timer = setTimeout(() => {
        root.classList.remove('theme-transition');
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [theme.mode, enableTransition]);

  // 主题上下文值
  const contextValue: ThemeContextType = {
    theme,
    themeMode,
    setThemeMode,
    isDark,
    isLight,
    isSystem,
    toggleTheme,
    loading,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// 使用主题 Hook
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

// 主题切换按钮组件
export const ThemeToggle: React.FC<{
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'icon' | 'switch';
  showLabel?: boolean;
}> = ({ 
  className = '',
  size = 'md',
  variant = 'icon',
  showLabel = false,
}) => {
  const { themeMode, toggleTheme, isDark } = useTheme();
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };
  
  const getThemeIcon = () => {
    if (themeMode === 'system') {
      return (
        <svg className={sizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    }
    
    return isDark ? (
      <svg className={sizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ) : (
      <svg className={sizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    );
  };
  
  const getLabel = () => {
    switch (themeMode) {
      case 'dark':
        return '深色模式';
      case 'light':
        return '浅色模式';
      case 'system':
        return '系统主题';
      default:
        return '主题';
    }
  };
  
  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
        aria-label={`切换到${isDark ? '浅色' : '深色'}模式`}
        title={getLabel()}
      >
        {getThemeIcon()}
      </button>
    );
  }
  
  if (variant === 'switch') {
    return (
      <button
        onClick={toggleTheme}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isDark ? 'bg-blue-600' : 'bg-gray-200'
        } ${className}`}
        aria-label={`切换到${isDark ? '浅色' : '深色'}模式`}
        title={getLabel()}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isDark ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    );
  }
  
  return (
    <button
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${className}`}
      aria-label={`切换到${isDark ? '浅色' : '深色'}模式`}
      title={getLabel()}
    >
      {getThemeIcon()}
      {showLabel && <span className="text-sm">{getLabel()}</span>}
    </button>
  );
};

// 主题选择器组件
export const ThemeSelector: React.FC<{
  className?: string;
  showSystem?: boolean;
}> = ({ className = '', showSystem = true }) => {
  const { themeMode, setThemeMode } = useTheme();
  
  const themes = [
    { value: 'light' as ThemeMode, label: '浅色', icon: '☀️' },
    { value: 'dark' as ThemeMode, label: '深色', icon: '🌙' },
    ...(showSystem ? [{ value: 'system' as ThemeMode, label: '系统', icon: '🖥️' }] : []),
  ];
  
  return (
    <div className={`flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
      {themes.map((theme) => (
        <button
          key={theme.value}
          onClick={() => setThemeMode(theme.value)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            themeMode === theme.value
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
          aria-label={`切换到${theme.label}模式`}
          title={theme.label}
        >
          <span className="mr-1">{theme.icon}</span>
          {theme.label}
        </button>
      ))}
    </div>
  );
};

export default ThemeProvider;