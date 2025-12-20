/**
 * A/B Testing Metrics System
 * Comprehensive metrics tracking with Core Web Vitals, conversion tracking, and engagement metrics
 */

import { Metric, TrackedEvent, MetricResult } from './types';

// Core Web Vitals metrics
export const CORE_WEB_VITALS_METRICS: Metric[] = [
  {
    id: 'lcp',
    name: 'Largest Contentful Paint',
    description: 'Time when largest content element becomes visible',
    type: 'performance',
    category: 'primary',
    calculation: 'percentile',
    unit: 'milliseconds',
    event: 'web_vitals_lcp',
    aggregation: 'percentile',
    window: 300 // 5 minutes
  },
  {
    id: 'fid',
    name: 'First Input Delay',
    description: 'Time from first user interaction to browser response',
    type: 'performance',
    category: 'primary',
    calculation: 'percentile',
    unit: 'milliseconds',
    event: 'web_vitals_fid',
    aggregation: 'percentile',
    window: 300
  },
  {
    id: 'cls',
    name: 'Cumulative Layout Shift',
    description: 'Sum of individual layout shift scores',
    type: 'performance',
    category: 'primary',
    calculation: 'percentile',
    unit: 'score',
    event: 'web_vitals_cls',
    aggregation: 'percentile',
    window: 300
  },
  {
    id: 'fcp',
    name: 'First Contentful Paint',
    description: 'Time when first DOM content is painted',
    type: 'performance',
    category: 'secondary',
    calculation: 'percentile',
    unit: 'milliseconds',
    event: 'web_vitals_fcp',
    aggregation: 'percentile',
    window: 300
  },
  {
    id: 'tti',
    name: 'Time to Interactive',
    description: 'Time when page becomes fully interactive',
    type: 'performance',
    category: 'secondary',
    calculation: 'percentile',
    unit: 'milliseconds',
    event: 'web_vitals_tti',
    aggregation: 'percentile',
    window: 300
  },
  {
    id: 'tbt',
    name: 'Total Blocking Time',
    description: 'Sum of blocking time between FCP and TTI',
    type: 'performance',
    category: 'secondary',
    calculation: 'percentile',
    unit: 'milliseconds',
    event: 'web_vitals_tbt',
    aggregation: 'percentile',
    window: 300
  }
];

// Conversion metrics
export const CONVERSION_METRICS: Metric[] = [
  {
    id: 'conversion_rate',
    name: 'Conversion Rate',
    description: 'Percentage of users who complete desired action',
    type: 'conversion',
    category: 'primary',
    calculation: 'rate',
    unit: 'percentage',
    event: 'conversion',
    aggregation: 'count',
    window: 86400 // 24 hours
  },
  {
    id: 'click_through_rate',
    name: 'Click-Through Rate',
    description: 'Percentage of users who click on specific elements',
    type: 'engagement',
    category: 'primary',
    calculation: 'rate',
    unit: 'percentage',
    event: 'click',
    aggregation: 'count',
    window: 3600 // 1 hour
  },
  {
    id: 'bounce_rate',
    name: 'Bounce Rate',
    description: 'Percentage of users who leave after viewing one page',
    type: 'engagement',
    category: 'secondary',
    calculation: 'rate',
    unit: 'percentage',
    event: 'bounce',
    aggregation: 'count',
    window: 1800 // 30 minutes
  },
  {
    id: 'exit_rate',
    name: 'Exit Rate',
    description: 'Percentage of users who exit from specific pages',
    type: 'engagement',
    category: 'secondary',
    calculation: 'rate',
    unit: 'percentage',
    event: 'exit',
    aggregation: 'count',
    window: 1800
  },
  {
    id: 'form_completion_rate',
    name: 'Form Completion Rate',
    description: 'Percentage of users who complete forms',
    type: 'conversion',
    category: 'primary',
    calculation: 'rate',
    unit: 'percentage',
    event: 'form_submit',
    aggregation: 'count',
    window: 3600
  },
  {
    id: 'cart_abandonment_rate',
    name: 'Cart Abandonment Rate',
    description: 'Percentage of users who add items but don\'t purchase',
    type: 'conversion',
    category: 'primary',
    calculation: 'rate',
    unit: 'percentage',
    event: 'cart_abandon',
    aggregation: 'count',
    window: 86400
  }
];

// Engagement metrics
export const ENGAGEMENT_METRICS: Metric[] = [
  {
    id: 'session_duration',
    name: 'Session Duration',
    description: 'Average time users spend on site',
    type: 'engagement',
    category: 'primary',
    calculation: 'average',
    unit: 'seconds',
    event: 'session_end',
    aggregation: 'mean',
    window: 86400
  },
  {
    id: 'pages_per_session',
    name: 'Pages per Session',
    description: 'Average number of pages viewed per session',
    type: 'engagement',
    category: 'primary',
    calculation: 'average',
    unit: 'pages',
    event: 'page_view',
    aggregation: 'mean',
    window: 86400
  },
  {
    id: 'scroll_depth',
    name: 'Scroll Depth',
    description: 'Average percentage of page scrolled',
    type: 'engagement',
    category: 'secondary',
    calculation: 'average',
    unit: 'percentage',
    event: 'scroll',
    aggregation: 'mean',
    window: 3600
  },
  {
    id: 'time_on_page',
    name: 'Time on Page',
    description: 'Average time spent on individual pages',
    type: 'engagement',
    category: 'secondary',
    calculation: 'average',
    unit: 'seconds',
    event: 'page_exit',
    aggregation: 'mean',
    window: 3600
  },
  {
    id: 'interaction_rate',
    name: 'Interaction Rate',
    description: 'Rate of user interactions (clicks, taps, etc.)',
    type: 'engagement',
    category: 'secondary',
    calculation: 'rate',
    unit: 'interactions_per_minute',
    event: 'interaction',
    aggregation: 'mean',
    window: 3600
  },
  {
    id: 'return_visitor_rate',
    name: 'Return Visitor Rate',
    description: 'Percentage of users who return to the site',
    type: 'engagement',
    category: 'secondary',
    calculation: 'rate',
    unit: 'percentage',
    event: 'return_visit',
    aggregation: 'count',
    window: 604800 // 7 days
  }
];

// Behavioral metrics
export const BEHAVIORAL_METRICS: Metric[] = [
  {
    id: 'user_journey_completion',
    name: 'User Journey Completion',
    description: 'Rate of successful completion of key user journeys',
    type: 'behavioral',
    category: 'primary',
    calculation: 'rate',
    unit: 'percentage',
    event: 'journey_complete',
    aggregation: 'count',
    window: 86400
  },
  {
    id: 'feature_adoption_rate',
    name: 'Feature Adoption Rate',
    description: 'Rate of adoption for new features',
    type: 'behavioral',
    category: 'secondary',
    calculation: 'rate',
    unit: 'percentage',
    event: 'feature_use',
    aggregation: 'count',
    window: 604800
  },
  {
    id: 'error_rate',
    name: 'Error Rate',
    description: 'Rate of user errors or system errors',
    type: 'technical',
    category: 'guardrail',
    calculation: 'rate',
    unit: 'percentage',
    event: 'error',
    aggregation: 'count',
    window: 3600
  },
  {
    id: 'search_success_rate',
    name: 'Search Success Rate',
    description: 'Rate of successful search queries',
    type: 'behavioral',
    category: 'secondary',
    calculation: 'rate',
    unit: 'percentage',
    event: 'search_success',
    aggregation: 'count',
    window: 3600
  },
  {
    id: 'navigation_efficiency',
    name: 'Navigation Efficiency',
    description: 'Efficiency of user navigation (clicks to goal)',
    type: 'behavioral',
    category: 'secondary',
    calculation: 'average',
    unit: 'clicks',
    event: 'navigation_complete',
    aggregation: 'mean',
    window: 3600
  }
];

// Technical metrics
export const TECHNICAL_METRICS: Metric[] = [
  {
    id: 'page_load_time',
    name: 'Page Load Time',
    description: 'Time to fully load page content',
    type: 'technical',
    category: 'secondary',
    calculation: 'percentile',
    unit: 'milliseconds',
    event: 'page_load_complete',
    aggregation: 'percentile',
    window: 300
  },
  {
    id: 'api_response_time',
    name: 'API Response Time',
    description: 'Average API response time',
    type: 'technical',
    category: 'secondary',
    calculation: 'percentile',
    unit: 'milliseconds',
    event: 'api_response',
    aggregation: 'percentile',
    window: 300
  },
  {
    id: 'javascript_errors',
    name: 'JavaScript Errors',
    description: 'Number of JavaScript errors per session',
    type: 'technical',
    category: 'guardrail',
    calculation: 'count',
    unit: 'errors',
    event: 'js_error',
    aggregation: 'count',
    window: 3600
  },
  {
    id: 'memory_usage',
    name: 'Memory Usage',
    description: 'Average memory usage per session',
    type: 'technical',
    category: 'guardrail',
    calculation: 'average',
    unit: 'megabytes',
    event: 'memory_usage',
    aggregation: 'mean',
    window: 3600
  },
  {
    id: 'network_requests',
    name: 'Network Requests',
    description: 'Number of network requests per session',
    type: 'technical',
    category: 'secondary',
    calculation: 'average',
    unit: 'requests',
    event: 'network_request',
    aggregation: 'mean',
    window: 3600
  }
];

// Combine all metrics
export const ALL_METRICS: Metric[] = [
  ...CORE_WEB_VITALS_METRICS,
  ...CONVERSION_METRICS,
  ...ENGAGEMENT_METRICS,
  ...BEHAVIORAL_METRICS,
  ...TECHNICAL_METRICS
];

// Default metric configuration
export const DEFAULT_METRIC_CONFIG = {
  // Performance thresholds
  performanceThresholds: {
    lcp: { good: 2500, needsImprovement: 4000 }, // milliseconds
    fid: { good: 100, needsImprovement: 300 },
    cls: { good: 0.1, needsImprovement: 0.25 },
    fcp: { good: 1800, needsImprovement: 3000 },
    tti: { good: 3800, needsImprovement: 7300 },
    tbt: { good: 200, needsImprovement: 600 }
  },
  
  // Conversion thresholds
  conversionThresholds: {
    conversion_rate: { good: 0.05, needsImprovement: 0.02 }, // 5% vs 2%
    click_through_rate: { good: 0.03, needsImprovement: 0.01 },
    bounce_rate: { good: 0.3, needsImprovement: 0.6 }, // Lower is better
    exit_rate: { good: 0.2, needsImprovement: 0.4 },
    form_completion_rate: { good: 0.7, needsImprovement: 0.4 },
    cart_abandonment_rate: { good: 0.3, needsImprovement: 0.6 }
  },
  
  // Engagement thresholds
  engagementThresholds: {
    session_duration: { good: 180, needsImprovement: 60 }, // seconds
    pages_per_session: { good: 3, needsImprovement: 1.5 },
    scroll_depth: { good: 0.7, needsImprovement: 0.4 },
    time_on_page: { good: 120, needsImprovement: 30 },
    interaction_rate: { good: 2, needsImprovement: 0.5 },
    return_visitor_rate: { good: 0.3, needsImprovement: 0.15 }
  },
  
  // Statistical configuration
  statisticalConfig: {
    confidenceLevel: 0.95, // 95% confidence
    statisticalPower: 0.8, // 80% power
    minimumSampleSize: 1000,
    minimumExperimentDuration: 7, // days
    effectSizeThreshold: 0.05, // 5% minimum effect
    multipleComparisonCorrection: 'bonferroni'
  }
};

// Event name constants
export const EVENT_NAMES = {
  // Web Vitals
  LCP: 'web_vitals_lcp',
  FID: 'web_vitals_fid',
  CLS: 'web_vitals_cls',
  FCP: 'web_vitals_fcp',
  TTI: 'web_vitals_tti',
  TBT: 'web_vitals_tbt',
  
  // User interactions
  CLICK: 'click',
  FORM_SUBMIT: 'form_submit',
  CONVERSION: 'conversion',
  BOUNCE: 'bounce',
  EXIT: 'exit',
  SCROLL: 'scroll',
  INTERACTION: 'interaction',
  
  // Navigation
  PAGE_VIEW: 'page_view',
  PAGE_EXIT: 'page_exit',
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  RETURN_VISIT: 'return_visit',
  
  // Errors
  ERROR: 'error',
  JS_ERROR: 'js_error',
  API_ERROR: 'api_error',
  
  // Features
  FEATURE_USE: 'feature_use',
  JOURNEY_COMPLETE: 'journey_complete',
  SEARCH_SUCCESS: 'search_success',
  NAVIGATION_COMPLETE: 'navigation_complete',
  
  // Technical
  PAGE_LOAD_COMPLETE: 'page_load_complete',
  API_RESPONSE: 'api_response',
  MEMORY_USAGE: 'memory_usage',
  NETWORK_REQUEST: 'network_request'
} as const;

// Helper function to get metric by ID
export function getMetricById(metricId: string): Metric | undefined {
  return ALL_METRICS.find(metric => metric.id === metricId);
}

// Helper function to get metrics by type
export function getMetricsByType(type: Metric['type']): Metric[] {
  return ALL_METRICS.filter(metric => metric.type === type);
}

// Helper function to get metrics by category
export function getMetricsByCategory(category: Metric['category']): Metric[] {
  return ALL_METRICS.filter(metric => metric.category === category);
}

// Helper function to validate metric value against thresholds
export function validateMetricValue(metricId: string, value: number): {
  isGood: boolean;
  needsImprovement: boolean;
  status: 'good' | 'needs_improvement' | 'poor';
} {
  const metric = getMetricById(metricId);
  if (!metric) {
    return { isGood: false, needsImprovement: true, status: 'poor' };
  }
  
  const thresholds = DEFAULT_METRIC_CONFIG.performanceThresholds[metricId as keyof typeof DEFAULT_METRIC_CONFIG.performanceThresholds] ||
                    DEFAULT_METRIC_CONFIG.conversionThresholds[metricId as keyof typeof DEFAULT_METRIC_CONFIG.conversionThresholds] ||
                    DEFAULT_METRIC_CONFIG.engagementThresholds[metricId as keyof typeof DEFAULT_METRIC_CONFIG.engagementThresholds];
  
  if (!thresholds) {
    return { isGood: true, needsImprovement: false, status: 'good' };
  }
  
  const { good, needsImprovement } = thresholds as { good: number; needsImprovement: number };
  
  // For metrics where lower is better (bounce rate, error rate, etc.)
  const lowerIsBetter = ['bounce_rate', 'exit_rate', 'cart_abandonment_rate', 'error_rate'].includes(metricId);
  
  if (lowerIsBetter) {
    if (value <= good) {
      return { isGood: true, needsImprovement: false, status: 'good' };
    } else if (value <= needsImprovement) {
      return { isGood: false, needsImprovement: true, status: 'needs_improvement' };
    } else {
      return { isGood: false, needsImprovement: false, status: 'poor' };
    }
  } else {
    if (value >= good) {
      return { isGood: true, needsImprovement: false, status: 'good' };
    } else if (value >= needsImprovement) {
      return { isGood: false, needsImprovement: true, status: 'needs_improvement' };
    } else {
      return { isGood: false, needsImprovement: false, status: 'poor' };
    }
  }
}