/**
 * 增强卡片组件 - 数据合规123导航网站
 * 
 * 基于设计系统重构的卡片组件，支持多种变体和交互状态
 * 集成无障碍访问、响应式设计和主题支持
 */

import React, { forwardRef, useMemo, useState, useEffect, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { designSystem, a11yTokens } from '@/lib/design-tokens';
import EnhancedButton from './EnhancedButton';
import { useComponentAccessibility } from '@/lib/accessibility/hooks';

// 卡片变体配置
const cardVariants = cva(
  [
    'relative overflow-hidden',
    'bg-[var(--color-background-elevated)]',
    'border border-[var(--color-border-light)]',
    'rounded-lg',
    'transition-all duration-200 ease-out',
    'hover:shadow-md',
    'focus-within:ring-2 focus-within:ring-[var(--color-primary-500)]',
    'touch-target', // 无障碍触摸目标
  ],
  {
    variants: {
      variant: {
        // 默认卡片 - 标准样式
        default: [
          'hover:border-[var(--color-border-medium)]',
          'hover:scale-[1.01]',
        ],
        
        //  elevated卡片 - 突出显示
        elevated: [
          'shadow-lg',
          'hover:shadow-xl',
          'hover:scale-[1.02]',
        ],
        
        // 边框卡片 - 强调边框
        outlined: [
          'border-2 border-[var(--color-primary-200)]',
          'hover:border-[var(--color-primary-500)]',
        ],
        
        // 幽灵卡片 - 最小化视觉权重
        ghost: [
          'border-transparent bg-transparent',
          'hover:bg-[var(--color-gray-50)]',
          'hover:border-[var(--color-border-light)]',
        ],
        
        // 交互卡片 - 可点击状态
        interactive: [
          'cursor-pointer',
          'hover:bg-[var(--color-primary-50)]',
          'hover:border-[var(--color-primary-200)]',
          'active:scale-[0.98]',
        ],
        
        // 成功卡片 - 正面反馈
        success: [
          'border-[var(--color-success-200)]',
          'bg-[var(--color-success-50)]',
          'hover:border-[var(--color-success-300)]',
        ],
        
        // 警告卡片 - 注意信息
        warning: [
          'border-[var(--color-warning-200)]',
          'bg-[var(--color-warning-50)]',
          'hover:border-[var(--color-warning-300)]',
        ],
        
        // 错误卡片 - 负面反馈
        error: [
          'border-[var(--color-error-200)]',
          'bg-[var(--color-error-50)]',
          'hover:border-[var(--color-error-300)]',
        ],
      },
      
      // 卡片尺寸
      size: {
        xs: [
          'p-2',
          'text-sm',
        ],
        sm: [
          'p-3',
          'text-sm',
        ],
        md: [
          'p-4',
          'text-base',
        ],
        lg: [
          'p-6',
          'text-lg',
        ],
        xl: [
          'p-8',
          'text-xl',
        ],
      },
      
      // 圆角样式
      radius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full',
      },
      
      // 阴影强度
      shadow: {
        none: 'shadow-none',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl',
      },
      
      // 悬停效果
      hover: {
        none: '',
        scale: 'hover:scale-[1.02]',
        lift: 'hover:-translate-y-1',
        glow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]',
      },
      
      // 响应式断点
      responsive: {
        default: '',
        'mobile-only': 'md:hidden',
        'desktop-only': 'max-md:hidden',
      },
    },
    
    defaultVariants: {
      variant: 'default',
      size: 'md',
      radius: 'lg',
      shadow: 'none',
      hover: 'none',
      responsive: 'default',
    },
  }
);

// 卡片属性接口
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  // 交互状态
  interactive?: boolean;
  
  // 可点击
  clickable?: boolean;
  
  // 加载状态
  loading?: boolean;
  
  // 选中状态
  selected?: boolean;
  
  // 禁用状态
  disabled?: boolean;
  
  // 头部内容
  header?: React.ReactNode;
  
  // 底部内容
  footer?: React.ReactNode;
  
  // 媒体内容
  media?: React.ReactNode;
  
  // 操作按钮
  actions?: React.ReactNode;
  
  // 徽章/标签
  badge?: React.ReactNode;
  
  // 链接地址
  href?: string;
  
  // 目标窗口
  target?: string;
  
  // 点击处理
  onCardClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  
  // 键盘导航
  keyboardAccessible?: boolean;
  
  // ARIA标签
  ariaLabel?: string;
  
  // 自定义样式
  className?: string;
  
  // 无障碍测试选项
  enableAccessibilityTesting?: boolean;
  
  // 对比度要求 (默认: 4.5:1)
  contrastRatio?: number;
  
  // 无障碍测试回调
  onAccessibilityViolation?: (violations: any[]) => void;
}

// 增强卡片组件
const EnhancedCard = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      size,
      radius,
      shadow,
      hover,
      responsive,
      interactive = false,
      clickable = false,
      loading,
      selected,
      disabled,
      header,
      footer,
      media,
      actions,
      badge,
      href,
      target,
      children,
      onCardClick,
      keyboardAccessible = true,
      ariaLabel,
      enableAccessibilityTesting = false,
      contrastRatio = 4.5,
      onAccessibilityViolation,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    // 无障碍测试集成
    const cardRef = useRef<HTMLDivElement>(null);
    const elementRef = ref || cardRef;
    
    // 集成无障碍测试
    const {
      elementRef: accessibilityRef,
      violations,
      isTesting,
      testComponent,
      hasViolations,
      contrastTest,
      navigationTest,
      screenReaderTest
    } = useComponentAccessibility<HTMLDivElement>();

    // 交互状态处理
    const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
      if (!disabled) {
        setIsHovered(true);
      }
      props.onMouseEnter?.(event);
    };

    const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
      setIsHovered(false);
      props.onMouseLeave?.(event);
    };

    const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
      if (!disabled) {
        setIsFocused(true);
      }
      props.onFocus?.(event);
    };

    const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
      setIsFocused(false);
      props.onBlur?.(event);
    };

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (!disabled && (clickable || interactive)) {
        onCardClick?.(event);
        
        // 处理链接跳转
        if (href && !event.defaultPrevented) {
          if (target === '_blank') {
            window.open(href, '_blank', 'noopener,noreferrer');
          } else {
            window.location.href = href;
          }
        }
      }
      props.onClick?.(event);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (keyboardAccessible && !disabled && (clickable || interactive)) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleClick(event as any);
        }
      }
      props.onKeyDown?.(event);
    };

    // 确定卡片变体
    const cardVariant = useMemo(() => {
      if (interactive || clickable) return 'interactive';
      return variant;
    }, [interactive, clickable, variant]);

    // 确定卡片样式
    const cardClasses = useMemo(() => {
      return cn(
        cardVariants({
          variant: cardVariant,
          size,
          radius,
          shadow,
          hover,
          responsive,
        }),
        {
          'ring-2 ring-[var(--color-primary-500)]': selected,
          'opacity-50 cursor-not-allowed': disabled,
          'cursor-pointer': clickable || interactive,
          'animate-pulse': loading,
          // 无障碍测试状态样式
          'ring-2 ring-red-500 ring-opacity-50': enableAccessibilityTesting && hasViolations,
          'animate-pulse': enableAccessibilityTesting && isTesting,
        },
        className
      );
    }, [cardVariant, size, radius, shadow, hover, responsive, selected, disabled, loading, clickable, interactive, className, enableAccessibilityTesting, hasViolations, isTesting]);

    // 无障碍测试效果
    useEffect(() => {
      if (enableAccessibilityTesting && elementRef.current) {
        testComponent().then(result => {
          if (result?.hasViolations && onAccessibilityViolation) {
            onAccessibilityViolation(result.violations);
          }
        });
      }
    }, [enableAccessibilityTesting, testComponent, onAccessibilityViolation]);

    // ARIA属性
    const ariaProps = {
      'aria-label': ariaLabel,
      'aria-selected': selected,
      'aria-disabled': disabled,
      'aria-busy': loading,
      'role': clickable || interactive ? 'button' : undefined,
      'tabIndex': clickable || interactive ? (disabled ? -1 : 0) : undefined,
    };

    return (
      <div
        ref={elementRef as any}
        className={cardClasses}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        // 无障碍测试属性
        data-a11y-testing={enableAccessibilityTesting}
        data-a11y-violations={enableAccessibilityTesting ? violations.length : undefined}
        {...ariaProps}
        {...props}
      >
        {/* 徽章/标签 */}
        {badge && (
          <div className="absolute top-2 right-2 z-10">
            {badge}
          </div>
        )}

        {/* 媒体内容 */}
        {media && (
          <div className="relative w-full overflow-hidden">
            {media}
          </div>
        )}

        {/* 头部内容 */}
        {header && (
          <div className="border-b border-[var(--color-border-light)] pb-3 mb-3">
            {header}
          </div>
        )}

        {/* 主要内容 */}
        <div className="flex-1">
          {loading ? (
            <div className="space-y-2">
              <div className="h-4 bg-[var(--color-gray-200)] rounded animate-pulse"></div>
              <div className="h-4 bg-[var(--color-gray-200)] rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-[var(--color-gray-200)] rounded w-1/2 animate-pulse"></div>
            </div>
          ) : (
            children
          )}
        </div>

        {/* 操作按钮 */}
        {actions && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border-light)]">
            {actions}
          </div>
        )}

        {/* 底部内容 */}
        {footer && (
          <div className="mt-3 pt-3 border-t border-[var(--color-border-light)]">
            {footer}
          </div>
        )}

        {/* 加载遮罩 */}
        {loading && (
          <div className="absolute inset-0 bg-[var(--color-background-primary)] bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary-500)]"></div>
          </div>
        )}
        
        {/* 无障碍测试指示器 */}
        {enableAccessibilityTesting && hasViolations && (
          <div className="absolute top-2 left-2 z-20">
            <span 
              className="w-3 h-3 bg-red-500 rounded-full animate-pulse block" 
              aria-label={`发现 ${violations.length} 个无障碍问题`}
              title={`发现 ${violations.length} 个无障碍问题`}
            />
          </div>
        )}
        
        {enableAccessibilityTesting && isTesting && (
          <div className="absolute top-2 left-2 z-20">
            <span 
              className="w-3 h-3 bg-blue-500 rounded-full animate-pulse block" 
              aria-label="无障碍测试中..."
              title="无障碍测试中..."
            />
          </div>
        )}
      </div>
    );
  }
);

EnhancedCard.displayName = 'EnhancedCard';

export default EnhancedCard;