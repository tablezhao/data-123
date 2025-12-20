/**
 * Performance Monitoring React Hooks
 * React hooks for comprehensive performance monitoring with real-time metrics and optimization tracking
 */

import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { getWebVitalsMonitor } from './core-web-vitals';
import { getResourceMonitor } from './resource-monitor';
import { PerformanceMetrics, PerformanceStatus, PerformanceReport } from './types';

// Performance context
interface PerformanceContextType {
  metrics: PerformanceMetrics | null;
  status: PerformanceStatus | null;
  report: PerformanceReport | null;
  isLoading: boolean;
  error: string | null;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

// Main performance hook
export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}

// Web Vitals hook
export function useWebVitals() {
  const [vitals, setVitals] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<Record<string, 'good' | 'needs_improvement' | 'poor'>>({});
  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(() => {
    const webVitalsMonitor = getWebVitalsMonitor();
    
    const updateVitals = () => {
      const metrics = webVitalsMonitor.getMetrics();
      const vitalsStatus = webVitalsMonitor.getStatus();
      
      setVitals(metrics);
      setStatus(vitalsStatus || {});
      
      // Calculate scores
      const newScores: Record<string, number> = {};
      Object.entries(metrics).forEach(([key, value]) => {
        if (typeof value === 'number' && !isNaN(value)) {
          const validation = webVitalsMonitor.constructor.prototype.constructor.validateMetric(key as any, value);
          newScores[key] = validation.score;
        }
      });
      setScores(newScores);
    };

    // Initial update
    updateVitals();
    
    // Subscribe to updates
    const subscriptionId = webVitalsMonitor.subscribe(updateVitals);
    
    return () => {
      webVitalsMonitor.unsubscribe(subscriptionId);
    };
  }, []);

  const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length || 0;

  return {
    vitals,
    status,
    scores,
    overallScore,
    isLoading: Object.keys(vitals).length === 0
  };
}

// Resource monitor hook
export function useResourceMonitor() {
  const [resources, setResources] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [slowResources, setSlowResources] = useState<any[]>([]);
  const [largeResources, setLargeResources] = useState<any[]>([]);

  useEffect(() => {
    const resourceMonitor = getResourceMonitor();
    
    const updateResources = () => {
      const allResources = resourceMonitor.getResources();
      const latestReport = resourceMonitor.getLatestReport();
      
      setResources(allResources);
      setReport(latestReport);
      setSlowResources(resourceMonitor.getSlowResources());
      setLargeResources(resourceMonitor.getLargeResources());
    };

    // Initial update
    updateResources();
    
    // Subscribe to updates
    const subscriptionId = resourceMonitor.subscribe(updateResources);
    
    return () => {
      resourceMonitor.unsubscribe(subscriptionId);
    };
  }, []);

  const getResourcesByType = useCallback((type: string) => {
    const resourceMonitor = getResourceMonitor();
    return resourceMonitor.getResourcesByType(type as any);
  }, []);

  const clearResources = useCallback(() => {
    const resourceMonitor = getResourceMonitor();
    resourceMonitor.clear();
    setResources([]);
    setReport(null);
    setSlowResources([]);
    setLargeResources([]);
  }, []);

  return {
    resources,
    report,
    slowResources,
    largeResources,
    getResourcesByType,
    clearResources,
    isLoading: resources.length === 0
  };
}

// Performance optimization hook
export function usePerformanceOptimizations() {
  const [optimizations, setOptimizations] = useState<any[]>([]);
  const [appliedOptimizations, setAppliedOptimizations] = useState<string[]>([]);
  const [pendingOptimizations, setPendingOptimizations] = useState<string[]>([]);

  useEffect(() => {
    // Simulate getting optimization recommendations
    const mockOptimizations = [
      {
        id: 'optimize-images',
        title: 'Optimize Images',
        description: 'Convert images to WebP format and implement lazy loading',
        impact: 'high',
        effort: 'medium',
        estimatedImprovement: { score: 15, lcp: 200 },
        status: 'pending'
      },
      {
        id: 'minimize-javascript',
        title: 'Minimize JavaScript',
        description: 'Remove unused code and implement code splitting',
        impact: 'high',
        effort: 'high',
        estimatedImprovement: { score: 20, tti: 300, fid: 50 },
        status: 'pending'
      },
      {
        id: 'optimize-fonts',
        title: 'Optimize Font Loading',
        description: 'Use font-display: swap and preload critical fonts',
        impact: 'medium',
        effort: 'low',
        estimatedImprovement: { score: 8, cls: 0.05 },
        status: 'applied'
      }
    ];

    setOptimizations(mockOptimizations);
    setPendingOptimizations(mockOptimizations.filter(opt => opt.status === 'pending').map(opt => opt.id));
    setAppliedOptimizations(mockOptimizations.filter(opt => opt.status === 'applied').map(opt => opt.id));
  }, []);

  const applyOptimization = useCallback((optimizationId: string) => {
    setOptimizations(prev => 
      prev.map(opt => 
        opt.id === optimizationId ? { ...opt, status: 'applied' } : opt
      )
    );
    setPendingOptimizations(prev => prev.filter(id => id !== optimizationId));
    setAppliedOptimizations(prev => [...prev, optimizationId]);
  }, []);

  const revertOptimization = useCallback((optimizationId: string) => {
    setOptimizations(prev => 
      prev.map(opt => 
        opt.id === optimizationId ? { ...opt, status: 'pending' } : opt
      )
    );
    setAppliedOptimizations(prev => prev.filter(id => id !== optimizationId));
    setPendingOptimizations(prev => [...prev, optimizationId]);
  }, []);

  return {
    optimizations,
    appliedOptimizations,
    pendingOptimizations,
    applyOptimization,
    revertOptimization
  };
}

// Performance budget hook
export function usePerformanceBudget() {
  const [budget, setBudget] = useState({
    webVitals: {
      lcp: 2500,
      fid: 100,
      cls: 0.1,
      fcp: 1800,
      tti: 3800,
      tbt: 200
    },
    resources: {
      totalSize: 2 * 1024 * 1024, // 2MB
      totalTransferSize: 1.5 * 1024 * 1024, // 1.5MB
      maxResources: 50
    },
    navigation: {
      ttfb: 600,
      loadTime: 3000
    }
  });

  const [budgetStatus, setBudgetStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const webVitalsMonitor = getWebVitalsMonitor();
    const resourceMonitor = getResourceMonitor();
    
    const checkBudget = () => {
      const vitals = webVitalsMonitor.getMetrics();
      const resources = resourceMonitor.getResources();
      const resourceReport = resourceMonitor.getLatestReport();
      
      const newStatus: Record<string, boolean> = {};
      
      // Check Web Vitals budget
      Object.entries(budget.webVitals).forEach(([metric, threshold]) => {
        const value = vitals[metric as keyof typeof vitals];
        if (typeof value === 'number') {
          newStatus[`webVitals.${metric}`] = value <= threshold;
        }
      });
      
      // Check resource budget
      if (resourceReport) {
        newStatus['resources.totalSize'] = resourceReport.summary.totalSize <= budget.resources.totalSize;
        newStatus['resources.totalTransferSize'] = resourceReport.summary.totalTransferSize <= budget.resources.totalTransferSize;
        newStatus['resources.maxResources'] = resourceReport.summary.totalResources <= budget.resources.maxResources;
      }
      
      setBudgetStatus(newStatus);
    };

    checkBudget();
    
    // Subscribe to updates
    const vitalsSubscription = webVitalsMonitor.subscribe(checkBudget);
    const resourceSubscription = resourceMonitor.subscribe(checkBudget);
    
    return () => {
      webVitalsMonitor.unsubscribe(vitalsSubscription);
      resourceMonitor.unsubscribe(resourceSubscription);
    };
  }, [budget]);

  const updateBudget = useCallback((newBudget: Partial<typeof budget>) => {
    setBudget(prev => ({ ...prev, ...newBudget }));
  }, []);

  const resetBudget = useCallback(() => {
    setBudget({
      webVitals: {
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        fcp: 1800,
        tti: 3800,
        tbt: 200
      },
      resources: {
        totalSize: 2 * 1024 * 1024,
        totalTransferSize: 1.5 * 1024 * 1024,
        maxResources: 50
      },
      navigation: {
        ttfb: 600,
        loadTime: 3000
      }
    });
  }, []);

  const isBudgetExceeded = useCallback(() => {
    return Object.values(budgetStatus).some(status => !status);
  }, [budgetStatus]);

  return {
    budget,
    budgetStatus,
    isBudgetExceeded,
    updateBudget,
    resetBudget
  };
}

// Performance comparison hook
export function usePerformanceComparison(baselineReport?: PerformanceReport) {
  const [comparison, setComparison] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    if (!baselineReport) return;

    const comparePerformance = () => {
      setIsComparing(true);
      
      const webVitalsMonitor = getWebVitalsMonitor();
      const resourceMonitor = getResourceMonitor();
      
      const currentVitals = webVitalsMonitor.getMetrics();
      const currentResources = resourceMonitor.getLatestReport();
      
      if (!currentVitals || !currentResources) {
        setIsComparing(false);
        return;
      }

      // Simple comparison logic
      const comparisonResult = {
        webVitals: {
          lcp: {
            baseline: baselineReport.metrics.webVitals.lcp,
            current: currentVitals.lcp || 0,
            change: (currentVitals.lcp || 0) - baselineReport.metrics.webVitals.lcp,
            changePercent: (((currentVitals.lcp || 0) - baselineReport.metrics.webVitals.lcp) / baselineReport.metrics.webVitals.lcp) * 100
          },
          fid: {
            baseline: baselineReport.metrics.webVitals.fid,
            current: currentVitals.fid || 0,
            change: (currentVitals.fid || 0) - baselineReport.metrics.webVitals.fid,
            changePercent: (((currentVitals.fid || 0) - baselineReport.metrics.webVitals.fid) / baselineReport.metrics.webVitals.fid) * 100
          },
          cls: {
            baseline: baselineReport.metrics.webVitals.cls,
            current: currentVitals.cls || 0,
            change: (currentVitals.cls || 0) - baselineReport.metrics.webVitals.cls,
            changePercent: (((currentVitals.cls || 0) - baselineReport.metrics.webVitals.cls) / baselineReport.metrics.webVitals.cls) * 100
          }
        },
        resources: {
          totalSize: {
            baseline: baselineReport.metrics.resources.reduce((sum, r) => sum + r.size, 0),
            current: currentResources.summary.totalSize,
            change: currentResources.summary.totalSize - baselineReport.metrics.resources.reduce((sum, r) => sum + r.size, 0),
            changePercent: ((currentResources.summary.totalSize - baselineReport.metrics.resources.reduce((sum, r) => sum + r.size, 0)) / baselineReport.metrics.resources.reduce((sum, r) => sum + r.size, 0)) * 100
          }
        }
      };

      setComparison(comparisonResult);
      setIsComparing(false);
    };

    comparePerformance();
    
    // Set up periodic comparison
    const interval = setInterval(comparePerformance, 5000);
    
    return () => clearInterval(interval);
  }, [baselineReport]);

  return {
    comparison,
    isComparing
  };
}

// Real-time performance monitoring hook
export function useRealtimePerformance() {
  const { vitals, status, scores, overallScore } = useWebVitals();
  const { resources, report, slowResources, largeResources } = useResourceMonitor();
  const { optimizations, appliedOptimizations, pendingOptimizations } = usePerformanceOptimizations();
  const { budget, budgetStatus, isBudgetExceeded } = usePerformanceBudget();

  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const newAlerts: any[] = [];

    // Check for performance issues
    if (overallScore < 50) {
      newAlerts.push({
        type: 'performance',
        severity: 'high',
        message: 'Overall performance score is below 50',
        metric: 'overall',
        value: overallScore
      });
    }

    // Check for budget exceeded
    if (isBudgetExceeded()) {
      newAlerts.push({
        type: 'budget',
        severity: 'medium',
        message: 'Performance budget exceeded',
        details: Object.entries(budgetStatus).filter(([_, status]) => !status)
      });
    }

    // Check for slow resources
    if (slowResources.length > 5) {
      newAlerts.push({
        type: 'resources',
        severity: 'medium',
        message: `${slowResources.length} slow resources detected`,
        count: slowResources.length
      });
    }

    // Check for large resources
    if (largeResources.length > 3) {
      newAlerts.push({
        type: 'resources',
        severity: 'low',
        message: `${largeResources.length} large resources detected`,
        count: largeResources.length
      });
    }

    setAlerts(newAlerts);
  }, [overallScore, isBudgetExceeded, slowResources, largeResources, budgetStatus]);

  const dismissAlert = useCallback((index: number) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
  }, []);

  return {
    vitals,
    status,
    scores,
    overallScore,
    resources,
    report,
    slowResources,
    largeResources,
    optimizations,
    appliedOptimizations,
    pendingOptimizations,
    budget,
    budgetStatus,
    isBudgetExceeded,
    alerts,
    dismissAlert
  };
}