import React from 'react';
import { Skeleton } from './skeleton';

interface LazyImageProps {
  /** 图片URL */
  src: string;
  /** 替代文本 */
  alt: string;
  /** 自定义样式 */
  className?: string;
  /** 占位符类型 */
  placeholder?: 'skeleton' | 'none';
  /** 加载失败时显示的内容 */
  fallback?: React.ReactNode;
  /** 图片加载完成后的回调 */
  onLoad?: () => void;
  /** 图片加载失败后的回调 */
  onError?: () => void;
}

/**
 * 图片懒加载组件
 * 使用 IntersectionObserver 实现图片懒加载，支持占位符和加载状态
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = 'skeleton',
  fallback = null,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    // 重置状态
    setIsLoaded(false);
    setHasError(false);

    // 检查 IntersectionObserver 是否可用
    if (typeof IntersectionObserver === 'undefined') {
      // 在不支持 IntersectionObserver 的环境中直接加载图片
      setIsLoaded(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsLoaded(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { 
        threshold: 0.1, // 当图片 10% 进入视口时加载
        rootMargin: '50px' // 提前 50px 加载
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);

  // 处理图片加载成功
  const handleLoad = () => {
    onLoad?.();
  };

  // 处理图片加载失败
  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // 如果加载失败，显示 fallback
  if (hasError) {
    return fallback;
  }

  return (
    <div className="relative inline-block">
      {/* 占位符或骨架屏 */}
      {placeholder === 'skeleton' && !isLoaded && (
        <Skeleton className={`absolute inset-0 ${className}`} />
      )}
      
      {/* 懒加载图片 */}
      <img
        ref={imgRef}
        src={isLoaded ? src : ''}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={handleLoad}
        onError={handleError}
        style={{ display: 'block' }}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
};

export default LazyImage;
