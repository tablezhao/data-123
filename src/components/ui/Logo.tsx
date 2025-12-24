import React from 'react';

interface LogoProps {
  /** Logo图片URL */
  src: string;
  /** 替代文本 */
  alt?: string;
  /** 显示尺寸 */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** 自定义样式 */
  className?: string;
  /** 显示模式 */
  mode?: 'contain' | 'cover';
  /** 是否保持正方形比例 */
  square?: boolean;
}

/**
 * Logo 组件
 * 用于显示网站 logo，支持多种尺寸和显示模式
 */
export const Logo: React.FC<LogoProps> = ({
  src,
  alt = 'Logo',
  size = 'md',
  className = '',
  mode = 'contain',
  square = true,
}) => {
  // 尺寸类名映射
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  // 显示模式类名
  const objectClasses = mode === 'contain' ? 'object-contain' : 'object-cover';

  // 比例类名
  const ratioClasses = square ? 'aspect-square' : '';

  return (
    <img
      src={src}
      alt={alt}
      className={`
        ${sizeClasses[size]} 
        ${objectClasses} 
        ${ratioClasses} 
        rounded 
        ${className}
      `}
      draggable={false}
      loading="eager"
      {...({ fetchpriority: "high" } as any)}
    />
  );
};

export default Logo;
