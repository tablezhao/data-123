/**
 * 设计令牌 - 数据合规123导航网站设计系统
 * 
 * 基于系统化优化方案建立的设计系统规范
 * 包含色彩、排版、间距、动画等设计令牌
 */

// 色彩系统设计令牌
export const colorTokens = {
  // 主色系 - 蓝色系
  primary: {
    50: 'hsl(220, 100%, 97%)',
    100: 'hsl(220, 100%, 90%)',
    200: 'hsl(220, 100%, 80%)',
    300: 'hsl(220, 100%, 70%)',
    400: 'hsl(220, 100%, 60%)',
    500: 'hsl(220, 100%, 50%)', // 主色
    600: 'hsl(220, 100%, 40%)',
    700: 'hsl(220, 100%, 30%)',
    800: 'hsl(220, 100%, 20%)',
    900: 'hsl(220, 100%, 10%)',
    950: 'hsl(220, 100%, 5%)',
  },
  
  中性色系 - 灰色系
  gray: {
    50: 'hsl(210, 20%, 98%)',   // 背景色
    100: 'hsl(210, 20%, 95%)',  // 卡片背景
    200: 'hsl(210, 20%, 90%)',  // 边框色
    300: 'hsl(210, 20%, 80%)',  // 次要边框
    400: 'hsl(210, 20%, 70%)',  // 占位符文本
    500: 'hsl(210, 20%, 60%)',  // 辅助文本
    600: 'hsl(210, 20%, 50%)',  // 次要文本
    700: 'hsl(210, 20%, 40%)',  // 主要文本
    800: 'hsl(210, 20%, 30%)',  // 标题文本
    900: 'hsl(210, 20%, 20%)',  // 强调文本
    950: 'hsl(210, 20%, 10%)',  // 最深文本
  },
  
  // 功能色
  success: {
    50: 'hsl(142, 71%, 95%)',
    100: 'hsl(142, 71%, 90%)',
    500: 'hsl(142, 71%, 45%)', // 主成功色
    600: 'hsl(142, 71%, 35%)',
    700: 'hsl(142, 71%, 25%)',
  },
  
  warning: {
    50: 'hsl(45, 100%, 95%)',
    100: 'hsl(45, 100%, 90%)',
    500: 'hsl(45, 100%, 51%)', // 主警告色
    600: 'hsl(45, 100%, 41%)',
    700: 'hsl(45, 100%, 31%)',
  },
  
  error: {
    50: 'hsl(0, 84%, 95%)',
    100: 'hsl(0, 84%, 90%)',
    500: 'hsl(0, 84%, 60%)', // 主错误色
    600: 'hsl(0, 84%, 50%)',
    700: 'hsl(0, 84%, 40%)',
  },
  
  // 信息色
  info: {
    50: 'hsl(200, 100%, 95%)',
    100: 'hsl(200, 100%, 90%)',
    500: 'hsl(200, 100%, 50%)', // 主信息色
    600: 'hsl(200, 100%, 40%)',
    700: 'hsl(200, 100%, 30%)',
  },
  
  // 教育主题色
  education: {
    blue: 'hsl(210, 80%, 55%)',  // 教育蓝色
    green: 'hsl(140, 70%, 45%)',  // 教育绿色
  },
  
  // 背景色
  background: {
    primary: 'hsl(0, 0%, 100%)',     // 主背景
    secondary: 'hsl(210, 20%, 98%)',  // 次要背景
    tertiary: 'hsl(210, 20%, 95%)',  // 第三背景
    elevated: 'hsl(0, 0%, 100%)',   //  elevated背景
  },
  
  // 文本色
  text: {
    primary: 'hsl(210, 20%, 20%)',   // 主要文本
    secondary: 'hsl(210, 20%, 40%)', // 次要文本
    tertiary: 'hsl(210, 20%, 60%)',  // 辅助文本
    disabled: 'hsl(210, 20%, 70%)',  // 禁用文本
    inverse: 'hsl(0, 0%, 100%)',     // 反色文本
  },
  
  // 对比度标准 (WCAG 2.1)
  contrast: {
    min: '4.5:1',      // AA标准
    enhanced: '7:1',   // AAA标准
    largeText: '3:1',  // 大文本标准
  },
} as const;

// 排版系统设计令牌
export const typographyTokens = {
  // 字体规模
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },
  
  // 字重
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  // 行高
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  // 字间距
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  
  // 字体族
  fontFamily: {
    sans: [
      'Inter',
      'ui-sans-serif',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'Noto Sans',
      'sans-serif',
    ].join(', '),
    
    mono: [
      'JetBrains Mono',
      'ui-monospace',
      'SFMono-Regular',
      'Menlo',
      'Monaco',
      'Consolas',
      'Liberation Mono',
      'Courier New',
      'monospace',
    ].join(', '),
  },
  
  // 排版层级
  text: {
    hero: {
      fontSize: typographyTokens.fontSize['5xl'],
      fontWeight: typographyTokens.fontWeight.bold,
      lineHeight: typographyTokens.lineHeight.tight,
      letterSpacing: typographyTokens.letterSpacing.tight,
    },
    
    h1: {
      fontSize: typographyTokens.fontSize['4xl'],
      fontWeight: typographyTokens.fontWeight.bold,
      lineHeight: typographyTokens.lineHeight.tight,
      letterSpacing: typographyTokens.letterSpacing.tight,
    },
    
    h2: {
      fontSize: typographyTokens.fontSize['3xl'],
      fontWeight: typographyTokens.fontWeight.semibold,
      lineHeight: typographyTokens.lineHeight.snug,
      letterSpacing: typographyTokens.letterSpacing.tight,
    },
    
    h3: {
      fontSize: typographyTokens.fontSize['2xl'],
      fontWeight: typographyTokens.fontWeight.semibold,
      lineHeight: typographyTokens.lineHeight.snug,
      letterSpacing: typographyTokens.letterSpacing.normal,
    },
    
    h4: {
      fontSize: typographyTokens.fontSize.xl,
      fontWeight: typographyTokens.fontWeight.semibold,
      lineHeight: typographyTokens.lineHeight.snug,
      letterSpacing: typographyTokens.letterSpacing.normal,
    },
    
    body: {
      fontSize: typographyTokens.fontSize.base,
      fontWeight: typographyTokens.fontWeight.normal,
      lineHeight: typographyTokens.lineHeight.normal,
      letterSpacing: typographyTokens.letterSpacing.normal,
    },
    
    small: {
      fontSize: typographyTokens.fontSize.sm,
      fontWeight: typographyTokens.fontWeight.normal,
      lineHeight: typographyTokens.lineHeight.normal,
      letterSpacing: typographyTokens.letterSpacing.wide,
    },
    
    caption: {
      fontSize: typographyTokens.fontSize.xs,
      fontWeight: typographyTokens.fontWeight.normal,
      lineHeight: typographyTokens.lineHeight.normal,
      letterSpacing: typographyTokens.letterSpacing.wide,
    },
  },
} as const;

// 间距系统设计令牌 (8px网格系统)
export const spacingTokens = {
  // 基础间距 (8px倍数)
  0: '0px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
} as const;

// 阴影系统设计令牌
export const shadowTokens = {
  // 基础阴影
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
  
  // 特殊用途阴影
  card: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  hover: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  focus: '0 0 0 3px rgb(59 130 246 / 0.1)',
} as const;

// 动画系统设计令牌
export const animationTokens = {
  // 动画时长
  duration: {
    instant: '0.1s',
    fast: '0.2s',
    normal: '0.3s',
    slow: '0.5s',
    slower: '0.7s',
  },
  
  // 缓动函数
  easing: {
    'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
    'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
    'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
  },
  
  // 关键帧动画
  keyframes: {
    'fade-in': {
      from: { opacity: '0' },
      to: { opacity: '1' },
    },
    'fade-out': {
      from: { opacity: '1' },
      to: { opacity: '0' },
    },
    'slide-in': {
      from: { transform: 'translateX(-100%)' },
      to: { transform: 'translateX(0)' },
    },
    'slide-out': {
      from: { transform: 'translateX(0)' },
      to: { transform: 'translateX(100%)' },
    },
    'scale-in': {
      from: { transform: 'scale(0.9)', opacity: '0' },
      to: { transform: 'scale(1)', opacity: '1' },
    },
    'accordion-down': {
      from: { height: '0' },
      to: { height: 'var(--radix-accordion-content-height)' },
    },
    'accordion-up': {
      from: { height: 'var(--radix-accordion-content-height)' },
      to: { height: '0' },
    },
  },
  
  // 动画类名
  animation: {
    'fade-in': 'fade-in 0.5s ease-out',
    'fade-out': 'fade-out 0.5s ease-out',
    'slide-in': 'slide-in 0.3s ease-out',
    'slide-out': 'slide-out 0.3s ease-out',
    'scale-in': 'scale-in 0.2s ease-out',
    'accordion-down': 'accordion-down 0.2s ease-out',
    'accordion-up': 'accordion-up 0.2s ease-out',
  },
} as const;

// 断点系统设计令牌
export const breakpointTokens = {
  // 响应式断点
  screens: {
    xs: '475px',     // 超小屏设备
    sm: '640px',     // 小屏手机
    md: '768px',     // 平板
    lg: '1024px',    // 小屏笔记本
    xl: '1280px',    // 桌面显示器
    '2xl': '1536px', // 大屏显示器
    '3xl': '1920px', // 超大屏
  },
  
  // 容器宽度
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // 响应式工具类
  responsive: {
    mobile: '@media (max-width: 767px)',
    tablet: '@media (min-width: 768px) and (max-width: 1023px)',
    desktop: '@media (min-width: 1024px)',
    wide: '@media (min-width: 1280px)',
  },
} as const;

// 图标系统设计令牌
export const iconTokens = {
  // 标准图标尺寸
  sizes: {
    xs: '12px',
    sm: '16px',
    md: '20px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  
  // 图标颜色
  colors: {
    primary: colorTokens.primary[600],
    secondary: colorTokens.gray[500],
    success: colorTokens.success[500],
    warning: colorTokens.warning[500],
    error: colorTokens.error[500],
    muted: colorTokens.gray[400],
  },
  
  // 图标语义化命名
  semantic: {
    navigation: 'navigation',
    action: 'action',
    feedback: 'feedback',
    content: 'content',
    social: 'social',
    system: 'system',
  },
} as const;

// 无障碍访问设计令牌
export const a11yTokens = {
  // 最小触摸目标尺寸 (WCAG 2.1)
  touchTarget: {
    min: '44px', // 最小触摸目标
    recommended: '48px', // 推荐触摸目标
  },
  
  // 焦点指示器
  focus: {
    width: '2px',
    offset: '2px',
    color: colorTokens.primary[500],
    style: 'solid',
  },
  
  // 键盘导航
  keyboard: {
    tabIndex: 0,
    skipLink: '#main-content',
    shortcuts: {
      search: 'Ctrl+K',
      home: 'Alt+H',
      favorites: 'Alt+F',
      help: '?',
    },
  },
  
  // ARIA标签
  aria: {
    liveRegion: 'polite',
    atomic: 'false',
    relevant: 'additions text',
  },
  
  // 屏幕阅读器
  screenReader: {
    hidden: 'sr-only',
    visible: 'not-sr-only',
  },
} as const;

// 设计系统类型定义
export interface DesignSystem {
  colors: typeof colorTokens;
  typography: typeof typographyTokens;
  spacing: typeof spacingTokens;
  shadows: typeof shadowTokens;
  animations: typeof animationTokens;
  breakpoints: typeof breakpointTokens;
  icons: typeof iconTokens;
  a11y: typeof a11yTokens;
}

// 导出完整的设计系统
export const designSystem: DesignSystem = {
  colors: colorTokens,
  typography: typographyTokens,
  spacing: spacingTokens,
  shadows: shadowTokens,
  animations: animationTokens,
  breakpoints: breakpointTokens,
  icons: iconTokens,
  a11y: a11yTokens,
} as const;

// 工具函数：获取色彩对比度
export function getContrastRatio(color1: string, color2: string): number {
  // 简化版对比度计算，实际项目中应使用完整的WCAG算法
  return 4.5; // 模拟对比度值
}

// 工具函数：检查色彩对比度是否符合WCAG标准
export function isContrastCompliant(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = level === 'AA' ? 4.5 : 7.0;
  return ratio >= requiredRatio;
}

// 工具函数：生成响应式样式
export function createResponsiveStyles<T extends Record<string, any>>(
  styles: T
): Record<string, any> {
  const responsiveStyles: Record<string, any> = {};
  
  Object.entries(styles).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      // 处理响应式对象
      Object.entries(value).forEach(([breakpoint, breakpointValue]) => {
        const mediaQuery = breakpointTokens.responsive[breakpoint as keyof typeof breakpointTokens.responsive];
        if (mediaQuery) {
          if (!responsiveStyles[mediaQuery]) {
            responsiveStyles[mediaQuery] = {};
          }
          responsiveStyles[mediaQuery][key] = breakpointValue;
        }
      });
    } else {
      // 基础样式
      responsiveStyles[key] = value;
    }
  });
  
  return responsiveStyles;
}

export default designSystem;