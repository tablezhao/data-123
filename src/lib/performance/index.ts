/**
 * Performance Monitoring System
 * Comprehensive performance monitoring with Core Web Vitals, resource tracking, and optimization recommendations
 */

// Core exports
export * from './core-web-vitals';
export * from './resource-monitor';

// React hooks
export { usePerformance, useWebVitals, useResourceMonitor } from './hooks';

// Types
export type {
  PerformanceMetrics,
  PerformanceStatus,
  PerformanceOptimization,
  PerformanceReport as FullPerformanceReport
} from './types';
