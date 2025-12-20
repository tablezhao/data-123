/**
 * A/B Testing Framework Demo
 * Comprehensive demonstration of A/B testing capabilities with real-time metrics and experiment management
 */

import React, { useState, useEffect } from 'react';
import { 
  ABTestingProvider, 
  useABTest, 
  useExperiment, 
  useWebVitalsTracking, 
  useEngagementTracking, 
  useErrorTracking,
  useExperimentResults,
  useFeatureFlags
} from '../../lib/ab-testing';
import { 
  EXAMPLE_EXPERIMENTS, 
  BUTTON_COLOR_EXPERIMENT, 
  HEADLINE_EXPERIMENT,
  QUICK_EXPERIMENTS
} from '../../lib/ab-testing/examples';
import { AB_TESTING_PRESETS } from '../../lib/ab-testing/ab-testing';
import { validateMetricValue } from '../../lib/ab-testing/metrics';
import { Card } from '../ui/EnhancedCard';
import { Button } from '../ui/EnhancedButton';
import { Input } from '../ui/EnhancedInput';

// Demo configuration
const DEMO_CONFIG = AB_TESTING_PRESETS.development;

// Main demo component
export function ABTestingDemo() {
  return (
    <ABTestingProvider 
      config={DEMO_CONFIG}
      experiments={EXAMPLE_EXPERIMENTS}
      onError={(error) => console.error('A/B Testing Error:', error)}
    >
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <DemoHeader />
          <ExperimentControls />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ButtonColorTest />
            <HeadlineTest />
          </div>
          <MetricsDashboard />
          <ExperimentResults />
          <QuickExperimentCreator />
        </div>
      </div>
    </ABTestingProvider>
  );
}

// Demo header with system status
function DemoHeader() {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    // Get system status
    const updateStatus = () => {
      // This would be replaced with actual status call
      setStatus({
        initialized: true,
        experiments: 6,
        activeExperiments: 4,
        config: DEMO_CONFIG
      });
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card variant="elevated" className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">A/B Testing Framework Demo</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive demonstration of A/B testing capabilities with real-time metrics tracking
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${status?.initialized ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">System Status</span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {status?.experiments} experiments • {status?.activeExperiments} active
          </div>
        </div>
      </div>
    </Card>
  );
}

// Experiment controls
function ExperimentControls() {
  const [selectedExperiment, setSelectedExperiment] = useState<string>('');
  const [isTracking, setIsTracking] = useState(true);

  const experiments = [
    { id: 'button-color-test', name: 'Button Color Test', status: 'active' },
    { id: 'headline-optimization', name: 'Headline Optimization', status: 'active' },
    { id: 'pricing-page-layout', name: 'Pricing Layout Test', status: 'draft' },
    { id: 'new-feature-rollout', name: 'Feature Rollout', status: 'active' },
    { id: 'performance-optimization', name: 'Performance Test', status: 'active' },
    { id: 'navigation-redesign', name: 'Navigation Redesign', status: 'draft' }
  ];

  return (
    <Card variant="outlined" className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Experiment Controls</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Experiment
          </label>
          <select
            value={selectedExperiment}
            onChange={(e) => setSelectedExperiment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose an experiment...</option>
            {experiments.map(exp => (
              <option key={exp.id} value={exp.id}>
                {exp.name} ({exp.status})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tracking Status
          </label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsTracking(!isTracking)}
              className={`px-4 py-2 rounded-md font-medium ${
                isTracking 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}
            >
              {isTracking ? 'Tracking Active' : 'Tracking Paused'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Actions
          </label>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              Export Data
            </Button>
            <Button variant="outline" size="sm">
              Reset Experiments
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Button color A/B test
function ButtonColorTest() {
  const { variant, variantId, isLoading, error, trackConversion } = useABTest(
    'button-color-test',
    {
      control: { color: 'blue', text: 'Get Started' },
      green: { color: 'green', text: 'Get Started' },
      red: { color: 'red', text: 'Get Started' }
    }
  );

  const handleClick = () => {
    trackConversion('button_click', 1, { 
      buttonColor: variant?.color,
      location: 'demo_section'
    });
  };

  if (isLoading) {
    return (
      <Card variant="ghost" className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="error" className="p-6">
        <div className="text-red-800">Error: {error}</div>
      </Card>
    );
  }

  const getButtonVariant = (color: string) => {
    switch (color) {
      case 'blue': return 'primary';
      case 'green': return 'success';
      case 'red': return 'destructive';
      default: return 'primary';
    }
  };

  return (
    <Card variant="elevated" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Button Color Test</h3>
        <div className="text-sm text-gray-600">
          Variant: <span className="font-medium">{variantId}</span>
        </div>
      </div>
      
      <p className="text-gray-600 mb-6">
        Testing different button colors to optimize conversion rates. Click the button to track engagement.
      </p>

      <div className="space-y-4">
        <Button
          variant={getButtonVariant(variant?.color || 'blue')}
          onClick={handleClick}
          className="w-full"
        >
          {variant?.text || 'Get Started'}
        </Button>
        
        <div className="text-sm text-gray-500">
          Current variant: <span className="font-medium capitalize">{variant?.color}</span> button
        </div>
      </div>
    </Card>
  );
}

// Headline A/B test
function HeadlineTest() {
  const { variant, variantId, isLoading, error, trackExperimentEvent } = useABTest(
    'headline-optimization',
    {
      control: {
        headline: 'Data Compliance Made Simple',
        subheadline: 'Streamline your data governance with our comprehensive platform'
      },
      'benefit-focused': {
        headline: 'Save Time and Reduce Risk with Automated Compliance',
        subheadline: 'Join thousands of companies who trust our platform'
      }
    }
  );

  useEffect(() => {
    trackExperimentEvent('headline_viewed');
  }, [trackExperimentEvent]);

  if (isLoading) {
    return (
      <Card variant="ghost" className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="error" className="p-6">
        <div className="text-red-800">Error: {error}</div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Headline Test</h3>
        <div className="text-sm text-gray-600">
          Variant: <span className="font-medium">{variantId}</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {variant?.headline}
        </h2>
        <p className="text-gray-600">
          {variant?.subheadline}
        </p>
        
        <div className="text-sm text-gray-500">
          Testing: <span className="font-medium">{variantId === 'control' ? 'Original' : 'Benefit-focused'}</span> messaging
        </div>
      </div>
    </Card>
  );
}

// Metrics dashboard
function MetricsDashboard() {
  const { vitals } = useWebVitalsTracking();
  const { engagementMetrics } = useEngagementTracking();
  const { errors } = useErrorTracking();

  const [metrics, setMetrics] = useState<Record<string, any>>({});

  useEffect(() => {
    // Simulate real-time metrics updates
    const updateMetrics = () => {
      setMetrics({
        conversion_rate: Math.random() * 0.1 + 0.02, // 2-12%
        click_through_rate: Math.random() * 0.05 + 0.01, // 1-6%
        bounce_rate: Math.random() * 0.4 + 0.2, // 20-60%
        session_duration: Math.random() * 300 + 60, // 60-360 seconds
        pages_per_session: Math.random() * 5 + 1, // 1-6 pages
        scroll_depth: Math.random() * 0.8 + 0.2, // 20-100%
        ...vitals
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 3000);
    return () => clearInterval(interval);
  }, [vitals]);

  const MetricCard = ({ title, value, unit, status }: { 
    title: string; 
    value: number; 
    unit?: string; 
    status?: 'good' | 'needs_improvement' | 'poor';
  }) => {
    const getStatusColor = () => {
      switch (status) {
        case 'good': return 'text-green-600 bg-green-50 border-green-200';
        case 'needs_improvement': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        case 'poor': return 'text-red-600 bg-red-50 border-red-200';
        default: return 'text-gray-600 bg-gray-50 border-gray-200';
      }
    };

    return (
      <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-2xl font-bold mt-1">
          {typeof value === 'number' ? value.toFixed(2) : value}
          {unit && <span className="text-sm ml-1">{unit}</span>}
        </div>
      </div>
    );
  };

  return (
    <Card variant="outlined" className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Real-time Metrics Dashboard</h2>
      
      <div className="space-y-6">
        {/* Web Vitals */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Core Web Vitals</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard 
              title="LCP" 
              value={metrics.lcp || 0} 
              unit="ms"
              status={validateMetricValue('lcp', metrics.lcp || 0).status}
            />
            <MetricCard 
              title="FID" 
              value={metrics.fid || 0} 
              unit="ms"
              status={validateMetricValue('fid', metrics.fid || 0).status}
            />
            <MetricCard 
              title="CLS" 
              value={metrics.cls || 0} 
              unit="score"
              status={validateMetricValue('cls', metrics.cls || 0).status}
            />
          </div>
        </div>

        {/* Conversion Metrics */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Conversion Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard 
              title="Conversion Rate" 
              value={metrics.conversion_rate * 100} 
              unit="%"
              status={validateMetricValue('conversion_rate', metrics.conversion_rate).status}
            />
            <MetricCard 
              title="Click-Through Rate" 
              value={metrics.click_through_rate * 100} 
              unit="%"
              status={validateMetricValue('click_through_rate', metrics.click_through_rate).status}
            />
            <MetricCard 
              title="Bounce Rate" 
              value={metrics.bounce_rate * 100} 
              unit="%"
              status={validateMetricValue('bounce_rate', metrics.bounce_rate).status}
            />
            <MetricCard 
              title="Pages/Session" 
              value={metrics.pages_per_session} 
              status="good"
            />
          </div>
        </div>

        {/* Engagement Metrics */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Engagement Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard 
              title="Session Duration" 
              value={engagementMetrics.sessionDuration} 
              unit="s"
              status={validateMetricValue('session_duration', engagementMetrics.sessionDuration).status}
            />
            <MetricCard 
              title="Scroll Depth" 
              value={engagementMetrics.scrollDepth * 100} 
              unit="%"
              status={validateMetricValue('scroll_depth', engagementMetrics.scrollDepth).status}
            />
            <MetricCard 
              title="Interactions" 
              value={engagementMetrics.interactions} 
              status="good"
            />
            <MetricCard 
              title="Page Views" 
              value={engagementMetrics.pageViews} 
              status="good"
            />
          </div>
        </div>

        {/* Error Tracking */}
        {errors.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Errors</h3>
            <div className="space-y-2">
              {errors.slice(-3).map((error, index) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-sm text-red-800">{error.message}</div>
                  <div className="text-xs text-red-600 mt-1">
                    {new Date(error.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// Experiment results
function ExperimentResults() {
  const { results, isLoading, error } = useExperimentResults('button-color-test');

  return (
    <Card variant="elevated" className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Experiment Results</h2>
      
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      ) : error ? (
        <div className="text-red-600">Error loading results: {error}</div>
      ) : results ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {results.variantResults.map((variant: any, index: number) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 capitalize">{variant.variantId}</h4>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <div>Users: {variant.users}</div>
                  <div>Sessions: {variant.sessions}</div>
                  <div>Events: {variant.events}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-sm text-gray-600">
            <p>Experiment Duration: {results.summary.duration} days</p>
            <p>Total Users: {results.summary.totalUsers}</p>
            <p>Confidence Level: {(results.summary.confidenceLevel * 100).toFixed(0)}%</p>
          </div>
        </div>
      ) : (
        <div className="text-gray-500">No results available yet</div>
      )}
    </Card>
  );
}

// Quick experiment creator
function QuickExperimentCreator() {
  const [experimentType, setExperimentType] = useState<'button' | 'headline'>('button');
  const [targetElement, setTargetElement] = useState('');
  const [variants, setVariants] = useState<string[]>(['#3b82f6', '#10b981']);
  const [headlines, setHeadlines] = useState<string[]>(['Original Headline', 'Test Headline']);

  const createQuickExperiment = () => {
    if (!targetElement) {
      alert('Please enter a target element selector');
      return;
    }

    let experiment;
    if (experimentType === 'button') {
      experiment = QUICK_EXPERIMENTS.buttonTest(targetElement, variants);
    } else {
      experiment = QUICK_EXPERIMENTS.headlineTest(targetElement, headlines);
    }

    console.log('Created experiment:', experiment);
    alert(`Created ${experimentType} experiment: ${experiment.id}`);
  };

  return (
    <Card variant="outlined" className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Experiment Creator</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experiment Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="button"
                checked={experimentType === 'button'}
                onChange={(e) => setExperimentType(e.target.value as 'button')}
                className="mr-2"
              />
              Button Color Test
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="headline"
                checked={experimentType === 'headline'}
                onChange={(e) => setExperimentType(e.target.value as 'headline')}
                className="mr-2"
              />
              Headline Test
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Element (CSS Selector)
          </label>
          <Input
            value={targetElement}
            onChange={(e) => setTargetElement(e.target.value)}
            placeholder={experimentType === 'button' ? '.my-button' : '.my-headline'}
          />
        </div>

        {experimentType === 'button' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Button Colors (comma-separated)
            </label>
            <Input
              value={variants.join(', ')}
              onChange={(e) => setVariants(e.target.value.split(',').map(c => c.trim()))}
              placeholder="#3b82f6, #10b981, #ef4444"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Headlines (one per line)
            </label>
            <textarea
              value={headlines.join('\n')}
              onChange={(e) => setHeadlines(e.target.value.split('\n').filter(h => h.trim()))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Original Headline\nTest Headline\nAnother Variant"
            />
          </div>
        )}

        <Button onClick={createQuickExperiment} variant="primary">
          Create Experiment
        </Button>
      </div>
    </Card>
  );
}

// Export for use in other components
export default ABTestingDemo;