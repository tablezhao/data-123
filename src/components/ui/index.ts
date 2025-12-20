/**
 * UI组件库导出 - 数据合规123导航网站
 * 
 * 统一导出所有增强版UI组件，提供一致的设计系统支持
 */

// 基础组件
export { default as EnhancedButton } from './EnhancedButton';
export type { ButtonProps } from './EnhancedButton';

export { default as EnhancedCard } from './EnhancedCard';
export type { CardProps } from './EnhancedCard';

export { default as EnhancedInput } from './EnhancedInput';
export type { InputProps } from './EnhancedInput';

// 主题系统
export { 
  default as ThemeProvider,
  useTheme,
  ThemeToggle,
  ThemeSelector,
} from './ThemeProvider';
export type { 
  ThemeMode, 
  ThemeConfig,
  ThemeProviderProps 
} from './ThemeProvider';

// 设计系统工具
export { 
  designSystem,
  colorTokens,
  typographyTokens,
  spacingTokens,
  shadowTokens,
  animationTokens,
  breakpointTokens,
  iconTokens,
  a11yTokens,
  getContrastRatio,
  isContrastCompliant,
  createResponsiveStyles,
} from '@/lib/design-tokens';
export type { DesignSystem } from '@/lib/design-tokens';

export { 
  lightTheme,
  darkTheme,
  themeManager,
  createThemedStyles,
  generateThemeCSS,
  themePresets,
} from '@/lib/theme';
export type { 
  ThemeMode as ThemeModeType,
  ThemeConfig as ThemeConfigType,
  ThemeManager as ThemeManagerType,
} from '@/lib/theme';