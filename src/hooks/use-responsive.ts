/**
 * 响应式Hook - 数据合规123导航网站
 * 
 * 提供响应式断点检测、设备类型识别和响应式行为控制
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { breakpointTokens } from '@/lib/design-tokens';

// 响应式断点类型
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

// 设备类型
export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'wide';

// 响应式状态接口
export interface ResponsiveState {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  isTouch: boolean;
  supportsHover: boolean;
}

// 响应式配置接口
export interface ResponsiveConfig {
  debounceMs?: number;
  updateOnResize?: boolean;
  updateOnOrientationChange?: boolean;
  breakpoints?: Partial<Record<Breakpoint, number>>;
}

// 默认断点配置
const defaultBreakpoints: Record<Breakpoint, number> = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
};

// 设备类型映射
const deviceTypeMap: Record<Breakpoint, DeviceType> = {
  xs: 'mobile',
  sm: 'mobile',
  md: 'tablet',
  lg: 'desktop',
  xl: 'desktop',
  '2xl': 'wide',
  '3xl': 'wide',
};

/**
 * 获取当前断点
 */
function getCurrentBreakpoint(width: number, breakpoints: Record<Breakpoint, number>): Breakpoint {
  if (width >= breakpoints['3xl']) return '3xl';
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
}

/**
 * 检测触摸设备
 */
function detectTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

/**
 * 检测悬停支持
 */
function detectHoverSupport(): boolean {
  if (typeof window === 'undefined') return true;
  
  return window.matchMedia('(hover: hover)').matches;
}

/**
 * 防抖函数
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | undefined;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      if (timeout !== undefined) {
        window.clearTimeout(timeout);
      }
      func(...args);
    };
    
    if (timeout !== undefined) {
      window.clearTimeout(timeout);
    }
    timeout = window.setTimeout(later, wait);
  };
}

/**
 * 主要响应式Hook
 */
export function useResponsive(config: ResponsiveConfig = {}): ResponsiveState {
  const {
    debounceMs = 100,
    updateOnResize = true,
    updateOnOrientationChange = true,
    breakpoints: customBreakpoints,
  } = config;

  // 合并断点配置
  const breakpoints = useMemo(
    () => ({ ...defaultBreakpoints, ...customBreakpoints }),
    [customBreakpoints]
  );

  // 初始状态
  const [state, setState] = useState<ResponsiveState>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        breakpoint: 'lg',
        deviceType: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isWide: false,
        isPortrait: true,
        isLandscape: false,
        isTouch: false,
        supportsHover: true,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const breakpoint = getCurrentBreakpoint(width, breakpoints);
    const deviceType = deviceTypeMap[breakpoint];

    return {
      width,
      height,
      breakpoint,
      deviceType,
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop' || deviceType === 'wide',
      isWide: deviceType === 'wide',
      isPortrait: height > width,
      isLandscape: width > height,
      isTouch: detectTouchDevice(),
      supportsHover: detectHoverSupport(),
    };
  });

  // 更新响应式状态
  const updateState = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const breakpoint = getCurrentBreakpoint(width, breakpoints);
    const deviceType = deviceTypeMap[breakpoint];

    setState({
      width,
      height,
      breakpoint,
      deviceType,
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop' || deviceType === 'wide',
      isWide: deviceType === 'wide',
      isPortrait: height > width,
      isLandscape: width > height,
      isTouch: detectTouchDevice(),
      supportsHover: detectHoverSupport(),
    });
  }, [breakpoints]);

  // 防抖更新
  const debouncedUpdate = useMemo(
    () => debounce(updateState, debounceMs),
    [updateState, debounceMs]
  );

  // 监听窗口变化
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (updateOnResize) {
      window.addEventListener('resize', debouncedUpdate);
    }

    if (updateOnOrientationChange) {
      window.addEventListener('orientationchange', updateState);
    }

    return () => {
      if (updateOnResize) {
        window.removeEventListener('resize', debouncedUpdate);
      }
      
      if (updateOnOrientationChange) {
        window.removeEventListener('orientationchange', updateState);
      }
    };
  }, [debouncedUpdate, updateState, updateOnResize, updateOnOrientationChange]);

  return state;
}

/**
 * 移动端检测Hook
 */
export function useMobile(): boolean {
  const { isMobile } = useResponsive();
  return isMobile;
}

/**
 * 平板检测Hook
 */
export function useTablet(): boolean {
  const { isTablet } = useResponsive();
  return isTablet;
}

/**
 * 桌面检测Hook
 */
export function useDesktop(): boolean {
  const { isDesktop } = useResponsive();
  return isDesktop;
}

/**
 * 断点检测Hook
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const { breakpoint: currentBreakpoint } = useResponsive();
  
  const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
  const currentIndex = breakpoints.indexOf(currentBreakpoint);
  const targetIndex = breakpoints.indexOf(breakpoint);
  
  return currentIndex >= targetIndex;
}

/**
 * 响应式值Hook - 根据断点返回不同值
 */
export function useResponsiveValue<T>(
  values: Partial<Record<Breakpoint, T>> | T[],
  defaultValue?: T
): T {
  const { breakpoint } = useResponsive();
  
  if (Array.isArray(values)) {
    const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
    const currentIndex = breakpoints.indexOf(breakpoint);
    
    // 从当前断点开始向前查找匹配的值
    for (let i = currentIndex; i >= 0; i--) {
      if (values[i] !== undefined) {
        return values[i];
      }
    }
    
    return defaultValue ?? values[values.length - 1];
  }
  
  // 对象形式
  const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
  const currentIndex = breakpoints.indexOf(breakpoint);
  
  // 从当前断点开始向前查找匹配的值
  for (let i = currentIndex; i >= 0; i--) {
    const key = breakpoints[i];
    if (values[key] !== undefined) {
      return values[key]!;
    }
  }
  
  return defaultValue ?? (values as any)[breakpoints[0]];
}

/**
 * 触摸设备检测Hook
 */
export function useTouchDevice(): boolean {
  const { isTouch } = useResponsive();
  return isTouch;
}

/**
 * 悬停支持检测Hook
 */
export function useHoverSupport(): boolean {
  const { supportsHover } = useResponsive();
  return supportsHover;
}

/**
 * 方向检测Hook
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const { isPortrait, isLandscape } = useResponsive();
  return isPortrait ? 'portrait' : 'landscape';
}

/**
 * 响应式媒体查询Hook
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQuery.matches);

    handleChange(); // 初始检查
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * 响应式工具函数
 */
export const responsiveUtils = {
  /**
   * 检查是否在指定断点范围内
   */
  isInRange: (min: Breakpoint, max: Breakpoint, current: Breakpoint): boolean => {
    const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
    const minIndex = breakpoints.indexOf(min);
    const maxIndex = breakpoints.indexOf(max);
    const currentIndex = breakpoints.indexOf(current);
    
    return currentIndex >= minIndex && currentIndex <= maxIndex;
  },

  /**
   * 获取断点数值
   */
  getBreakpointValue: (breakpoint: Breakpoint): number => {
    return defaultBreakpoints[breakpoint];
  },

  /**
   * 比较两个断点
   */
  compareBreakpoints: (a: Breakpoint, b: Breakpoint): number => {
    const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
    return breakpoints.indexOf(a) - breakpoints.indexOf(b);
  },

  /**
   * 获取下一个更大的断点
   */
  getNextBreakpoint: (current: Breakpoint): Breakpoint | null => {
    const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
    const currentIndex = breakpoints.indexOf(current);
    return breakpoints[currentIndex + 1] || null;
  },

  /**
   * 获取上一个更小的断点
   */
  getPreviousBreakpoint: (current: Breakpoint): Breakpoint | null => {
    const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
    const currentIndex = breakpoints.indexOf(current);
    return breakpoints[currentIndex - 1] || null;
  },
};

export default {
  useResponsive,
  useMobile,
  useTablet,
  useDesktop,
  useBreakpoint,
  useResponsiveValue,
  useTouchDevice,
  useHoverSupport,
  useOrientation,
  useMediaQuery,
  responsiveUtils,
};
