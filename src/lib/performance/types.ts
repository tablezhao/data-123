/**
 * Performance Monitoring Types
 * TypeScript type definitions for comprehensive performance monitoring system
 */

import { WebVitalsMetrics, PerformanceReport as WebVitalsReport } from './core-web-vitals';
import { ResourceMetrics, ResourceReport } from './resource-monitor';

// Combined performance metrics
export interface PerformanceMetrics {
  webVitals: WebVitalsMetrics;
  resources: ResourceMetrics[];
  navigation: NavigationMetrics;
  userTiming: UserTimingMetrics;
  memory: MemoryMetrics;
  runtime: RuntimeMetrics;
}

export interface NavigationMetrics {
  domContentLoaded: number;
  loadComplete: number;
  firstPaint: number;
  firstContentfulPaint: number;
  dnsLookup: number;
  tcpConnection: number;
  tlsHandshake?: number;
  requestDuration: number;
  responseDuration: number;
  processingDuration: number;
  redirectCount: number;
  navigationType: 'navigate' | 'reload' | 'back_forward' | 'prerender';
}

export interface UserTimingMetrics {
  marks: PerformanceMark[];
  measures: PerformanceMeasure[];
  customMetrics: Record<string, number>;
}

export interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

export interface RuntimeMetrics {
  longTasks: LongTask[];
  frameDrops: FrameDrop[];
  inputDelay: InputDelay[];
  animationJank: AnimationJank[];
}

export interface LongTask {
  startTime: number;
  duration: number;
  attribution: string[];
}

export interface FrameDrop {
  timestamp: number;
  droppedFrames: number;
  targetFPS: number;
  actualFPS: number;
}

export interface InputDelay {
  type: string;
  delay: number;
  timestamp: number;
  target?: string;
}

export interface AnimationJank {
  timestamp: number;
  duration: number;
  cause: string;
}

// Performance status and scoring
export interface PerformanceStatus {
  overall: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    status: 'excellent' | 'good' | 'needs_improvement' | 'poor';
  };
  webVitals: Record<keyof WebVitalsMetrics, {
    score: number;
    status: 'good' | 'needs_improvement' | 'poor';
    value: number;
    threshold: {
      good: number;
      needsImprovement: number;
    };
  }>;
  resources: {
    score: number;
    status: 'good' | 'needs_improvement' | 'poor';
    totalSize: number;
    totalTransferSize: number;
    efficiency: number;
  };
  navigation: {
    score: number;
    status: 'good' | 'needs_improvement' | 'poor';
    ttfb: number;
    loadTime: number;
  };
}

// Performance optimizations
export interface PerformanceOptimization {
  id: string;
  type: 'image' | 'script' | 'stylesheet' | 'font' | 'cache' | 'network' | 'render' | 'runtime';
  category: 'critical' | 'important' | 'recommended' | 'optional';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  estimatedImprovement: {
    score: number;
    metrics: Partial<Record<keyof PerformanceMetrics, number>>;
  };
  implementation: {
    steps: string[];
    code?: string;
    tools?: string[];
    resources?: string[];
  };
  prerequisites: string[];
  risks: string[];
  testing: {
    before: string[];
    after: string[];
    metrics: string[];
  };
}

// Performance reports
export interface PerformanceReport {
  timestamp: number;
  url: string;
  deviceInfo: {
    userAgent: string;
    deviceType: 'mobile' | 'tablet' | 'desktop';
    screenSize: { width: number; height: number };
    viewport: { width: number; height: number };
    connection: 'slow-2g' | '2g' | '3g' | '4g' | 'wifi' | 'ethernet' | 'unknown';
    memory?: number;
    cpuCores?: number;
  };
  metrics: PerformanceMetrics;
  status: PerformanceStatus;
  optimizations: PerformanceOptimization[];
  recommendations: PerformanceRecommendation[];
  trends?: PerformanceTrends;
}

export interface PerformanceRecommendation {
  id: string;
  type: 'web-vital' | 'resource' | 'navigation' | 'runtime' | 'user-experience';
  priority: number;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  estimatedImprovement: {
    score: number;
    specificMetrics?: Partial<Record<keyof PerformanceMetrics, number>>;
  };
  implementation: {
    steps: string[];
    code?: string;
    tools?: string[];
  };
  testing: {
    before: string[];
    after: string[];
    successCriteria: string[];
  };
}

// Performance trends
export interface PerformanceTrends {
  webVitals: {
    lcp: TrendData;
    fid: TrendData;
    cls: TrendData;
    fcp: TrendData;
    tti: TrendData;
    tbt: TrendData;
  };
  resources: {
    totalSize: TrendData;
    totalTransferSize: TrendData;
    efficiency: TrendData;
  };
  navigation: {
    loadTime: TrendData;
    ttfb: TrendData;
  };
  overall: TrendData;
}

export interface TrendData {
  current: number;
  previous: number;
  trend: 'improving' | 'stable' | 'declining';
  change: number;
  changePercent: number;
  samples: number;
  period: string;
}

// Performance budgets
export interface PerformanceBudget {
  webVitals: {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    tti: number;
    tbt: number;
  };
  resources: {
    totalSize: number;
    totalTransferSize: number;
    maxResources: number;
    byType: {
      script: number;
      stylesheet: number;
      image: number;
      font: number;
      fetch: number;
    };
  };
  navigation: {
    ttfb: number;
    loadTime: number;
    domContentLoaded: number;
  };
}

// Performance monitoring configuration
export interface PerformanceMonitoringConfig {
  enabled: boolean;
  samplingRate: number;
  enableWebVitals: boolean;
  enableResourceMonitoring: boolean;
  enableNavigationTracking: boolean;
  enableUserTiming: boolean;
  enableMemoryTracking: boolean;
  enableRuntimeTracking: boolean;
  reporting: {
    enabled: boolean;
    threshold: number;
    interval: number;
    endpoints: string[];
  };
  budgets: Partial<PerformanceBudget>;
  optimization: {
    enabled: boolean;
    autoOptimize: boolean;
    recommendations: boolean;
  };
}

// Performance comparison
export interface PerformanceComparison {
  baseline: PerformanceReport;
  current: PerformanceReport;
  comparison: {
    overall: {
      scoreChange: number;
      statusChange: 'improved' | 'declined' | 'stable';
    };
    metrics: Record<string, {
      baseline: number;
      current: number;
      change: number;
      changePercent: number;
      significance: 'significant' | 'minor' | 'none';
    }>;
    optimizations: {
      implemented: string[];
      pending: string[];
      new: string[];
    };
  };
}

// Performance monitoring events
export interface PerformanceEvent {
  type: 'metric' | 'budget_exceeded' | 'optimization_applied' | 'performance_report';
  timestamp: number;
  url: string;
  data: any;
  severity: 'info' | 'warning' | 'error';
}