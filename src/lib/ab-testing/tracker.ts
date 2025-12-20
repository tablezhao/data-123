/**
 * A/B Testing Event Tracker
 * Real-time event tracking with batching, privacy controls, and comprehensive metrics collection
 */

import { TrackedEvent, Metric, ABTestingConfig } from './types';
import { EVENT_NAMES, getMetricById } from './metrics';

// Tracker configuration
const DEFAULT_CONFIG: ABTestingConfig = {
  enabled: true,
  storage: {
    backend: 'hybrid',
    encryption: true,
    retention: 90 // days
  },
  privacy: {
    anonymizeIp: true,
    respectDnt: true,
    cookieConsent: true,
    dataRetention: 365 // days
  },
  performance: {
    maxExperiments: 10,
    samplingRate: 1.0,
    batchSize: 50,
    flushInterval: 30 // seconds
  },
  quality: {
    minimumExperimentDuration: 7, // days
    minimumSampleSize: 1000,
    confidenceLevel: 0.95,
    statisticalPower: 0.8
  }
};

// Event batching system
class EventBatcher {
  private batch: TrackedEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private config: ABTestingConfig;

  constructor(config: ABTestingConfig) {
    this.config = config;
    this.startFlushTimer();
  }

  addEvent(event: TrackedEvent): void {
    if (!this.config.enabled) return;
    
    // Apply sampling
    if (Math.random() > this.config.performance.samplingRate) {
      return;
    }

    this.batch.push(event);

    // Auto-flush if batch is full
    if (this.batch.length >= this.config.performance.batchSize) {
      this.flush();
    }
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.performance.flushInterval * 1000);
  }

  private async flush(): Promise<void> {
    if (this.batch.length === 0) return;

    const eventsToFlush = [...this.batch];
    this.batch = [];

    try {
      await this.sendEvents(eventsToFlush);
    } catch (error) {
      console.error('Failed to flush events:', error);
      // Retry logic could be implemented here
      // For now, we'll log the error and continue
    }
  }

  private async sendEvents(events: TrackedEvent[]): Promise<void> {
    // Implementation would depend on backend API
    // For now, we'll store in localStorage as a fallback
    const storageKey = 'ab_testing_events';
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updated = [...existing, ...events];
    
    localStorage.setItem(storageKey, JSON.stringify(updated));

    // In a real implementation, this would send to an analytics backend
    // await fetch('/api/analytics/events', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ events })
    // });
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }
}

// Main event tracker
export class ABTestingTracker {
  private config: ABTestingConfig;
  private batcher: EventBatcher;
  private sessionId: string;
  private userId: string;
  private experimentAssignments: Map<string, string> = new Map();

  constructor(config: Partial<ABTestingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.batcher = new EventBatcher(this.config);
    this.sessionId = this.generateSessionId();
    this.userId = this.getOrCreateUserId();
    
    this.initializeTracking();
  }

  private initializeTracking(): void {
    if (typeof window === 'undefined') return;

    // Check Do Not Track
    if (this.config.privacy.respectDnt && this.isDntEnabled()) {
      this.config.enabled = false;
      return;
    }

    // Check cookie consent
    if (this.config.privacy.cookieConsent && !this.hasCookieConsent()) {
      this.config.enabled = false;
      return;
    }

    // Set up automatic tracking
    this.setupAutomaticTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getOrCreateUserId(): string {
    const storageKey = 'ab_testing_user_id';
    let userId = localStorage.getItem(storageKey);
    
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(storageKey, userId);
    }
    
    return userId;
  }

  private isDntEnabled(): boolean {
    return navigator.doNotTrack === '1' || (window as any).doNotTrack === '1';
  }

  private hasCookieConsent(): boolean {
    return document.cookie.includes('cookie_consent=true');
  }

  private setupAutomaticTracking(): void {
    // Track page views
    this.trackPageView();
    
    // Track Web Vitals
    this.trackWebVitals();
    
    // Track user interactions
    this.trackUserInteractions();
    
    // Track errors
    this.trackErrors();
    
    // Track session end
    this.trackSessionEnd();
  }

  private trackPageView(): void {
    this.track(EVENT_NAMES.PAGE_VIEW, {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
      timestamp: Date.now()
    });
  }

  private trackWebVitals(): void {
    // This would integrate with a Web Vitals library
    // For now, we'll set up the structure
    
    // LCP tracking
    this.observeWebVital(EVENT_NAMES.LCP, (value: number) => {
      this.track(EVENT_NAMES.LCP, { value, unit: 'ms' });
    });
    
    // FID tracking
    this.observeWebVital(EVENT_NAMES.FID, (value: number) => {
      this.track(EVENT_NAMES.FID, { value, unit: 'ms' });
    });
    
    // CLS tracking
    this.observeWebVital(EVENT_NAMES.CLS, (value: number) => {
      this.track(EVENT_NAMES.CLS, { value, unit: 'score' });
    });
    
    // FCP tracking
    this.observeWebVital(EVENT_NAMES.FCP, (value: number) => {
      this.track(EVENT_NAMES.FCP, { value, unit: 'ms' });
    });
    
    // TTI tracking
    this.observeWebVital(EVENT_NAMES.TTI, (value: number) => {
      this.track(EVENT_NAMES.TTI, { value, unit: 'ms' });
    });
    
    // TBT tracking
    this.observeWebVital(EVENT_NAMES.TBT, (value: number) => {
      this.track(EVENT_NAMES.TBT, { value, unit: 'ms' });
    });
  }

  private observeWebVital(eventName: string, callback: (value: number) => void): void {
    // This would integrate with the web-vitals library
    // For now, we'll create a placeholder
    
    // In a real implementation:
    // import { getLCP, getFID, getCLS, getFCP, getTTI, getTBT } from 'web-vitals';
    // getLCP(callback);
    // getFID(callback);
    // etc.
  }

  private trackUserInteractions(): void {
    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const selector = this.getElementSelector(target);
      
      this.track(EVENT_NAMES.CLICK, {
        selector,
        tagName: target.tagName,
        textContent: target.textContent?.slice(0, 100), // Limit text length
        coordinates: { x: event.clientX, y: event.clientY },
        timestamp: Date.now()
      });
    });
    
    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      const selector = this.getElementSelector(form);
      
      this.track(EVENT_NAMES.FORM_SUBMIT, {
        selector,
        action: form.action,
        method: form.method,
        timestamp: Date.now()
      });
    });
    
    // Track scroll depth
    let maxScrollDepth = 0;
    const trackScroll = () => {
      const scrollDepth = Math.round(
        (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100
      );
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        this.track(EVENT_NAMES.SCROLL, {
          depth: scrollDepth,
          maxDepth: maxScrollDepth,
          timestamp: Date.now()
        });
      }
    };
    
    let scrollTimeout: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(trackScroll, 100);
    });
    
    // Track page exit
    window.addEventListener('beforeunload', () => {
      this.track(EVENT_NAMES.PAGE_EXIT, {
        timeOnPage: Date.now() - performance.timing.navigationStart,
        maxScrollDepth,
        timestamp: Date.now()
      });
    });
  }

  private trackErrors(): void {
    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      this.track(EVENT_NAMES.JS_ERROR, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.toString(),
        timestamp: Date.now()
      });
    });
    
    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.track(EVENT_NAMES.JS_ERROR, {
        type: 'unhandled_rejection',
        reason: event.reason,
        timestamp: Date.now()
      });
    });
  }

  private trackSessionEnd(): void {
    // Track session end on page unload
    window.addEventListener('beforeunload', () => {
      const sessionDuration = Date.now() - parseInt(this.sessionId.split('_')[1]);
      
      this.track(EVENT_NAMES.SESSION_END, {
        duration: sessionDuration,
        timestamp: Date.now()
      });
      
      // Flush any remaining events
      this.batcher.destroy();
    });
  }

  private getElementSelector(element: HTMLElement): string {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.length > 0);
      if (classes.length > 0) {
        return `${element.tagName.toLowerCase()}.${classes.join('.')}`;
      }
    }
    
    return element.tagName.toLowerCase();
  }

  // Public tracking methods
  track(eventName: string, properties: Record<string, any> = {}): void {
    if (!this.config.enabled) return;

    const event: TrackedEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      experimentId: '', // Will be set by experiment manager
      variantId: '', // Will be set by experiment manager
      userId: this.userId,
      sessionId: this.sessionId,
      eventName,
      eventType: this.getEventType(eventName),
      timestamp: Date.now(),
      properties,
      context: this.getEventContext()
    };

    this.batcher.addEvent(event);
  }

  trackConversion(conversionName: string, value?: number, properties: Record<string, any> = {}): void {
    this.track(EVENT_NAMES.CONVERSION, {
      conversionName,
      value,
      ...properties
    });
  }

  trackExperimentEvent(experimentId: string, variantId: string, eventName: string, properties: Record<string, any> = {}): void {
    const event: TrackedEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      experimentId,
      variantId,
      userId: this.userId,
      sessionId: this.sessionId,
      eventName,
      eventType: this.getEventType(eventName),
      timestamp: Date.now(),
      properties,
      context: this.getEventContext()
    };

    this.batcher.addEvent(event);
  }

  private getEventType(eventName: string): string {
    const metric = getMetricById(eventName);
    return metric?.type || 'custom';
  }

  private getEventContext(): TrackedEvent['context'] {
    return {
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenSize: {
        width: window.screen.width,
        height: window.screen.height
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      deviceType: this.getDeviceType(),
      browser: this.getBrowser(),
      os: this.getOS(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language
    };
  }

  private getDeviceType(): string {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Other';
  }

  private getOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Other';
  }

  // Experiment assignment tracking
  assignToExperiment(experimentId: string, variantId: string): void {
    this.experimentAssignments.set(experimentId, variantId);
    
    this.track('experiment_assignment', {
      experimentId,
      variantId,
      timestamp: Date.now()
    });
  }

  getExperimentAssignment(experimentId: string): string | undefined {
    return this.experimentAssignments.get(experimentId);
  }

  // Utility methods
  getUserId(): string {
    return this.userId;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  updateConfig(newConfig: Partial<ABTestingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.enabled !== undefined) {
      if (newConfig.enabled) {
        this.initializeTracking();
      }
    }
  }

  destroy(): void {
    this.batcher.destroy();
  }
}

// Singleton instance
let trackerInstance: ABTestingTracker | null = null;

export function getTracker(config?: Partial<ABTestingConfig>): ABTestingTracker {
  if (!trackerInstance) {
    trackerInstance = new ABTestingTracker(config);
  }
  return trackerInstance;
}

export function initializeTracker(config?: Partial<ABTestingConfig>): ABTestingTracker {
  if (trackerInstance) {
    trackerInstance.destroy();
  }
  trackerInstance = new ABTestingTracker(config);
  return trackerInstance;
}

export function destroyTracker(): void {
  if (trackerInstance) {
    trackerInstance.destroy();
    trackerInstance = null;
  }
}