/**
 * 增强按钮组件 - 数据合规123导航网站
 * 
 * 基于设计系统重构的按钮组件，支持多种变体、尺寸和状态
 * 集成无障碍访问、响应式设计和主题支持
 */

import React, { forwardRef, useMemo, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { designSystem, a11yTokens } from '@/lib/design-tokens';
import { useComponentAccessibility } from '@/lib/accessibility/hooks';

// 按钮变体配置
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center',
    'font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'rounded-md text-sm',
    'touch-target', // 无障碍触摸目标
  ],
  {
    variants: {
      variant: {
        // 主要按钮 - 用于主要操作
        primary: [
          'bg-[var(--color-primary-500)] text-white',
          'hover:bg-[var(--color-primary-600)]',
          'focus-visible:ring-[var(--color-primary-500)]',
          'active:bg-[var(--color-primary-700)]',
          'shadow-md hover:shadow-lg',
        ],
        
        // 次要按钮 - 用于次要操作
        secondary: [
          'bg-[var(--color-gray-100)] text-[var(--color-gray-900)]',
          'hover:bg-[var(--color-gray-200)]',
          'focus-visible:ring-[var(--color-gray-500)]',
          'active:bg-[var(--color-gray-300)]',
          'border border-[var(--color-gray-300)]',
        ],
        
        // 轮廓按钮 - 用于辅助操作
        outline: [
          'bg-transparent text-[var(--color-primary-600)]',
          'border-2 border-[var(--color-primary-600)]',
          'hover:bg-[var(--color-primary-50)]',
          'focus-visible:ring-[var(--color-primary-500)]',
          'active:bg-[var(--color-primary-100)]',
        ],
        
        // 幽灵按钮 - 最小化视觉权重
        ghost: [
          'bg-transparent text-[var(--color-gray-700)]',
          'hover:bg-[var(--color-gray-100)]',
          'hover:text-[var(--color-gray-900)]',
          'focus-visible:ring-[var(--color-gray-500)]',
          'active:bg-[var(--color-gray-200)]',
        ],
        
        // 危险按钮 - 用于破坏性操作
        destructive: [
          'bg-[var(--color-error-500)] text-white',
          'hover:bg-[var(--color-error-600)]',
          'focus-visible:ring-[var(--color-error-500)]',
          'active:bg-[var(--color-error-700)]',
          'shadow-md hover:shadow-lg',
        ],
        
        // 成功按钮 - 用于确认操作
        success: [
          'bg-[var(--color-success-500)] text-white',
          'hover:bg-[var(--color-success-600)]',
          'focus-visible:ring-[var(--color-success-500)]',
          'active:bg-[var(--color-success-700)]',
          'shadow-md hover:shadow-lg',
        ],
        
        // 链接按钮 - 文本样式按钮
        link: [
          'bg-transparent text-[var(--color-primary-600)]',
          'hover:text-[var(--color-primary-700)]',
          'hover:underline',
          'focus-visible:ring-[var(--color-primary-500)]',
          'underline-offset-4',
        ],
      },
      
      size: {
        // 超小尺寸 - 用于紧凑空间
        xs: [
          'h-7 px-2',
          'text-xs',
          'rounded-sm',
        ],
        
        // 小尺寸 - 用于次要操作
        sm: [
          'h-8 px-3',
          'text-sm',
          'rounded-md',
        ],
        
        // 默认尺寸 - 标准按钮
        md: [
          'h-10 px-4',
          'text-sm',
          'rounded-md',
        ],
        
        // 大尺寸 - 用于重要操作
        lg: [
          'h-12 px-6',
          'text-base',
          'rounded-lg',
        ],
        
        // 超大尺寸 - 用于主要CTA
        xl: [
          'h-14 px-8',
          'text-lg',
          'rounded-lg',
        ],
      },
      
      // 按钮状态
      state: {
        default: '',
        loading: [
          'cursor-wait',
          'opacity-75',
        ],
        disabled: [
          'cursor-not-allowed',
          'opacity-50',
        ],
      },
      
      // 按钮形状
      shape: {
        default: 'rounded-md',
        square: 'rounded-none',
        pill: 'rounded-full',
        circle: 'rounded-full aspect-square',
      },
      
      // 响应式可见性
      responsive: {
        default: '',
        'mobile-only': 'md:hidden',
        'desktop-only': 'max-md:hidden',
      },
    },
    
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      state: 'default',
      shape: 'default',
      responsive: 'default',
    },
  }
);

// 按钮属性接口
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  // 加载状态
  loading?: boolean;
  
  // 图标支持
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  
  // 无障碍标签
  ariaLabel?: string;
  
  // 键盘快捷键
  shortcut?: string;
  
  // 触摸反馈
  touchFeedback?: boolean;
  
  // 动画效果
  animate?: boolean;
  
  // 响应式断点
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  // 自定义样式
  className?: string;
  
  // 无障碍测试选项
  enableAccessibilityTesting?: boolean;
  
  // 对比度要求 (默认: 4.5:1)
  contrastRatio?: number;
  
  // 无障碍测试回调
  onAccessibilityViolation?: (violations: any[]) => void;
}

// 增强按钮组件
const EnhancedButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      state,
      shape,
      responsive,
      loading,
      leftIcon,
      rightIcon,
      ariaLabel,
      shortcut,
      touchFeedback = true,
      animate = true,
      breakpoint,
      children,
      disabled,
      enableAccessibilityTesting = false,
      contrastRatio = 4.5,
      onAccessibilityViolation,
      onClick,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    // 无障碍测试集成
    const buttonRef = useRef<HTMLButtonElement>(null);
    const elementRef = ref || buttonRef;
    
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
    } = useComponentAccessibility<HTMLButtonElement>();

    // 状态管理
    const buttonState = useMemo(() => {
      if (loading) return 'loading';
      if (disabled) return 'disabled';
      return state;
    }, [loading, disabled, state]);

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

    // 键盘快捷键处理
    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (shortcut) {
        const keys = shortcut.toLowerCase().split('+');
        const isMatch = keys.every((key) => {
          switch (key) {
            case 'ctrl':
            case 'cmd':
              return event.ctrlKey || event.metaKey;
            case 'alt':
              return event.altKey;
            case 'shift':
              return event.shiftKey;
            default:
              return event.key.toLowerCase() === key;
          }
        });
        
        if (isMatch) {
          event.preventDefault();
          onClick?.(event as any);
        }
      }
      
      onKeyDown?.(event);
    };

    // 触摸反馈处理
    const handleTouchStart = (event: React.TouchEvent<HTMLButtonElement>) => {
      if (touchFeedback) {
        const button = event.currentTarget;
        button.style.transform = 'scale(0.98)';
        button.style.transition = 'transform 0.1s ease-out';
        
        const resetTransform = () => {
          button.style.transform = '';
        };
        
        setTimeout(resetTransform, 100);
      }
    };

    // 动画类名
    const animationClass = animate ? 'transition-all duration-200 ease-out' : '';

    return (
      <button
        ref={elementRef as any}
        className={cn(
          buttonVariants({
            variant,
            size,
            state: buttonState,
            shape,
            responsive,
          }),
          animationClass,
          className,
          // 无障碍测试状态样式
          enableAccessibilityTesting && hasViolations && 'ring-2 ring-red-500 ring-opacity-50',
          enableAccessibilityTesting && isTesting && 'animate-pulse'
        )}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        aria-busy={loading}
        aria-disabled={disabled}
        // 无障碍测试属性
        data-a11y-testing={enableAccessibilityTesting}
        data-a11y-violations={enableAccessibilityTesting ? violations.length : undefined}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        {...props}
      >
        {/* 左侧图标 */}
        {leftIcon && !loading && (
          <span className="mr-2 flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        
        {/* 加载状态指示器 */}
        {loading && (
          <span className="mr-2 flex-shrink-0" aria-hidden="true">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}
        
        {/* 按钮文本 */}
        <span className="flex-grow text-center">
          {children}
        </span>
        
        {/* 右侧图标 */}
        {rightIcon && !loading && (
          <span className="ml-2 flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
        
        {/* 键盘快捷键提示 */}
        {shortcut && (
          <span className="ml-2 text-xs opacity-60" aria-hidden="true">
            {shortcut}
          </span>
        )}
        
        {/* 无障碍测试指示器 */}
        {enableAccessibilityTesting && hasViolations && (
          <span 
            className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" 
            aria-label={`发现 ${violations.length} 个无障碍问题`}
            title={`发现 ${violations.length} 个无障碍问题`}
          />
        )}
        
        {enableAccessibilityTesting && isTesting && (
          <span 
            className="ml-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" 
            aria-label="无障碍测试中..."
            title="无障碍测试中..."
          />
        )}
      </button>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';

export default EnhancedButton;