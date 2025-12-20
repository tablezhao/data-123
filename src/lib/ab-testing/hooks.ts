/**
 * A/B Testing React Hooks
 * React hooks for seamless A/B testing integration with experiment tracking and variant management
 */

import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { Experiment, Variant } from './types';
import { getExperimentManager } from './experiment-manager';
import { getTracker } from './tracker';

// Context for A/B testing
interface ABTestingContextType {
  experimentManager: ReturnType<typeof getExperimentManager>;
  tracker: ReturnType<typeof getTracker>;
  userId: string;
}

const ABTestingContext = createContext<ABTestingContextType | null>(null);

// Main A/B testing hook
export function useABTesting() {
  const context = useContext(ABTestingContext);
  if (!context) {
    throw new Error('useABTesting must be used within an ABTestingProvider');
  }
  return context;
}

// Hook for individual experiment
export function useExperiment(experimentId: string) {
  const { experimentManager, tracker, userId } = useABTesting();
  const [variant, setVariant] = useState<Variant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const assignToExperiment = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const assignedVariant = experimentManager.assignToExperiment(userId, experimentId);
        setVariant(assignedVariant);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to assign to experiment');
        console.error('Experiment assignment error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    assignToExperiment();
  }, [experimentManager, userId, experimentId]);

  // Track experiment events
  const trackExperimentEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    if (variant) {
      tracker.trackExperimentEvent(experimentId, variant.id, eventName, properties);
    }
  }, [tracker, experimentId, variant]);

  // Track conversion
  const trackConversion = useCallback((conversionName: string, value?: number, properties?: Record<string, any>) => {
    if (variant) {
      tracker.trackExperimentEvent(experimentId, variant.id, 'conversion', {
        conversionName,
        value,
        ...properties
      });
    }
  }, [tracker, experimentId, variant]);

  return {
    variant,
    isLoading,
    error,
    trackExperimentEvent,
    trackConversion,
    experimentId,
    isInExperiment: !!variant,
    variantId: variant?.id || null
  };
}

// Hook for A/B test with automatic variant application
export function useABTest<T extends Record<string, any>>(
  experimentId: string,
  variants: Record<string, T>
) {
  const { variant, isLoading, error, trackExperimentEvent, trackConversion } = useExperiment(experimentId);
  
  // Get the current variant's configuration
  const currentVariant = variant ? variants[variant.id] : variants.control;
  
  // Track impression
  useEffect(() => {
    if (variant && !isLoading) {
      trackExperimentEvent('impression');
    }
  }, [variant, isLoading, trackExperimentEvent]);

  return {
    variant: currentVariant,
    variantId: variant?.id || 'control',
    isLoading,
    error,
    trackExperimentEvent,
    trackConversion,
    isInExperiment: !!variant
  };
}

// Hook for tracking specific metrics
export function useMetricTracking(metricName: string) {
  const { tracker } = useABTesting();
  
  const trackMetric = useCallback((value: number, properties?: Record<string, any>) => {
    tracker.track(metricName, { value, ...properties });
  }, [tracker, metricName]);

  const trackConversion = useCallback((conversionName: string, value?: number, properties?: Record<string, any>) => {
    tracker.trackConversion(conversionName, value, properties);
  }, [tracker]);

  return {
    trackMetric,
    trackConversion
  };
}

// Hook for Web Vitals tracking
export function useWebVitalsTracking() {
  const { tracker } = useABTesting();
  const [vitals, setVitals] = useState<Record<string, number>>({});

  useEffect(() => {
    // This would integrate with the web-vitals library
    // For now, we'll create a placeholder implementation
    
    const updateVital = (name: string, value: number) => {
      setVitals(prev => ({ ...prev, [name]: value }));
      tracker.track(`web_vitals_${name}`, { value });
    };

    // Simulate Web Vitals (in real implementation, use web-vitals library)
    const simulateVitals = () => {
      // LCP (Largest Contentful Paint)
      setTimeout(() => updateVital('lcp', Math.random() * 3000 + 1000), 2000);
      
      // FID (First Input Delay)
      setTimeout(() => updateVital('fid', Math.random() * 200 + 50), 1000);
      
      // CLS (Cumulative Layout Shift)
      setTimeout(() => updateVital('cls', Math.random() * 0.3), 3000);
      
      // FCP (First Contentful Paint)
      setTimeout(() => updateVital('fcp', Math.random() * 2000 + 800), 1500);
      
      // TTI (Time to Interactive)
      setTimeout(() => updateVital('tti', Math.random() * 4000 + 2000), 4000);
      
      // TBT (Total Blocking Time)
      setTimeout(() => updateVital('tbt', Math.random() * 500 + 100), 2500);
    };

    simulateVitals();
  }, [tracker]);

  return { vitals };
}

// Hook for user engagement tracking
export function useEngagementTracking() {
  const { tracker } = useABTesting();
  const [engagementMetrics, setEngagementMetrics] = useState({
    sessionDuration: 0,
    pageViews: 0,
    interactions: 0,
    scrollDepth: 0
  });

  useEffect(() => {
    let startTime = Date.now();
    let interactions = 0;
    let maxScrollDepth = 0;

    // Track interactions
    const handleInteraction = () => {
      interactions++;
      tracker.track('interaction');
      setEngagementMetrics(prev => ({ ...prev, interactions }));
    };

    // Track scroll depth
    const handleScroll = () => {
      const scrollDepth = Math.round(
        (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100
      );
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        setEngagementMetrics(prev => ({ ...prev, scrollDepth: maxScrollDepth }));
        tracker.track('scroll', { depth: scrollDepth, maxDepth: maxScrollDepth });
      }
    };

    // Add event listeners
    document.addEventListener('click', handleInteraction);
    document.addEventListener('scroll', handleScroll);

    // Track page views
    tracker.track('page_view', {
      url: window.location.href,
      title: document.title
    });

    // Update metrics periodically
    const interval = setInterval(() => {
      const sessionDuration = Math.round((Date.now() - startTime) / 1000);
      setEngagementMetrics(prev => ({
        ...prev,
        sessionDuration,
        pageViews: prev.pageViews + 1
      }));
    }, 1000);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, [tracker]);

  return { engagementMetrics };
}

// Hook for error tracking
export function useErrorTracking() {
  const { tracker } = useABTesting();
  const [errors, setErrors] = useState<Array<{ message: string; timestamp: number }>>([]);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const error = {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: Date.now()
      };
      
      setErrors(prev => [...prev, { message: event.message, timestamp: Date.now() }]);
      tracker.track('js_error', error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = {
        type: 'unhandled_rejection',
        reason: event.reason,
        timestamp: Date.now()
      };
      
      setErrors(prev => [...prev, { message: 'Unhandled Promise Rejection', timestamp: Date.now() }]);
      tracker.track('js_error', error);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [tracker]);

  return { errors };
}

// Hook for experiment results analysis
export function useExperimentResults(experimentId: string) {
  const { experimentManager } = useABTesting();
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const experimentResults = await experimentManager.getExperimentResults(experimentId);
        setResults(experimentResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch experiment results');
        console.error('Experiment results error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [experimentManager, experimentId]);

  return {
    results,
    isLoading,
    error
  };
}

// Hook for multi-variant testing
export function useMultiExperiment(experimentIds: string[]) {
  const experiments = experimentIds.map(experimentId => useExperiment(experimentId));
  
  const allVariants = experiments.reduce((acc, exp) => {
    if (exp.variant) {
      acc[exp.experimentId] = exp.variant;
    }
    return acc;
  }, {} as Record<string, Variant>);

  const trackMultiExperimentEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    experiments.forEach(exp => {
      if (exp.variant) {
        exp.trackExperimentEvent(eventName, properties);
      }
    });
  }, [experiments]);

  return {
    variants: allVariants,
    experiments,
    trackMultiExperimentEvent,
    activeExperiments: experiments.filter(exp => exp.isInExperiment).length
  };
}

// Hook for feature flag management
export function useFeatureFlags(features: Record<string, boolean>) {
  const { experimentManager, userId } = useABTesting();
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>(features);

  useEffect(() => {
    const activeExperiments = experimentManager.getActiveExperiments(userId);
    
    activeExperiments.forEach(experiment => {
      const assignment = experimentManager.assignToExperiment(userId, experiment.id);
      if (assignment) {
        // Apply feature flags based on experiment variant
        experiment.variants.forEach(variant => {
          variant.changes.forEach(change => {
            if (change.type === 'feature' && change.feature && change.enabled !== undefined) {
              setFeatureFlags(prev => ({
                ...prev,
                [change.feature]: change.enabled
              }));
            }
          });
        });
      }
    });
  }, [experimentManager, userId, features]);

  const isFeatureEnabled = useCallback((featureName: string): boolean => {
    return featureFlags[featureName] || false;
  }, [featureFlags]);

  return {
    featureFlags,
    isFeatureEnabled
  };
}