/**
 * Resource Performance Monitoring
 * Comprehensive resource loading monitoring with network request tracking and optimization recommendations
 */

export interface ResourceMetrics {
  name: string;
  type: 'script' | 'stylesheet' | 'image' | 'font' | 'fetch' | 'xmlhttprequest' | 'other';
  size: number;
  transferSize: number;
  duration: number;
  startTime: number;
  responseEnd: number;
  status: number;
  cached: boolean;
  compressed: boolean;
  protocol: string;
  serverTiming?: Record<string, number>;
}

export interface ResourceReport {
  resources: ResourceMetrics[];
  summary: {
    totalResources: number;
    totalSize: number;
    totalTransferSize: number;
    totalDuration: number;
    cachedResources: number;
    compressedResources: number;
    slowResources: number;
    failedResources: number;
  };
  recommendations: ResourceRecommendation[];
  timestamp: number;
  url: string;
}

export interface ResourceRecommendation {
  type: 'size' | 'compression' | 'caching' | 'delivery' | 'optimization';
  resource: string;
  issue: string;
  impact: 'high' | 'medium' | 'low';
  suggestion: string;
  priority: number;
  potentialSavings: {
    size?: number;
    time?: number;
    transferSize?: number;
  };
}

export interface ResourceMonitorConfig {
  enabled: boolean;
  samplingRate: number;
  slowResourceThreshold: number; // ms
  largeResourceThreshold: number; // bytes
  enableCompressionCheck: boolean;
  enableCachingCheck: boolean;
  enableOptimization: boolean;
  reportThreshold: number;
}

const DEFAULT_CONFIG: ResourceMonitorConfig = {
  enabled: true,
  samplingRate: 1.0,
  slowResourceThreshold: 1000,
  largeResourceThreshold: 100 * 1024, // 100KB
  enableCompressionCheck: true,
  enableCachingCheck: true,
  enableOptimization: true,
  reportThreshold: 100
};

export class ResourceMonitor {
  private resources: ResourceMetrics[] = [];
  private config: ResourceMonitorConfig;
  private observers: Map<string, (resources: ResourceMetrics[]) => void> = new Map();
  private cache: Map<string, ResourceReport> = new Map();

  constructor(config: Partial<ResourceMonitorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    if (this.config.enabled) {
      this.initializeMonitoring();
    }
  }

  private initializeMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Set up PerformanceObserver for resource timing
    this.setupResourceObserver();
    
    // Monitor existing resources
    this.monitorExistingResources();
    
    // Set up periodic reporting
    this.setupPeriodicReporting();
  }

  private setupResourceObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            this.processResourceEntry(entry as PerformanceResourceTiming);
          }
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.warn('Failed to set up resource observer:', e);
    }
  }

  private processResourceEntry(entry: PerformanceResourceTiming): void {
    if (!this.config.enabled) return;
    
    // Apply sampling
    if (Math.random() > this.config.samplingRate) {
      return;
    }

    const resource = this.parseResourceEntry(entry);
    this.resources.push(resource);
    
    // Check for slow resources and generate alerts
    if (resource.duration > this.config.slowResourceThreshold) {
      this.handleSlowResource(resource);
    }
    
    // Check for large resources
    if (resource.size > this.config.largeResourceThreshold) {
      this.handleLargeResource(resource);
    }
    
    // Notify observers
    this.notifyObservers();
  }

  private parseResourceEntry(entry: PerformanceResourceTiming): ResourceMetrics {
    const url = new URL(entry.name);
    const name = url.pathname.split('/').pop() || entry.name;
    
    return {
      name,
      type: this.getResourceType(entry),
      size: entry.decodedBodySize || 0,
      transferSize: entry.transferSize || 0,
      duration: entry.duration,
      startTime: entry.startTime,
      responseEnd: entry.responseEnd,
      status: this.getStatusFromEntry(entry),
      cached: this.isCached(entry),
      compressed: this.isCompressed(entry),
      protocol: entry.nextHopProtocol || 'unknown',
      serverTiming: this.parseServerTiming(entry)
    };
  }

  private getResourceType(entry: PerformanceResourceTiming): ResourceMetrics['type'] {
    const initiatorType = entry.initiatorType;
    
    switch (initiatorType) {
      case 'script':
      case 'link':
        const url = new URL(entry.name);
        if (url.pathname.endsWith('.css')) return 'stylesheet';
        if (url.pathname.endsWith('.js')) return 'script';
        return 'other';
      case 'img':
        return 'image';
      case 'css':
        return 'stylesheet';
      case 'xmlhttprequest':
      case 'fetch':
        return 'fetch';
      default:
        // Determine type from file extension
        const url = new URL(entry.name);
        const pathname = url.pathname.toLowerCase();
        
        if (pathname.match(/\.(woff|woff2|ttf|otf|eot)$/)) return 'font';
        if (pathname.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) return 'image';
        if (pathname.endsWith('.css')) return 'stylesheet';
        if (pathname.endsWith('.js')) return 'script';
        if (pathname.match(/\/api\//)) return 'fetch';
        
        return 'other';
    }
  }

  private getStatusFromEntry(entry: PerformanceResourceTiming): number {
    // Try to determine HTTP status from timing
    if (entry.responseEnd === 0) return 0; // Failed
    if (entry.transferSize === 0 && entry.decodedBodySize > 0) return 200; // Cached
    return 200; // Assume success if we got data
  }

  private isCached(entry: PerformanceResourceTiming): boolean {
    return entry.transferSize === 0 && entry.decodedBodySize > 0;
  }

  private isCompressed(entry: PerformanceResourceTiming): boolean {
    return entry.transferSize > 0 && entry.transferSize < entry.encodedBodySize;
  }

  private parseServerTiming(entry: PerformanceResourceTiming): Record<string, number> | undefined {
    // This would require access to Server-Timing headers
    // For now, return undefined
    return undefined;
  }

  private monitorExistingResources(): void {
    if (typeof window === 'undefined') return;

    // Process already loaded resources
    const resourceEntries = performance.getEntriesByType('resource');
    resourceEntries.forEach(entry => {
      this.processResourceEntry(entry as PerformanceResourceTiming);
    });
  }

  private setupPeriodicReporting(): void {
    // Generate reports periodically
    setInterval(() => {
      if (this.resources.length > 0) {
        this.generateReport();
      }
    }, 30000); // Every 30 seconds

    // Generate report on page unload
    window.addEventListener('beforeunload', () => {
      this.generateReport();
    });
  }

  private handleSlowResource(resource: ResourceMetrics): void {
    console.warn(`Slow resource detected: ${resource.name} (${resource.duration.toFixed(2)}ms)`);
    
    // Could integrate with A/B testing framework
    // this.abTestingTracker?.track('slow_resource', {
    //   resource: resource.name,
    //   duration: resource.duration,
    //   type: resource.type
    // });
  }

  private handleLargeResource(resource: ResourceMetrics): void {
    console.warn(`Large resource detected: ${resource.name} (${(resource.size / 1024).toFixed(2)}KB)`);
    
    // Could integrate with A/B testing framework
    // this.abTestingTracker?.track('large_resource', {
    //   resource: resource.name,
    //   size: resource.size,
    //   type: resource.type
    // });
  }

  private generateRecommendations(resources: ResourceMetrics[]): ResourceRecommendation[] {
    const recommendations: ResourceRecommendation[] = [];
    
    resources.forEach(resource => {
      // Check for large resources
      if (resource.size > this.config.largeResourceThreshold) {
        recommendations.push({
          type: 'size',
          resource: resource.name,
          issue: `Large ${resource.type} resource (${(resource.size / 1024).toFixed(1)}KB)`,
          impact: resource.size > 500 * 1024 ? 'high' : 'medium',
          suggestion: 'Optimize resource size',
          priority: resource.size > 500 * 1024 ? 1 : 2,
          potentialSavings: {
            size: resource.size * 0.3 // Estimate 30% savings
          }
        });
      }

      // Check for slow resources
      if (resource.duration > this.config.slowResourceThreshold) {
        recommendations.push({
          type: 'delivery',
          resource: resource.name,
          issue: `Slow resource loading (${resource.duration.toFixed(0)}ms)`,
          impact: resource.duration > 2000 ? 'high' : 'medium',
          suggestion: 'Optimize resource delivery',
          priority: resource.duration > 2000 ? 1 : 3,
          potentialSavings: {
            time: resource.duration * 0.4 // Estimate 40% improvement
          }
        });
      }

      // Check for compression
      if (this.config.enableCompressionCheck && !resource.compressed && resource.transferSize > 0) {
        recommendations.push({
          type: 'compression',
          resource: resource.name,
          issue: 'Resource not compressed',
          impact: 'medium',
          suggestion: 'Enable gzip or brotli compression',
          priority: 2,
          potentialSavings: {
            transferSize: resource.transferSize * 0.6 // Estimate 60% compression
          }
        });
      }

      // Check for caching
      if (this.config.enableCachingCheck && !resource.cached && resource.type !== 'fetch') {
        recommendations.push({
          type: 'caching',
          resource: resource.name,
          issue: 'Resource not cached',
          impact: 'medium',
          suggestion: 'Implement proper caching headers',
          priority: 3,
          potentialSavings: {
            time: resource.duration * 0.8 // Estimate 80% improvement for cached resources
          }
        });
      }

      // Type-specific recommendations
      switch (resource.type) {
        case 'image':
          if (resource.name.match(/\.(png|jpg|jpeg)$/)) {
            recommendations.push({
              type: 'optimization',
              resource: resource.name,
              issue: 'Image not using modern format',
              impact: 'medium',
              suggestion: 'Convert to WebP or AVIF format',
              priority: 2,
              potentialSavings: {
                size: resource.size * 0.3
              }
            });
          }
          break;

        case 'font':
          if (resource.size > 50 * 1024) {
            recommendations.push({
              type: 'optimization',
              resource: resource.name,
              issue: 'Large font file',
              impact: 'low',
              suggestion: 'Subset font or use variable fonts',
              priority: 4,
              potentialSavings: {
                size: resource.size * 0.4
              }
            });
          }
          break;

        case 'script':
          if (resource.size > 100 * 1024) {
            recommendations.push({
              type: 'optimization',
              resource: resource.name,
              issue: 'Large JavaScript bundle',
              impact: 'high',
              suggestion: 'Code-split and lazy load JavaScript',
              priority: 1,
              potentialSavings: {
                size: resource.size * 0.5,
                time: resource.duration * 0.3
              }
            });
          }
          break;

        case 'stylesheet':
          if (resource.size > 50 * 1024) {
            recommendations.push({
              type: 'optimization',
              resource: resource.name,
              issue: 'Large CSS file',
              impact: 'medium',
              suggestion: 'Remove unused CSS and split critical CSS',
              priority: 2,
              potentialSavings: {
                size: resource.size * 0.4
              }
            });
          }
          break;
      }
    });

    // Sort by priority and impact
    return recommendations.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  }

  private generateReport(): ResourceReport {
    const summary = this.calculateSummary();
    const recommendations = this.generateRecommendations(this.resources);
    
    const report: ResourceReport = {
      resources: [...this.resources],
      summary,
      recommendations,
      timestamp: Date.now(),
      url: window.location.href
    };

    // Cache the report
    this.cache.set('latest_report', report);
    
    // Clear old resources (keep last 100)
    if (this.resources.length > 100) {
      this.resources = this.resources.slice(-100);
    }

    return report;
  }

  private calculateSummary() {
    const totalResources = this.resources.length;
    const totalSize = this.resources.reduce((sum, r) => sum + r.size, 0);
    const totalTransferSize = this.resources.reduce((sum, r) => sum + r.transferSize, 0);
    const totalDuration = this.resources.reduce((sum, r) => sum + r.duration, 0);
    const cachedResources = this.resources.filter(r => r.cached).length;
    const compressedResources = this.resources.filter(r => r.compressed).length;
    const slowResources = this.resources.filter(r => r.duration > this.config.slowResourceThreshold).length;
    const failedResources = this.resources.filter(r => r.status >= 400).length;

    return {
      totalResources,
      totalSize,
      totalTransferSize,
      totalDuration,
      cachedResources,
      compressedResources,
      slowResources,
      failedResources
    };
  }

  private notifyObservers(): void {
    this.observers.forEach(callback => {
      callback([...this.resources]);
    });
  }

  // Public API methods
  subscribe(callback: (resources: ResourceMetrics[]) => void): string {
    const id = `observer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.observers.set(id, callback);
    return id;
  }

  unsubscribe(id: string): void {
    this.observers.delete(id);
  }

  getResources(): ResourceMetrics[] {
    return [...this.resources];
  }

  getLatestReport(): ResourceReport | null {
    return this.cache.get('latest_report') || null;
  }

  getResourcesByType(type: ResourceMetrics['type']): ResourceMetrics[] {
    return this.resources.filter(r => r.type === type);
  }

  getSlowResources(threshold?: number): ResourceMetrics[] {
    const limit = threshold || this.config.slowResourceThreshold;
    return this.resources.filter(r => r.duration > limit);
  }

  getLargeResources(threshold?: number): ResourceMetrics[] {
    const limit = threshold || this.config.largeResourceThreshold;
    return this.resources.filter(r => r.size > limit);
  }

  getCachedResources(): ResourceMetrics[] {
    return this.resources.filter(r => r.cached);
  }

  getCompressedResources(): ResourceMetrics[] {
    return this.resources.filter(r => r.compressed);
  }

  getFailedResources(): ResourceMetrics[] {
    return this.resources.filter(r => r.status >= 400);
  }

  updateConfig(newConfig: Partial<ResourceMonitorConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  enable(): void {
    this.config.enabled = true;
    this.initializeMonitoring();
  }

  disable(): void {
    this.config.enabled = false;
  }

  clear(): void {
    this.resources = [];
    this.cache.clear();
  }

  // Utility methods
  static getResourceType(url: string, initiatorType?: string): ResourceMetrics['type'] {
    const pathname = new URL(url).pathname.toLowerCase();
    
    switch (initiatorType) {
      case 'script': return 'script';
      case 'link': return pathname.endsWith('.css') ? 'stylesheet' : 'other';
      case 'img': return 'image';
      case 'css': return 'stylesheet';
      case 'xmlhttprequest':
      case 'fetch': return 'fetch';
      default:
        if (pathname.match(/\.(woff|woff2|ttf|otf|eot)$/)) return 'font';
        if (pathname.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) return 'image';
        if (pathname.endsWith('.css')) return 'stylesheet';
        if (pathname.endsWith('.js')) return 'script';
        return 'other';
    }
  }

  static isSlowResource(duration: number, threshold: number = 1000): boolean {
    return duration > threshold;
  }

  static isLargeResource(size: number, threshold: number = 100 * 1024): boolean {
    return size > threshold;
  }
}

// Singleton instance
let resourceMonitor: ResourceMonitor | null = null;

export function getResourceMonitor(config?: Partial<ResourceMonitorConfig>): ResourceMonitor {
  if (!resourceMonitor) {
    resourceMonitor = new ResourceMonitor(config);
  }
  return resourceMonitor;
}

export function initializeResourceMonitor(config?: Partial<ResourceMonitorConfig>): ResourceMonitor {
  resourceMonitor = new ResourceMonitor(config);
  return resourceMonitor;
}

export function destroyResourceMonitor(): void {
  resourceMonitor = null;
}