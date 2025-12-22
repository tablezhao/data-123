/**
 * 增强输入框组件 - 数据合规123导航网站
 * 
 * 基于设计系统重构的输入框组件，支持多种类型、验证状态和交互
 * 集成无障碍访问、响应式设计和主题支持
 */

import React, { forwardRef, useState, useMemo, useEffect, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// 输入框变体配置
const inputVariants = cva(
  [
    'block w-full',
    'bg-[var(--color-background-elevated)]',
    'text-[var(--color-text-primary)]',
    'border border-[var(--color-border-medium)]',
    'rounded-md',
    'px-3 py-2',
    'text-sm',
    'placeholder-[var(--color-text-tertiary)]',
    'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]',
    'focus:border-[var(--color-primary-500)]',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'read-only:bg-[var(--color-gray-50)] read-only:border-[var(--color-border-light)]',
    'transition-colors duration-200',
    'touch-target', // 无障碍触摸目标
  ],
  {
    variants: {
      inputType: {
        text: '',
        password: '',
        email: '',
        number: '',
        tel: '',
        url: '',
        search: '',
        date: '',
        time: '',
        datetime: '',
        color: 'h-10 p-1',
        file: 'file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[var(--color-primary-100)] file:text-[var(--color-primary-700)] hover:file:bg-[var(--color-primary-200)]',
      },
      
      // 输入框尺寸
      size: {
        xs: [
          'h-7 px-2',
          'text-xs',
          'rounded-sm',
        ],
        sm: [
          'h-8 px-3',
          'text-sm',
          'rounded-md',
        ],
        md: [
          'h-10 px-4',
          'text-sm',
          'rounded-md',
        ],
        lg: [
          'h-12 px-6',
          'text-base',
          'rounded-lg',
        ],
        xl: [
          'h-14 px-8',
          'text-lg',
          'rounded-lg',
        ],
      },
      
      // 验证状态
      validation: {
        none: '',
        valid: [
          'border-[var(--color-success-500)]',
          'focus:ring-[var(--color-success-500)]',
          'focus:border-[var(--color-success-500)]',
        ],
        invalid: [
          'border-[var(--color-error-500)]',
          'focus:ring-[var(--color-error-500)]',
          'focus:border-[var(--color-error-500)]',
        ],
        warning: [
          'border-[var(--color-warning-500)]',
          'focus:ring-[var(--color-warning-500)]',
          'focus:border-[var(--color-warning-500)]',
        ],
      },
      
      // 输入框状态
      state: {
        default: '',
        loading: [
          'animate-pulse',
          'bg-[var(--color-gray-50)]',
        ],
        disabled: [
          'cursor-not-allowed',
          'opacity-50',
          'bg-[var(--color-gray-50)]',
        ],
        readonly: [
          'cursor-default',
          'bg-[var(--color-gray-50)]',
          'border-[var(--color-border-light)]',
        ],
      },
      
      // 输入框形状
      shape: {
        default: 'rounded-md',
        square: 'rounded-none',
        pill: 'rounded-full',
      },
      
      appearance: {
        default: '',
        underline: [
          'border-0 border-b-2 rounded-none',
          'bg-transparent',
          'px-1',
        ],
        filled: [
          'bg-[var(--color-gray-50)]',
          'border-[var(--color-border-light)]',
        ],
        minimal: [
          'border-transparent',
          'hover:border-[var(--color-border-medium)]',
          'focus:border-[var(--color-primary-500)]',
        ],
      },
      
      // 响应式断点
      responsive: {
        default: '',
        'mobile-only': 'md:hidden',
        'desktop-only': 'max-md:hidden',
      },
    },
    
    defaultVariants: {
      inputType: 'text',
      size: 'md',
      validation: 'none',
      state: 'default',
      shape: 'default',
      appearance: 'default',
      responsive: 'default',
    },
  }
);

// 输入框属性接口
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  // 标签
  label?: string;
  
  // 描述文本
  description?: string;
  
  // 错误消息
  error?: string;
  
  // 成功消息
  success?: string;
  
  // 警告消息
  warning?: string;
  
  // 必填标记
  required?: boolean;
  
  // 左侧图标
  leftIcon?: React.ReactNode;
  
  // 右侧图标
  rightIcon?: React.ReactNode;
  
  // 清除按钮
  clearable?: boolean;
  
  // 显示密码切换
  showPasswordToggle?: boolean;
  
  // 字符计数
  showCharCount?: boolean;
  
  // 最大字符数
  maxLength?: number;
  
  // 自动完成
  autoComplete?: string;
  
  // 自动聚焦
  autoFocus?: boolean;
  
  // 验证函数
  validate?: (value: string) => { valid: boolean; message?: string };
  
  // 实时验证
  validateOnChange?: boolean;
  
  // 防抖时间 (ms)
  debounceMs?: number;

  loading?: boolean;
  
  // 自定义样式
  className?: string;
  
  // 容器类名
  containerClassName?: string;
  
  // 标签类名
  labelClassName?: string;
  
  // 消息类名
  messageClassName?: string;
}

// 增强输入框组件
const EnhancedInput = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      loading = false,
      size,
      validation,
      state,
      shape,
      appearance,
      responsive,
      label,
      description,
      error,
      success,
      warning,
      required,
      leftIcon,
      rightIcon,
      clearable,
      showPasswordToggle,
      showCharCount,
      maxLength,
      autoComplete,
      autoFocus,
      validate,
      validateOnChange,
      debounceMs = 300,
      value,
      onChange,
      onBlur,
      onFocus,
      disabled,
      readOnly,
      containerClassName,
      labelClassName,
      messageClassName,
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState<string>(value as string || '');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [validationState, setValidationState] = useState<{
      valid: boolean;
      message?: string;
      type?: 'success' | 'error' | 'warning';
    }>({ valid: true });
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [debounceTimer, setDebounceTimer] = useState<number | null>(null);
    
    // 同步外部值
    useEffect(() => {
      if (value !== undefined) {
        setInputValue(value as string);
      }
    }, [value]);

    // 验证函数
    const performValidation = (value: string) => {
      if (validate) {
        const result = validate(value);
        setValidationState({
          valid: result.valid,
          message: result.message,
          type: result.valid ? 'success' : 'error',
        });
      }
    };

    // 防抖验证
    const debouncedValidation = (value: string) => {
      if (debounceTimer) {
        window.clearTimeout(debounceTimer);
      }
      
      const timer = window.setTimeout(() => {
        performValidation(value);
      }, debounceMs);
      
      setDebounceTimer(timer);
    };

    // 输入变化处理
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setInputValue(newValue);
      onChange?.(event);
      
      if (validateOnChange) {
        debouncedValidation(newValue);
      }
    };

    // 失焦处理
    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (validate && !validateOnChange) {
        performValidation(inputValue);
      }
      onBlur?.(event);
    };

    // 聚焦处理
    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(event);
    };

    // 清除输入
    const handleClear = () => {
      setInputValue('');
      const event = {
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(event);
    };

    // 密码显示切换
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    // 确定验证状态
    const currentValidation = useMemo(() => {
      if (error) return 'invalid';
      if (success) return 'valid';
      if (warning) return 'warning';
      if (!validationState.valid && validationState.type === 'error') return 'invalid';
      if (validationState.valid && validationState.type === 'success') return 'valid';
      if (validationState.type === 'warning') return 'warning';
      return validation;
    }, [error, success, warning, validation, validationState]);

    // 确定输入状态
    const currentState = useMemo(() => {
      if (disabled) return 'disabled';
      if (readOnly) return 'readonly';
      if (loading) return 'loading';
      return state;
    }, [disabled, readOnly, loading, state]);

    // 确定输入类型
    const inputType = useMemo(() => {
      if (type === 'password' && showPasswordToggle) {
        return showPassword ? 'text' : 'password';
      }
      return type;
    }, [type, showPasswordToggle, showPassword]);

    // 字符计数
    const charCount = inputValue.length;
    const showCharCountUI = showCharCount && maxLength;

    // 消息内容
    const message = useMemo(() => {
      if (error) return { text: error, type: 'error' as const };
      if (success) return { text: success, type: 'success' as const };
      if (warning) return { text: warning, type: 'warning' as const };
      if (validationState.message) {
        return { text: validationState.message, type: validationState.type || 'error' as const };
      }
      if (description) return { text: description, type: 'info' as const };
      return null;
    }, [error, success, warning, description, validationState]);

    // 输入框类名
    const inputClasses = cn(
      inputVariants({
        inputType:
          type === 'datetime-local' ? 'datetime' : (type as any),
        size,
        validation: currentValidation,
        state: currentState,
        shape,
        appearance,
        responsive,
      }),
      {
        'pl-10': leftIcon, // 左侧图标间距
        'pr-10': rightIcon || clearable || (type === 'password' && showPasswordToggle), // 右侧图标间距
      },
      className
    );

    // 容器类名
    const containerClasses = cn(
      'relative',
      'w-full',
      containerClassName
    );

    // 标签类名
    const labelClasses = cn(
      'block text-sm font-medium text-[var(--color-text-primary)] mb-1',
      {
        'after:content-["*"] after:text-[var(--color-error-500)] after:ml-1': required,
      },
      labelClassName
    );

    // 消息类名
    const messageClasses = cn(
      'mt-1 text-sm',
      {
        'text-[var(--color-error-500)]': message?.type === 'error',
        'text-[var(--color-success-500)]': message?.type === 'success',
        'text-[var(--color-warning-500)]': message?.type === 'warning',
        'text-[var(--color-info-500)]': message?.type === 'info',
        'text-[var(--color-text-secondary)]': message?.type === 'info' && !description,
      },
      messageClassName
    );

    return (
      <div className={containerClasses}>
        {/* 标签 */}
        {label && (
          <label htmlFor={props.id} className={labelClasses}>
            {label}
          </label>
        )}

        {/* 输入框容器 */}
        <div className="relative">
          {/* 左侧图标 */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-[var(--color-text-secondary)]" aria-hidden="true">
                {leftIcon}
              </span>
            </div>
          )}

          {/* 输入框 */}
          <input
            ref={ref}
            type={inputType}
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            disabled={disabled || loading}
            readOnly={readOnly}
            required={required}
            maxLength={maxLength}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            className={inputClasses}
            {...props}
          />

          {/* 右侧操作按钮 */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
            {/* 清除按钮 */}
            {clearable && inputValue && !disabled && !readOnly && (
              <button
                type="button"
                onClick={handleClear}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] rounded-full p-1"
                aria-label="清除输入"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* 密码显示切换 */}
            {type === 'password' && showPasswordToggle && !disabled && !readOnly && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] rounded-full p-1"
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 001.243-.52l3.364-1.95a3 3 0 012.976 5.197l-3.364 1.95a3 3 0 01-1.243.52m-5.858-.908a3 3 0 00-1.243.52l-3.364 1.95a3 3 0 01-2.976-5.197l3.364-1.95a3 3 0 011.243-.52M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 001.243-.52l3.364-1.95a3 3 0 012.976 5.197l-3.364 1.95a3 3 0 01-1.243.52m-5.858-.908a3 3 0 00-1.243.52l-3.364 1.95a3 3 0 01-2.976-5.197l3.364-1.95a3 3 0 011.243-.52M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            )}

            {/* 自定义右侧图标 */}
            {rightIcon && !clearable && !(type === 'password' && showPasswordToggle) && (
              <span className="text-[var(--color-text-secondary)]" aria-hidden="true">
                {rightIcon}
              </span>
            )}

            {/* 字符计数 */}
            {showCharCountUI && (
              <span className="text-xs text-[var(--color-text-tertiary)]">
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        </div>

        {/* 消息显示 */}
        {message && (
          <div className={messageClasses} role={message.type === 'error' ? 'alert' : undefined}>
            {message.text}
          </div>
        )}
        
      </div>
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';

export default EnhancedInput;
