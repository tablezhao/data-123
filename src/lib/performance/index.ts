/**
 * Performance Monitoring System
 * Comprehensive performance monitoring with Core Web Vitals, resource tracking, and optimization recommendations
 */

// Core exports
export * from './core-web-vitals';
export * from './resource-monitor';

// Integration utilities
export { PerformanceMonitor } from './performance-monitor';
export { PerformanceOptimizer } from './performance-optimizer';
export { PerformanceReporter } from './performance-reporter';

// React hooks
export { usePerformance, useWebVitals, useResourceMonitor } from './hooks';

// Configuration and utilities
export { PerformanceProvider } from './provider';
export { getPerformanceMetrics, initializePerformanceMonitoring } from './utils';

// Types
export type {
  PerformanceMetrics,
  PerformanceStatus,
  PerformanceOptimization,
  PerformanceReport as FullPerformanceReport
} from './types';