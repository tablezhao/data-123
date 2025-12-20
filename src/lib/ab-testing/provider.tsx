/**
 * A/B Testing React Provider
 * React context provider for A/B testing framework with initialization and configuration management
 */

import React, { ReactNode, useEffect, useState } from 'react';
import { ABTestingContext } from './hooks';
import { getExperimentManager } from './experiment-manager';
import { getTracker, initializeTracker } from './tracker';
import { ABTestingConfig, Experiment } from './types';

interface ABTestingProviderProps {
  children: ReactNode;
  config?: Partial<ABTestingConfig>;
  experiments?: Experiment[];
  enableTracking?: boolean;
  enableExperiments?: boolean;
  onError?: (error: Error) => void;
}

export function ABTestingProvider({
  children,
  config = {},
  experiments = [],
  enableTracking = true,
  enableExperiments = true,
  onError
}: ABTestingProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize A/B testing system
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize tracker
        if (enableTracking) {
          initializeTracker(config);
        }

        // Initialize experiment manager
        if (enableExperiments) {
          const experimentManager = getExperimentManager();
          
          // Load experiments if provided
          if (experiments.length > 0) {
            experimentManager.loadExperiments(experiments);
          }
        }

        setIsInitialized(true);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize A/B testing');
        setError(error);
        onError?.(error);
        console.error('A/B Testing initialization error:', error);
      }
    };

    initialize();

    return () => {
      // Cleanup on unmount
      // Note: We don't destroy the singleton instances to preserve user assignments
    };
  }, [config, experiments, enableTracking, enableExperiments, onError]);

  // Get instances
  const tracker = getTracker();
  const experimentManager = getExperimentManager();
  const userId = tracker.getUserId();

  // Handle initialization errors
  if (error) {
    return (
      <div className="ab-testing-error">
        <h3>A/B Testing Initialization Error</h3>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    );
  }

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="ab-testing-loading">
        <div className="loading-spinner">Initializing A/B Testing...</div>
      </div>
    );
  }

  const contextValue = {
    experimentManager,
    tracker,
    userId
  };

  return (
    <ABTestingContext.Provider value={contextValue}>
      {children}
    </ABTestingContext.Provider>
  );
}

// Higher-order component for A/B testing
export function withABTesting<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    experiments?: Experiment[];
    config?: Partial<ABTestingConfig>;
  } = {}
) {
  const WrappedComponent = (props: P) => (
    <ABTestingProvider experiments={options.experiments} config={options.config}>
      <Component {...props} />
    </ABTestingProvider>
  );

  WrappedComponent.displayName = `withABTesting(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}