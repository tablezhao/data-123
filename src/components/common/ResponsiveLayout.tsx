/**
 * 响应式布局组件 - 数据合规123导航网站
 * 
 * 提供响应式布局容器和组件，支持断点检测、条件渲染和响应式行为
 */

import React, { ReactNode, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  useResponsive, 
  useResponsiveValue, 
  Breakpoint, 
  DeviceType 
} from '@/hooks/use-responsive';

// 布局容器属性接口
interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  /**
   * 最大宽度断点
   */
  maxWidth?: Breakpoint | 'none';
  /**
   * 内边距断点配置
   */
  padding?: Partial<Record<Breakpoint, string>> | string;
  /**
   * 外边距断点配置
   */
  margin?: Partial<Record<Breakpoint, string>> | string;
  /**
   * 是否居中
   */
  centered?: boolean;
  /**
   * 是否全宽
   */
  fullWidth?: boolean;
  /**
   * 响应式可见性
   */
  visible?: Partial<Record<DeviceType, boolean>>;
  /**
   * 自定义样式
   */
  style?: React.CSSProperties;
}

/**
 * 响应式容器组件
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  maxWidth = 'xl',
  padding = 'p-4',
  margin,
  centered = true,
  fullWidth = false,
  visible,
  style,
}) => {
  const { deviceType } = useResponsive();
  
  // 检查可见性
  const isVisible = useMemo(() => {
    if (!visible) return true;
    return visible[deviceType] !== false;
  }, [visible, deviceType]);
  
  if (!isVisible) return null;
  
  // 响应式内边距
  const responsivePadding = useResponsiveValue(
    typeof padding === 'string' ? { xs: padding } : padding,
    'p-4'
  );
  
  // 响应式外边距
  const responsiveMargin = useResponsiveValue(
    typeof margin === 'string' ? { xs: margin } : margin,
    ''
  );
  
  // 最大宽度类名
  const maxWidthClass = useMemo(() => {
    if (fullWidth || maxWidth === 'none') return 'w-full';
    return `max-w-${maxWidth}`;
  }, [maxWidth, fullWidth]);
  
  const containerClasses = cn(
    'mx-auto',
    maxWidthClass,
    responsivePadding,
    responsiveMargin,
    {
      'mx-auto': centered && !fullWidth,
    },
    className
  );
  
  return (
    <div className={containerClasses} style={style}>
      {children}
    </div>
  );
};

// 响应式网格属性接口
interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  /**
   * 列数断点配置
   */
  columns?: Partial<Record<Breakpoint, number>>;
  /**
   * 间距断点配置
   */
  gap?: Partial<Record<Breakpoint, string>> | string;
  /**
   * 最小卡片宽度
   */
  minItemWidth?: string;
  /**
   * 是否自动适应
   */
  autoFit?: boolean;
  /**
   * 对齐方式
   */
  align?: 'start' | 'center' | 'end' | 'stretch';
}

/**
 * 响应式网格组件
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
  gap = 'gap-4',
  minItemWidth,
  autoFit = true,
  align = 'stretch',
}) => {
  // 响应式列数
  const responsiveColumns = useResponsiveValue(columns, 1);
  
  // 响应式间距
  const responsiveGap = useResponsiveValue(
    typeof gap === 'string' ? { xs: gap } : gap,
    'gap-4'
  );
  
  // 网格样式
  const gridStyle = useMemo(() => {
    if (autoFit && minItemWidth) {
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`,
        gap: responsiveGap.replace('gap-', ''),
        alignItems: align,
      } as React.CSSProperties;
    }
    
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${responsiveColumns}, minmax(0, 1fr))`,
      gap: responsiveGap.replace('gap-', ''),
      alignItems: align,
    } as React.CSSProperties;
  }, [responsiveColumns, responsiveGap, minItemWidth, autoFit, align]);
  
  const gridClasses = cn('w-full', className);
  
  return (
    <div className={gridClasses} style={gridStyle}>
      {children}
    </div>
  );
};

// 响应式弹性布局属性接口
interface ResponsiveFlexProps {
  children: ReactNode;
  className?: string;
  /**
   * 方向断点配置
   */
  direction?: Partial<Record<Breakpoint, 'row' | 'column'>>;
  /**
   * 换行断点配置
   */
  wrap?: Partial<Record<Breakpoint, boolean>>;
  /**
   * 主轴对齐
   */
  justify?: Partial<Record<Breakpoint, 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'>>;
  /**
   * 交叉轴对齐
   */
  align?: Partial<Record<Breakpoint, 'start' | 'center' | 'end' | 'stretch' | 'baseline'>>;
  /**
   * 间距断点配置
   */
  gap?: Partial<Record<Breakpoint, string>> | string;
}

/**
 * 响应式弹性布局组件
 */
export const ResponsiveFlex: React.FC<ResponsiveFlexProps> = ({
  children,
  className,
  direction = { xs: 'column', md: 'row' },
  wrap = { xs: true },
  justify = { xs: 'start' },
  align = { xs: 'stretch' },
  gap = 'gap-2',
}) => {
  // 响应式属性
  const responsiveDirection = useResponsiveValue(direction, 'row');
  const responsiveWrap = useResponsiveValue(wrap, false);
  const responsiveJustify = useResponsiveValue(justify, 'start');
  const responsiveAlign = useResponsiveValue(align, 'stretch');
  const responsiveGap = useResponsiveValue(
    typeof gap === 'string' ? { xs: gap } : gap,
    'gap-2'
  );
  
  // 生成类名
  const flexClasses = cn(
    'flex',
    {
      'flex-row': responsiveDirection === 'row',
      'flex-col': responsiveDirection === 'column',
      'flex-wrap': responsiveWrap,
      'flex-nowrap': !responsiveWrap,
      'justify-start': responsiveJustify === 'start',
      'justify-center': responsiveJustify === 'center',
      'justify-end': responsiveJustify === 'end',
      'justify-between': responsiveJustify === 'between',
      'justify-around': responsiveJustify === 'around',
      'justify-evenly': responsiveJustify === 'evenly',
      'items-start': responsiveAlign === 'start',
      'items-center': responsiveAlign === 'center',
      'items-end': responsiveAlign === 'end',
      'items-stretch': responsiveAlign === 'stretch',
      'items-baseline': responsiveAlign === 'baseline',
    },
    responsiveGap,
    className
  );
  
  return (
    <div className={flexClasses}>
      {children}
    </div>
  );
};

// 条件渲染属性接口
interface ResponsiveShowProps {
  children: ReactNode;
  /**
   * 在哪些断点显示
   */
  when: Breakpoint | Breakpoint[] | DeviceType | DeviceType[];
  /**
   * 是否取反（隐藏而不是显示）
   */
  inverse?: boolean;
  /**
   * 自定义渲染函数
   */
  render?: (isVisible: boolean, currentBreakpoint: Breakpoint, currentDevice: DeviceType) => ReactNode;
}

/**
 * 条件渲染组件
 */
export const ResponsiveShow: React.FC<ResponsiveShowProps> = ({
  children,
  when,
  inverse = false,
  render,
}) => {
  const { breakpoint, deviceType } = useResponsive();
  
  // 检查是否应该显示
  const shouldShow = useMemo(() => {
    const conditions = Array.isArray(when) ? when : [when];
    
    return conditions.some(condition => {
      // 断点检查
      if (['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'].includes(condition as Breakpoint)) {
        const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
        const currentIndex = breakpoints.indexOf(breakpoint);
        const targetIndex = breakpoints.indexOf(condition as Breakpoint);
        return currentIndex >= targetIndex;
      }
      
      // 设备类型检查
      return deviceType === condition;
    });
  }, [when, breakpoint, deviceType]);
  
  const isVisible = inverse ? !shouldShow : shouldShow;
  
  // 自定义渲染
  if (render) {
    return <>{render(isVisible, breakpoint, deviceType)}</>;
  }
  
  return isVisible ? <>{children}</> : null;
};

// 响应式文本属性接口
interface ResponsiveTextProps {
  children: ReactNode;
  className?: string;
  /**
   * 字体大小断点配置
   */
  size?: Partial<Record<Breakpoint, 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'>>;
  /**
   * 字重断点配置
   */
  weight?: Partial<Record<Breakpoint, 'light' | 'normal' | 'medium' | 'semibold' | 'bold'>>;
  /**
   * 行高断点配置
   */
  leading?: Partial<Record<Breakpoint, 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose'>>;
  /**
   * 对齐方式断点配置
   */
  align?: Partial<Record<Breakpoint, 'left' | 'center' | 'right' | 'justify'>>;
  /**
   * 颜色断点配置
   */
  color?: Partial<Record<Breakpoint, string>>;
  /**
   * 截断配置
   */
  truncate?: Partial<Record<Breakpoint, boolean>>;
  /**
   * 元素类型
   */
  as?: React.ElementType;
}

/**
 * 响应式文本组件
 */
export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  className,
  size = { xs: 'base' },
  weight = { xs: 'normal' },
  leading = { xs: 'normal' },
  align = { xs: 'left' },
  color,
  truncate = { xs: false },
  as: Component = 'span',
}) => {
  // 响应式属性
  const responsiveSize = useResponsiveValue(size, 'base');
  const responsiveWeight = useResponsiveValue(weight, 'normal');
  const responsiveLeading = useResponsiveValue(leading, 'normal');
  const responsiveAlign = useResponsiveValue(align, 'left');
  const responsiveColor = useResponsiveValue(color, undefined);
  const responsiveTruncate = useResponsiveValue(truncate, false);
  
  // 生成类名
  const textClasses = cn(
    {
      'text-xs': responsiveSize === 'xs',
      'text-sm': responsiveSize === 'sm',
      'text-base': responsiveSize === 'base',
      'text-lg': responsiveSize === 'lg',
      'text-xl': responsiveSize === 'xl',
      'text-2xl': responsiveSize === '2xl',
      'text-3xl': responsiveSize === '3xl',
      'text-4xl': responsiveSize === '4xl',
      'font-light': responsiveWeight === 'light',
      'font-normal': responsiveWeight === 'normal',
      'font-medium': responsiveWeight === 'medium',
      'font-semibold': responsiveWeight === 'semibold',
      'font-bold': responsiveWeight === 'bold',
      'leading-none': responsiveLeading === 'none',
      'leading-tight': responsiveLeading === 'tight',
      'leading-snug': responsiveLeading === 'snug',
      'leading-normal': responsiveLeading === 'normal',
      'leading-relaxed': responsiveLeading === 'relaxed',
      'leading-loose': responsiveLeading === 'loose',
      'text-left': responsiveAlign === 'left',
      'text-center': responsiveAlign === 'center',
      'text-right': responsiveAlign === 'right',
      'text-justify': responsiveAlign === 'justify',
      'truncate': responsiveTruncate,
    },
    responsiveColor,
    className
  );
  
  return (
    <Component className={textClasses}>
      {children}
    </Component>
  );
};

// 响应式图片属性接口
interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  /**
   * 图片尺寸断点配置
   */
  sizes?: Partial<Record<Breakpoint, string>>;
  /**
   * 是否懒加载
   */
  lazy?: boolean;
  /**
   * 加载占位符
   */
  placeholder?: 'blur' | 'empty';
  /**
   * 优先级
   */
  priority?: boolean;
  /**
   * 加载失败时的备用图片
   */
  fallbackSrc?: string;
  /**
   * 加载失败时的处理函数
   */
  onError?: () => void;
}

/**
 * 响应式图片组件
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className,
  sizes = { xs: '100vw', md: '50vw', lg: '33vw' },
  lazy = true,
  placeholder = 'empty',
  priority = false,
  fallbackSrc,
  onError,
}) => {
  const { breakpoint } = useResponsive();
  
  // 响应式尺寸
  const responsiveSize = useResponsiveValue(sizes, '100vw');
  
  // 处理加载错误
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (fallbackSrc) {
      e.currentTarget.src = fallbackSrc;
    }
    onError?.();
  };
  
  return (
    <img
      src={src}
      alt={alt}
      className={cn('w-full h-auto object-cover', className)}
      sizes={responsiveSize}
      loading={priority ? 'eager' : lazy ? 'lazy' : 'eager'}
      decoding={priority ? 'sync' : 'async'}
      onError={handleImageError}
    />
  );
};

// 响应式导航属性接口
interface ResponsiveNavProps {
  children: ReactNode;
  className?: string;
  /**
   * 移动端断点
   */
  mobileBreakpoint?: Breakpoint;
  /**
   * 是否启用移动端菜单
   */
  enableMobileMenu?: boolean;
  /**
   * 移动端菜单触发器
   */
  mobileTrigger?: ReactNode;
}

/**
 * 响应式导航组件
 */
export const ResponsiveNav: React.FC<ResponsiveNavProps> = ({
  children,
  className,
  mobileBreakpoint = 'md',
  enableMobileMenu = true,
  mobileTrigger,
}) => {
  const { breakpoint } = useResponsive();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
  const currentIndex = breakpoints.indexOf(breakpoint);
  const mobileIndex = breakpoints.indexOf(mobileBreakpoint);
  const isMobileView = currentIndex < mobileIndex;
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  if (!enableMobileMenu || !isMobileView) {
    return (
      <nav className={cn('flex items-center space-x-4', className)}>
        {children}
      </nav>
    );
  }
  
  return (
    <nav className={cn('relative', className)}>
      {/* 移动端触发器 */}
      {mobileTrigger ? (
        <button onClick={toggleMobileMenu} className="md:hidden">
          {mobileTrigger}
        </button>
      ) : (
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="切换菜单"
          aria-expanded={isMobileMenuOpen}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      )}
      
      {/* 导航内容 */}
      <div className={cn(
        'md:flex md:items-center md:space-x-4',
        {
          'hidden': !isMobileMenuOpen,
          'absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-lg rounded-md p-4 mt-2': isMobileMenuOpen,
        }
      )}>
        {children}
      </div>
    </nav>
  );
};

export default {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveFlex,
  ResponsiveShow,
  ResponsiveText,
  ResponsiveImage,
  ResponsiveNav,
};
