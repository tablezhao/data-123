/**
 * Core Web Vitals Performance Monitoring
 * Comprehensive performance tracking with real-time metrics, optimization recommendations, and reporting
 */

export interface WebVitalsMetrics {
  lcp: number; // Largest Contentful Paint (ms)
  fid: number; // First Input Delay (ms)
  cls: number; // Cumulative Layout Shift (score)
  fcp: number; // First Contentful Paint (ms)
  tti: number; // Time to Interactive (ms)
  tbt: number; // Total Blocking Time (ms)
}

export interface PerformanceThresholds {
  lcp: { good: number; needsImprovement: number };
  fid: { good: number; needsImprovement: number };
  cls: { good: number; needsImprovement: number };
  fcp: { good: number; needsImprovement: number };
  tti: { good: number; needsImprovement: number };
  tbt: { good: number; needsImprovement: number };
}

export const WEB_VITALS_THRESHOLDS: PerformanceThresholds = {
  lcp: { good: 2500, needsImprovement: 4000 },
  fid: { good: 100, needsImprovement: 300 },
  cls: { good: 0.1, needsImprovement: 0.25 },
  fcp: { good: 1800, needsImprovement: 3000 },
  tti: { good: 3800, needsImprovement: 7300 },
  tbt: { good: 200, needsImprovement: 600 }
};

export interface PerformanceReport {
  metrics: WebVitalsMetrics;
  scores: Record<keyof WebVitalsMetrics, number>;
  status: Record<keyof WebVitalsMetrics, 'good' | 'needs_improvement' | 'poor'>;
  recommendations: PerformanceRecommendation[];
  timestamp: number;
  url: string;
  deviceInfo: DeviceInfo;
}

export interface PerformanceRecommendation {
  metric: keyof WebVitalsMetrics;
  issue: string;
  impact: 'high' | 'medium' | 'low';
  suggestion: string;
  priority: number;
  implementation: string[];
  estimatedImprovement: number;
}

export interface DeviceInfo {
  userAgent: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  screenSize: { width: number; height: number };
  viewport: { width: number; height: number };
  connection: 'slow-2g' | '2g' | '3g' | '4g' | 'wifi' | 'ethernet' | 'unknown';
  memory?: number; // MB
  cpuCores?: number;
}

export interface PerformanceConfig {
  enabled: boolean;
  samplingRate: number;
  reportThreshold: number; // ms - minimum improvement to report
  enableOptimizations: boolean;
  enableReporting: boolean;
  enableCaching: boolean;
  cacheTimeout: number; // ms
}

const DEFAULT_CONFIG: PerformanceConfig = {
  enabled: true,
  samplingRate: 1.0,
  reportThreshold: 100,
  enableOptimizations: true,
  enableReporting: true,
  enableCaching: true,
  cacheTimeout: 300000 // 5 minutes
};

// Performance optimization strategies
const OPTIMIZATION_STRATEGIES = {
  lcp: [
    {
      issue: 'Large hero images not optimized',
      impact: 'high' as const,
      suggestion: 'Optimize and compress hero images',
      priority: 1,
      implementation: [
        'Use WebP format for images',
        'Implement responsive images with srcset',
        'Preload critical images',
        'Use lazy loading for below-fold images'
      ],
      estimatedImprovement: 30
    },
    {
      issue: 'Render-blocking resources',
      impact: 'high' as const,
      suggestion: 'Eliminate render-blocking resources',
      priority: 2,
      implementation: [
        'Defer non-critical CSS',
        'Inline critical CSS',
        'Defer JavaScript execution',
        'Use resource hints (preload, prefetch)'
      ],
      estimatedImprovement: 25
    },
    {
      issue: 'Slow server response time',
      impact: 'medium' as const,
      suggestion: 'Improve server response time',
      priority: 3,
      implementation: [
        'Implement server-side caching',
        'Optimize database queries',
        'Use CDN for static assets',
        'Enable HTTP/2 or HTTP/3'
      ],
      estimatedImprovement: 20
    }
  ],
  fid: [
    {
      issue: 'Heavy JavaScript execution',
      impact: 'high' as const,
      suggestion: 'Reduce JavaScript execution time',
      priority: 1,
      implementation: [
        'Code-split large bundles',
        'Remove unused JavaScript',
        'Minimize main thread work',
        'Use web workers for heavy computations'
      ],
      estimatedImprovement: 40
    },
    {
      issue: 'Third-party scripts blocking input',
      impact: 'medium' as const,
      suggestion: 'Optimize third-party script loading',
      priority: 2,
      implementation: [
        'Load third-party scripts asynchronously',
        'Use defer attribute for non-critical scripts',
        'Implement tag management strategy',
        'Monitor third-party performance impact'
      ],
      estimatedImprovement: 20
    }
  ],
  cls: [
    {
      issue: 'Images without dimensions',
      impact: 'high' as const,
      suggestion: 'Add width and height attributes to images',
      priority: 1,
      implementation: [
        'Specify image dimensions in HTML',
        'Use aspect-ratio CSS property',
        'Reserve space for lazy-loaded images',
        'Avoid layout shifts during image loading'
      ],
      estimatedImprovement: 50
    },
    {
      issue: 'Fonts causing layout shifts',
      impact: 'medium' as const,
      suggestion: 'Optimize font loading',
      priority: 2,
      implementation: [
        'Use font-display: optional or swap',
        'Preload critical fonts',
        'Use fallback fonts with similar metrics',
        'Subset fonts to reduce file size'
      ],
      estimatedImprovement: 30
    },
    {
      issue: 'Dynamic content insertion',
      impact: 'medium' as const,
      suggestion: 'Reserve space for dynamic content',
      priority: 3,
      implementation: [
        'Use CSS containment',
        'Reserve space for ads and widgets',
        'Animate content changes smoothly',
        'Avoid inserting content above existing content'
      ],
      estimatedImprovement: 25
    }
  ],
  fcp: [
    {
      issue: 'Large CSS files blocking render',
      impact: 'high' as const,
      suggestion: 'Optimize CSS delivery',
      priority: 1,
      implementation: [
        'Minimize CSS file size',
        'Remove unused CSS',
        'Inline critical CSS',
        'Defer non-critical CSS'
      ],
      estimatedImprovement: 35
    },
    {
      issue: 'Slow font loading',
      impact: 'medium' as const,
      suggestion: 'Improve font loading performance',
      priority: 2,
      implementation: [
        'Use font-display: swap',
        'Preload critical fonts',
        'Use system fonts as fallback',
        'Optimize font formats'
      ],
      estimatedImprovement: 20
    }
  ],
  tti: [
    {
      issue: 'Heavy JavaScript blocking interactivity',
      impact: 'high' as const,
      suggestion: 'Reduce JavaScript blocking time',
      priority: 1,
      implementation: [
        'Code-split and lazy load JavaScript',
        'Defer non-critical JavaScript',
        'Optimize JavaScript bundles',
        'Use progressive enhancement'
      ],
      estimatedImprovement: 30
    },
    {
      issue: 'Large DOM size',
      impact: 'medium' as const,
      suggestion: 'Optimize DOM structure',
      priority: 2,
      implementation: [
        'Reduce DOM nodes count',
        'Use virtual scrolling for large lists',
        'Implement efficient DOM updates',
        'Avoid deep DOM nesting'
      ],
      estimatedImprovement: 20
    }
  ],
  tbt: [
    {
      issue: 'Long tasks blocking main thread',
      impact: 'high' as const,
      suggestion: 'Break up long tasks',
      priority: 1,
      implementation: [
        'Use requestIdleCallback for non-critical work',
        'Implement time-slicing for heavy computations',
        'Use web workers for background tasks',
        'Optimize event handlers'
      ],
      estimatedImprovement: 40
    }
  ]
};

export class CoreWebVitalsMonitor {
  private metrics: Partial<WebVitalsMetrics> = {};
  private observers: Map<string, (metrics: WebVitalsMetrics) => void> = new Map();
  private config: PerformanceConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private deviceInfo: DeviceInfo;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.deviceInfo = this.getDeviceInfo();
    
    if (this.config.enabled) {
      this.initializeMonitoring();
    }
  }

  private initializeMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Set up PerformanceObserver for Web Vitals
    this.setupPerformanceObserver();
    
    // Set up observers for different metrics
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeFCP();
    this.observeTTI();
    this.observeTBT();
    
    // Set up resource timing observations
    this.observeResourceTiming();
    
    // Set up navigation timing
    this.observeNavigationTiming();
  }

  private getDeviceInfo(): DeviceInfo {
    if (typeof window === 'undefined') {
      return {
        userAgent: '',
        deviceType: 'desktop',
        screenSize: { width: 0, height: 0 },
        viewport: { width: 0, height: 0 },
        connection: 'unknown'
      };
    }

    const width = window.innerWidth;
    const deviceType = width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';
    
    // Get connection info
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const effectiveType = connection?.effectiveType || 'unknown';
    
    return {
      userAgent: navigator.userAgent,
      deviceType,
      screenSize: { width: screen.width, height: screen.height },
      viewport: { width: window.innerWidth, height: window.innerHeight },
      connection: effectiveType as any,
      memory: (navigator as any).deviceMemory,
      cpuCores: navigator.hardwareConcurrency
    };
  }

  private setupPerformanceObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    // Observe paint entries
    try {
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.updateMetric('fcp', entry.startTime);
          }
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.warn('Failed to observe paint entries:', e);
    }

    // Observe largest contentful paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.updateMetric('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('Failed to observe LCP entries:', e);
    }

    // Observe layout shifts
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.updateMetric('cls', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('Failed to observe layout-shift entries:', e);
    }
  }

  private observeLCP(): void {
    // LCP is handled by PerformanceObserver above
    // Additional LCP-specific monitoring
    window.addEventListener('load', () => {
      setTimeout(() => {
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        if (lcpEntries.length > 0) {
          const lastEntry = lcpEntries[lcpEntries.length - 1];
          this.updateMetric('lcp', lastEntry.startTime);
        }
      }, 100);
    });
  }

  private observeFID(): void {
    // First Input Delay measurement
    let firstInput = true;
    
    const measureFID = (event: Event) => {
      if (!firstInput) return;
      firstInput = false;
      
      const now = performance.now();
      const target = event.target as Element;
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const delay = performance.now() - now;
          this.updateMetric('fid', delay);
        });
      });
      
      // Remove listeners
      ['click', 'keydown', 'mousedown', 'pointerdown', 'touchstart'].forEach(type => {
        window.removeEventListener(type, measureFID, true);
      });
    };
    
    // Add listeners for first input
    ['click', 'keydown', 'mousedown', 'pointerdown', 'touchstart'].forEach(type => {
      window.addEventListener(type, measureFID, true);
    });
  }

  private observeCLS(): void {
    // CLS is handled by PerformanceObserver above
    // Additional CLS monitoring for user interactions
    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries = 0;
    
    const updateCLS = () => {
      if (sessionEntries > 0) {
        clsValue += sessionValue;
        this.updateMetric('cls', clsValue);
        sessionValue = 0;
        sessionEntries = 0;
      }
    };
    
    // Update CLS periodically and on page visibility change
    setInterval(updateCLS, 5000);
    document.addEventListener('visibilitychange', updateCLS);
  }

  private observeFCP(): void {
    // FCP is handled by PerformanceObserver above
    // Additional FCP monitoring
    const checkFCP = () => {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.updateMetric('fcp', fcpEntry.startTime);
      }
    };
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkFCP);
    } else {
      checkFCP();
    }
  }

  private observeTTI(): void {
    // Time to Interactive calculation
    let ttiValue: number | null = null;
    
    const calculateTTI = () => {
      if (ttiValue !== null) return;
      
      // Simple TTI calculation based on network idle and main thread idle
      const navigationStart = performance.timing.navigationStart;
      const domContentLoaded = performance.timing.domContentLoadedEventEnd;
      const loadComplete = performance.timing.loadEventEnd;
      
      // Estimate TTI as max of DOM ready and load complete
      const estimatedTTI = Math.max(domContentLoaded, loadComplete) - navigationStart;
      
      if (estimatedTTI > 0) {
        ttiValue = estimatedTTI;
        this.updateMetric('tti', ttiValue);
      }
    };
    
    // Calculate TTI after page load
    if (document.readyState === 'complete') {
      calculateTTI();
    } else {
      window.addEventListener('load', calculateTTI);
    }
    
    // Also try to calculate earlier
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(calculateTTI, 1000);
    });
  }

  private observeTBT(): void {
    // Total Blocking Time calculation
    let tbtValue = 0;
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Tasks longer than 50ms are considered blocking
          tbtValue += entry.duration - 50;
        }
      }
      this.updateMetric('tbt', tbtValue);
    });
    
    try {
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Fallback TBT calculation
      this.calculateTBTFallback();
    }
  }

  private calculateTBTFallback(): void {
    // Fallback TBT calculation using main thread blocking time
    let tbtValue = 0;
    const startTime = performance.now();
    
    const measureBlockingTime = () => {
      const currentTime = performance.now();
      const taskDuration = currentTime - startTime;
      
      if (taskDuration > 50) {
        tbtValue += taskDuration - 50;
        this.updateMetric('tbt', tbtValue);
      }
      
      requestAnimationFrame(measureBlockingTime);
    };
    
    requestAnimationFrame(measureBlockingTime);
  }

  private observeResourceTiming(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Monitor slow resources
          if (entry.duration > 1000) {
            console.warn(`Slow resource detected: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.warn('Failed to observe resource timing:', e);
    }
  }

  private observeNavigationTiming(): void {
    if (typeof window === 'undefined') return;

    const getNavigationTiming = () => {
      const timing = performance.timing;
      const navigation = performance.navigation;
      
      return {
        navigationStart: timing.navigationStart,
        unloadEventStart: timing.unloadEventStart,
        unloadEventEnd: timing.unloadEventEnd,
        redirectStart: timing.redirectStart,
        redirectEnd: timing.redirectEnd,
        fetchStart: timing.fetchStart,
        domainLookupStart: timing.domainLookupStart,
        domainLookupEnd: timing.domainLookupEnd,
        connectStart: timing.connectStart,
        connectEnd: timing.connectEnd,
        secureConnectionStart: timing.secureConnectionStart,
        requestStart: timing.requestStart,
        responseStart: timing.responseStart,
        responseEnd: timing.responseEnd,
        domLoading: timing.domLoading,
        domInteractive: timing.domInteractive,
        domContentLoadedEventStart: timing.domContentLoadedEventStart,
        domContentLoadedEventEnd: timing.domContentLoadedEventEnd,
        domComplete: timing.domComplete,
        loadEventStart: timing.loadEventStart,
        loadEventEnd: timing.loadEventEnd,
        navigationType: navigation.type,
        redirectCount: navigation.redirectCount
      };
    };

    // Calculate derived metrics
    const timing = getNavigationTiming();
    const dns = timing.domainLookupEnd - timing.domainLookupStart;
    const tcp = timing.connectEnd - timing.connectStart;
    const request = timing.responseStart - timing.requestStart;
    const response = timing.responseEnd - timing.responseStart;
    const processing = timing.domComplete - timing.domLoading;
    const onload = timing.loadEventEnd - timing.loadEventStart;

    console.log('Navigation Timing:', {
      dns: `${dns}ms`,
      tcp: `${tcp}ms`,
      request: `${request}ms`,
      response: `${response}ms`,
      processing: `${processing}ms`,
      onload: `${onload}ms`
    });
  }

  private updateMetric(metric: keyof WebVitalsMetrics, value: number): void {
    if (!this.config.enabled) return;
    
    // Apply sampling
    if (Math.random() > this.config.samplingRate) {
      return;
    }

    this.metrics[metric] = value;
    
    // Check if we have all metrics
    if (this.hasAllMetrics()) {
      this.generateReport();
    }
    
    // Notify observers
    this.notifyObservers();
  }

  private hasAllMetrics(): boolean {
    const requiredMetrics: (keyof WebVitalsMetrics)[] = ['lcp', 'fid', 'cls', 'fcp', 'tti', 'tbt'];
    return requiredMetrics.every(metric => this.metrics[metric] !== undefined);
  }

  private generateReport(): PerformanceReport {
    const metrics = this.metrics as WebVitalsMetrics;
    const scores = this.calculateScores(metrics);
    const status = this.calculateStatus(metrics);
    const recommendations = this.generateRecommendations(metrics, status);
    
    const report: PerformanceReport = {
      metrics,
      scores,
      status,
      recommendations,
      timestamp: Date.now(),
      url: window.location.href,
      deviceInfo: this.deviceInfo
    };

    // Cache the report
    if (this.config.enableCaching) {
      this.cache.set('latest_report', { data: report, timestamp: Date.now() });
    }

    // Report if enabled and meets threshold
    if (this.config.enableReporting) {
      this.reportPerformance(report);
    }

    return report;
  }

  private calculateScores(metrics: WebVitalsMetrics): Record<keyof WebVitalsMetrics, number> {
    const scores: Record<keyof WebVitalsMetrics, number> = {
      lcp: 0,
      fid: 0,
      cls: 0,
      fcp: 0,
      tti: 0,
      tbt: 0
    };

    // Calculate scores based on thresholds (0-100 scale)
    Object.keys(metrics).forEach(metric => {
      const key = metric as keyof WebVitalsMetrics;
      const value = metrics[key];
      const threshold = WEB_VITALS_THRESHOLDS[key];
      
      if (value <= threshold.good) {
        scores[key] = 90 + (10 * (threshold.good - value) / threshold.good);
      } else if (value <= threshold.needsImprovement) {
        scores[key] = 50 + (40 * (threshold.needsImprovement - value) / (threshold.needsImprovement - threshold.good));
      } else {
        scores[key] = Math.max(0, 50 * (threshold.needsImprovement * 2 - value) / threshold.needsImprovement);
      }
    });

    return scores;
  }

  private calculateStatus(metrics: WebVitalsMetrics): Record<keyof WebVitalsMetrics, 'good' | 'needs_improvement' | 'poor'> {
    const status: Record<keyof WebVitalsMetrics, 'good' | 'needs_improvement' | 'poor'> = {
      lcp: 'good',
      fid: 'good',
      cls: 'good',
      fcp: 'good',
      tti: 'good',
      tbt: 'good'
    };

    Object.keys(metrics).forEach(metric => {
      const key = metric as keyof WebVitalsMetrics;
      const value = metrics[key];
      const threshold = WEB_VITALS_THRESHOLDS[key];
      
      if (value <= threshold.good) {
        status[key] = 'good';
      } else if (value <= threshold.needsImprovement) {
        status[key] = 'needs_improvement';
      } else {
        status[key] = 'poor';
      }
    });

    return status;
  }

  private generateRecommendations(
    metrics: WebVitalsMetrics, 
    status: Record<keyof WebVitalsMetrics, 'good' | 'needs_improvement' | 'poor'>
  ): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = [];

    Object.keys(status).forEach(metric => {
      const key = metric as keyof WebVitalsMetrics;
      if (status[key] !== 'good') {
        const strategies = OPTIMIZATION_STRATEGIES[key] || [];
        strategies.forEach(strategy => {
          recommendations.push({
            ...strategy,
            metric: key
          });
        });
      }
    });

    // Sort by priority and impact
    return recommendations.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  }

  private reportPerformance(report: PerformanceReport): void {
    // Send to analytics or logging service
    console.log('Performance Report:', report);
    
    // Could integrate with A/B testing framework
    // this.abTestingTracker?.track('web_vitals_report', {
    //   metrics: report.metrics,
    //   scores: report.scores,
    //   status: report.status,
    //   url: report.url
    // });
  }

  private notifyObservers(): void {
    if (this.hasAllMetrics()) {
      const metrics = this.metrics as WebVitalsMetrics;
      this.observers.forEach(callback => {
        callback(metrics);
      });
    }
  }

  // Public API methods
  subscribe(callback: (metrics: WebVitalsMetrics) => void): string {
    const id = `observer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.observers.set(id, callback);
    return id;
  }

  unsubscribe(id: string): void {
    this.observers.delete(id);
  }

  getMetrics(): Partial<WebVitalsMetrics> {
    return { ...this.metrics };
  }

  getLatestReport(): PerformanceReport | null {
    if (this.config.enableCaching) {
      const cached = this.cache.get('latest_report');
      if (cached && Date.now() - cached.timestamp < this.config.cacheTimeout) {
        return cached.data;
      }
    }
    
    if (this.hasAllMetrics()) {
      return this.generateReport();
    }
    
    return null;
  }

  getStatus(): Record<keyof WebVitalsMetrics, 'good' | 'needs_improvement' | 'poor'> | null {
    if (!this.hasAllMetrics()) return null;
    
    return this.calculateStatus(this.metrics as WebVitalsMetrics);
  }

  getOverallScore(): number {
    if (!this.hasAllMetrics()) return 0;
    
    const scores = this.calculateScores(this.metrics as WebVitalsMetrics);
    const values = Object.values(scores);
    return values.reduce((sum, score) => sum + score, 0) / values.length;
  }

  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  enable(): void {
    this.config.enabled = true;
    this.initializeMonitoring();
  }

  disable(): void {
    this.config.enabled = false;
  }

  // Utility methods
  static getThresholds(): PerformanceThresholds {
    return WEB_VITALS_THRESHOLDS;
  }

  static validateMetric(metric: keyof WebVitalsMetrics, value: number): {
    isValid: boolean;
    status: 'good' | 'needs_improvement' | 'poor';
    score: number;
  } {
    const threshold = WEB_VITALS_THRESHOLDS[metric];
    let status: 'good' | 'needs_improvement' | 'poor';
    let score: number;

    if (value <= threshold.good) {
      status = 'good';
      score = 90 + (10 * (threshold.good - value) / threshold.good);
    } else if (value <= threshold.needsImprovement) {
      status = 'needs_improvement';
      score = 50 + (40 * (threshold.needsImprovement - value) / (threshold.needsImprovement - threshold.good));
    } else {
      status = 'poor';
      score = Math.max(0, 50 * (threshold.needsImprovement * 2 - value) / threshold.needsImprovement);
    }

    return {
      isValid: !isNaN(value) && value >= 0,
      status,
      score
    };
  }
}

// Singleton instance
let webVitalsMonitor: CoreWebVitalsMonitor | null = null;

export function getWebVitalsMonitor(config?: Partial<PerformanceConfig>): CoreWebVitalsMonitor {
  if (!webVitalsMonitor) {
    webVitalsMonitor = new CoreWebVitalsMonitor(config);
  }
  return webVitalsMonitor;
}

export function initializeWebVitalsMonitor(config?: Partial<PerformanceConfig>): CoreWebVitalsMonitor {
  webVitalsMonitor = new CoreWebVitalsMonitor(config);
  return webVitalsMonitor;
}

export function destroyWebVitalsMonitor(): void {
  webVitalsMonitor = null;
}