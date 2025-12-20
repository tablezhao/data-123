/**
 * A/B Testing Framework Types
 * Comprehensive type definitions for experiment management and metrics tracking
 */

// User segmentation types
export interface UserSegment {
  id: string;
  name: string;
  criteria: {
    deviceType?: ('desktop' | 'tablet' | 'mobile')[];
    browser?: string[];
    os?: string[];
    screenSize?: {
      minWidth?: number;
      maxWidth?: number;
      minHeight?: number;
      maxHeight?: number;
    };
    userAgent?: string[];
    referrer?: string[];
    newVsReturning?: 'new' | 'returning' | 'both';
    geoLocation?: string[];
    customAttributes?: Record<string, any>;
  };
  weight: number; // 0-1, sum of all segments should be 1
}

// Experiment configuration
export interface Experiment {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'active' | 'paused' | 'completed';
  trafficAllocation: number; // 0-1, percentage of traffic to include
  segments: UserSegment[];
  variants: Variant[];
  primaryMetrics: string[];
  secondaryMetrics: string[];
  successCriteria: {
    minimumSampleSize: number;
    minimumEffectSize: number;
    statisticalPower: number;
    significanceLevel: number;
  };
  targeting: {
    pages: string[]; // URL patterns
    elements?: string[]; // CSS selectors
    events?: string[];
  };
  configuration: {
    randomizationUnit: 'user' | 'session' | 'pageview';
    stickiness: 'user' | 'session';
    attributionWindow: number; // hours
    cooldownPeriod: number; // hours between experiments
  };
}

// Experiment variants
export interface Variant {
  id: string;
  name: string;
  description: string;
  allocation: number; // 0-1, should sum to 1 across all variants
  changes: VariantChange[];
  configuration: Record<string, any>;
}

// Individual changes within a variant
export interface VariantChange {
  type: 'css' | 'html' | 'javascript' | 'redirect' | 'feature';
  selector?: string;
  property?: string;
  value?: string;
  content?: string;
  code?: string;
  url?: string;
  feature?: string;
  enabled?: boolean;
}

// Metrics tracking
export interface Metric {
  id: string;
  name: string;
  description: string;
  type: 'conversion' | 'engagement' | 'performance' | 'behavioral' | 'technical';
  category: 'primary' | 'secondary' | 'guardrail';
  calculation: 'count' | 'rate' | 'average' | 'median' | 'percentile' | 'ratio';
  unit?: string;
  event: string;
  filters?: MetricFilter[];
  aggregation: 'sum' | 'mean' | 'median' | 'count' | 'unique';
  window?: number; // time window in seconds
}

// Metric filters
export interface MetricFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'regex';
  value: any;
}

// Event tracking
export interface TrackedEvent {
  id: string;
  experimentId: string;
  variantId: string;
  userId: string;
  sessionId: string;
  eventName: string;
  eventType: string;
  timestamp: number;
  properties: Record<string, any>;
  context: {
    url: string;
    referrer: string;
    userAgent: string;
    screenSize: { width: number; height: number };
    viewport: { width: number; height: number };
    deviceType: string;
    browser: string;
    os: string;
    timezone: string;
    language: string;
  };
}

// Experiment results
export interface ExperimentResult {
  experimentId: string;
  variantResults: VariantResult[];
  summary: {
    totalUsers: number;
    totalSessions: number;
    totalEvents: number;
    startDate: Date;
    endDate: Date;
    duration: number; // days
    confidenceLevel: number;
  };
  statisticalAnalysis: StatisticalAnalysis;
  recommendations: Recommendation[];
}

// Results for individual variants
export interface VariantResult {
  variantId: string;
  users: number;
  sessions: number;
  events: number;
  metrics: Record<string, MetricResult>;
  confidenceIntervals: Record<string, ConfidenceInterval>;
  significanceTests: Record<string, SignificanceTest>;
}

// Individual metric results
export interface MetricResult {
  value: number;
  sampleSize: number;
  standardError: number;
  standardDeviation: number;
  min: number;
  max: number;
  median: number;
  percentile25: number;
  percentile75: number;
  outliers: number;
}

// Confidence intervals
export interface ConfidenceInterval {
  lower: number;
  upper: number;
  level: number;
  marginOfError: number;
}

// Statistical significance tests
export interface SignificanceTest {
  testType: 't_test' | 'chi_square' | 'mann_whitney' | 'bootstrap';
  pValue: number;
  isSignificant: boolean;
  effectSize: number;
  confidenceInterval: ConfidenceInterval;
  statisticalPower: number;
}

// Statistical analysis summary
export interface StatisticalAnalysis {
  overallSignificance: number;
  multipleComparisonCorrection: 'bonferroni' | 'holm' | 'fdr';
  familyWiseErrorRate: number;
  powerAnalysis: PowerAnalysis;
  assumptions: StatisticalAssumptions;
}

// Power analysis results
export interface PowerAnalysis {
  observedPower: number;
  requiredSampleSize: number;
  minimumDetectableEffect: number;
  earlyStopping: EarlyStoppingRule;
}

// Early stopping rules
export interface EarlyStoppingRule {
  enabled: boolean;
  type: 'efficacy' | 'futility' | 'both';
  boundaries: {
    efficacy: number;
    futility: number;
  };
  minimumSampleSize: number;
  maximumDuration: number;
}

// Statistical assumptions checking
export interface StatisticalAssumptions {
  normality: AssumptionTest;
  homogeneity: AssumptionTest;
  independence: AssumptionTest;
  sampleSize: AssumptionTest;
}

// Individual assumption test
export interface AssumptionTest {
  testName: string;
  pValue: number;
  isSatisfied: boolean;
  notes: string;
}

// Recommendations based on results
export interface Recommendation {
  type: 'implement' | 'reject' | 'continue' | 'investigate';
  variantId: string;
  metricId: string;
  confidence: number;
  reasoning: string;
  impact: {
    expected: number;
    range: [number, number];
    businessValue: string;
  };
  risks: string[];
  nextSteps: string[];
}

// User assignment to experiments
export interface UserAssignment {
  userId: string;
  experimentId: string;
  variantId: string;
  assignedAt: Date;
  status: 'active' | 'completed' | 'excluded';
  exclusionReason?: string;
  events: TrackedEvent[];
}

// Configuration for the A/B testing system
export interface ABTestingConfig {
  enabled: boolean;
  storage: {
    backend: 'local' | 'api' | 'hybrid';
    encryption: boolean;
    retention: number; // days
  };
  privacy: {
    anonymizeIp: boolean;
    respectDnt: boolean;
    cookieConsent: boolean;
    dataRetention: number; // days
  };
  performance: {
    maxExperiments: number;
    samplingRate: number;
    batchSize: number;
    flushInterval: number; // seconds
  };
  quality: {
    minimumExperimentDuration: number; // days
    minimumSampleSize: number;
    confidenceLevel: number;
    statisticalPower: number;
  };
}