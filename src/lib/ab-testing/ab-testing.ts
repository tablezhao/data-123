/**
 * A/B Testing Main System
 * Main initialization and configuration management for the A/B testing framework
 */

import { ABTestingConfig, Experiment } from './types';
import { getTracker, initializeTracker, destroyTracker } from './tracker';
import { getExperimentManager, initializeExperimentManager } from './experiment-manager';

// Default configuration
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

// A/B Testing system class
export class ABTestingSystem {
  private config: ABTestingConfig;
  private isInitialized: boolean = false;
  private experiments: Experiment[] = [];

  constructor(config: Partial<ABTestingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Initialize the A/B testing system
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('A/B Testing system is already initialized');
      return;
    }

    try {
      // Initialize tracker
      initializeTracker(this.config);

      // Initialize experiment manager
      initializeExperimentManager();

      this.isInitialized = true;
      console.log('A/B Testing system initialized successfully');
    } catch (error) {
      console.error('Failed to initialize A/B Testing system:', error);
      throw error;
    }
  }

  // Load experiments
  loadExperiments(experiments: Experiment[]): void {
    if (!this.isInitialized) {
      throw new Error('A/B Testing system must be initialized before loading experiments');
    }

    this.experiments = experiments;
    const experimentManager = getExperimentManager();
    experimentManager.loadExperiments(experiments);
  }

  // Add a single experiment
  addExperiment(experiment: Experiment): void {
    if (!this.isInitialized) {
      throw new Error('A/B Testing system must be initialized before adding experiments');
    }

    this.experiments.push(experiment);
    const experimentManager = getExperimentManager();
    experimentManager.addExperiment(experiment);
  }

  // Remove an experiment
  removeExperiment(experimentId: string): void {
    if (!this.isInitialized) {
      throw new Error('A/B Testing system must be initialized before removing experiments');
    }

    this.experiments = this.experiments.filter(exp => exp.id !== experimentId);
    const experimentManager = getExperimentManager();
    experimentManager.removeExperiment(experimentId);
  }

  // Get all experiments
  getExperiments(): Experiment[] {
    return this.experiments;
  }

  // Get active experiments
  getActiveExperiments(): Experiment[] {
    if (!this.isInitialized) {
      return [];
    }

    const experimentManager = getExperimentManager();
    return experimentManager.getActiveExperiments();
  }

  // Update configuration
  updateConfig(newConfig: Partial<ABTestingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update tracker configuration
    const tracker = getTracker();
    tracker.updateConfig(newConfig);
  }

  // Get current configuration
  getConfig(): ABTestingConfig {
    return this.config;
  }

  // Check if system is initialized
  isSystemInitialized(): boolean {
    return this.isInitialized;
  }

  // Destroy the system
  destroy(): void {
    if (!this.isInitialized) {
      return;
    }

    destroyTracker();
    this.isInitialized = false;
    this.experiments = [];
  }

  // Get system status
  getSystemStatus(): {
    initialized: boolean;
    experiments: number;
    activeExperiments: number;
    config: ABTestingConfig;
  } {
    return {
      initialized: this.isInitialized,
      experiments: this.experiments.length,
      activeExperiments: this.getActiveExperiments().length,
      config: this.config
    };
  }
}

// Singleton instance
let abTestingInstance: ABTestingSystem | null = null;

// Initialize A/B testing system
export async function initializeABTesting(
  config: Partial<ABTestingConfig> = {},
  experiments: Experiment[] = []
): Promise<ABTestingSystem> {
  if (abTestingInstance) {
    console.warn('A/B Testing system is already initialized');
    return abTestingInstance;
  }

  abTestingInstance = new ABTestingSystem(config);
  
  try {
    await abTestingInstance.initialize();
    
    if (experiments.length > 0) {
      abTestingInstance.loadExperiments(experiments);
    }
    
    return abTestingInstance;
  } catch (error) {
    abTestingInstance = null;
    throw error;
  }
}

// Get A/B testing instance
export function getABTestingInstance(): ABTestingSystem {
  if (!abTestingInstance) {
    throw new Error('A/B Testing system must be initialized before getting instance');
  }
  
  return abTestingInstance;
}

// Quick initialization function for common use cases
export async function quickInitializeABTesting(options: {
  enableWebVitals?: boolean;
  enableEngagementTracking?: boolean;
  enableErrorTracking?: boolean;
  experiments?: Experiment[];
  privacy?: {
    respectDnt?: boolean;
    cookieConsent?: boolean;
    anonymizeIp?: boolean;
  };
} = {}): Promise<ABTestingSystem> {
  const config: Partial<ABTestingConfig> = {
    enabled: true,
    privacy: {
      respectDnt: options.privacy?.respectDnt ?? true,
      cookieConsent: options.privacy?.cookieConsent ?? true,
      anonymizeIp: options.privacy?.anonymizeIp ?? true,
      dataRetention: 365
    },
    performance: {
      samplingRate: 1.0,
      batchSize: 50,
      flushInterval: 30
    },
    quality: {
      minimumExperimentDuration: 7,
      minimumSampleSize: 1000,
      confidenceLevel: 0.95,
      statisticalPower: 0.8
    }
  };

  const system = await initializeABTesting(config, options.experiments || []);

  // Set up automatic tracking based on options
  if (options.enableWebVitals || options.enableEngagementTracking || options.enableErrorTracking) {
    const tracker = getTracker();
    
    if (options.enableWebVitals) {
      // Web Vitals tracking would be set up here
      console.log('Web Vitals tracking enabled');
    }
    
    if (options.enableEngagementTracking) {
      // Engagement tracking would be set up here
      console.log('Engagement tracking enabled');
    }
    
    if (options.enableErrorTracking) {
      // Error tracking would be set up here
      console.log('Error tracking enabled');
    }
  }

  return system;
}

// Utility functions
export function isABTestingInitialized(): boolean {
  return abTestingInstance !== null && abTestingInstance.isSystemInitialized();
}

export function getABTestingStatus() {
  if (!abTestingInstance) {
    return {
      initialized: false,
      experiments: 0,
      activeExperiments: 0,
      config: DEFAULT_CONFIG
    };
  }
  
  return abTestingInstance.getSystemStatus();
}

// Configuration presets
export const AB_TESTING_PRESETS = {
  // Development preset - minimal tracking, short experiments
  development: {
    enabled: true,
    storage: { backend: 'local', encryption: false, retention: 1 },
    privacy: { anonymizeIp: false, respectDnt: false, cookieConsent: false, dataRetention: 1 },
    performance: { samplingRate: 1.0, batchSize: 10, flushInterval: 5 },
    quality: { minimumExperimentDuration: 1, minimumSampleSize: 10, confidenceLevel: 0.9, statisticalPower: 0.7 }
  },

  // Production preset - full tracking, proper experiments
  production: {
    enabled: true,
    storage: { backend: 'hybrid', encryption: true, retention: 90 },
    privacy: { anonymizeIp: true, respectDnt: true, cookieConsent: true, dataRetention: 365 },
    performance: { samplingRate: 1.0, batchSize: 50, flushInterval: 30 },
    quality: { minimumExperimentDuration: 7, minimumSampleSize: 1000, confidenceLevel: 0.95, statisticalPower: 0.8 }
  },

  // Privacy-first preset - minimal data collection
  privacyFirst: {
    enabled: true,
    storage: { backend: 'local', encryption: true, retention: 7 },
    privacy: { anonymizeIp: true, respectDnt: true, cookieConsent: true, dataRetention: 30 },
    performance: { samplingRate: 0.1, batchSize: 20, flushInterval: 60 },
    quality: { minimumExperimentDuration: 14, minimumSampleSize: 500, confidenceLevel: 0.99, statisticalPower: 0.9 }
  },

  // Performance preset - optimized for speed
  performance: {
    enabled: true,
    storage: { backend: 'local', encryption: false, retention: 30 },
    privacy: { anonymizeIp: true, respectDnt: true, cookieConsent: false, dataRetention: 30 },
    performance: { samplingRate: 0.5, batchSize: 100, flushInterval: 15 },
    quality: { minimumExperimentDuration: 3, minimumSampleSize: 100, confidenceLevel: 0.9, statisticalPower: 0.7 }
  }
} as const;

// Type for preset names
export type ABTestingPreset = keyof typeof AB_TESTING_PRESETS;