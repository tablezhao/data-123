/**
 * A/B Testing Framework
 * Comprehensive A/B testing solution with React integration
 */

// Core exports
export * from './types';
export * from './metrics';
export * from './tracker';
export * from './experiment-manager';

// React hooks
export { useABTest, useExperiment, useABTesting } from './hooks';

// Utilities
export { ABTestingProvider } from './provider';

// Default configuration
export { DEFAULT_METRIC_CONFIG, CORE_WEB_VITALS_METRICS, CONVERSION_METRICS, ENGAGEMENT_METRICS, BEHAVIORAL_METRICS, TECHNICAL_METRICS } from './metrics';

// Main initialization function
export { initializeABTesting, getABTestingInstance } from './ab-testing';