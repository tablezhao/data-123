/**
 * A/B Testing Examples
 * Example experiments demonstrating different A/B testing scenarios and configurations
 */

import { Experiment, Metric, UserSegment } from './types';
import { 
  CORE_WEB_VITALS_METRICS, 
  CONVERSION_METRICS, 
  ENGAGEMENT_METRICS 
} from './metrics';

// Example 1: Button Color Test
export const BUTTON_COLOR_EXPERIMENT: Experiment = {
  id: 'button-color-test',
  name: 'Button Color Impact on Conversion',
  description: 'Test different button colors to see which generates more clicks and conversions',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-02-01'),
  status: 'active',
  trafficAllocation: 0.5, // 50% of traffic
  segments: [
    {
      id: 'all-users',
      name: 'All Users',
      criteria: {},
      weight: 1.0
    }
  ],
  variants: [
    {
      id: 'control',
      name: 'Control (Blue)',
      description: 'Original blue button',
      allocation: 0.34,
      changes: [
        {
          type: 'css',
          selector: '.cta-button',
          property: 'background-color',
          value: '#3b82f6' // Blue
        }
      ],
      configuration: {
        buttonText: 'Get Started',
        buttonColor: 'blue'
      }
    },
    {
      id: 'green',
      name: 'Green Button',
      description: 'Green colored button',
      allocation: 0.33,
      changes: [
        {
          type: 'css',
          selector: '.cta-button',
          property: 'background-color',
          value: '#10b981' // Green
        }
      ],
      configuration: {
        buttonText: 'Get Started',
        buttonColor: 'green'
      }
    },
    {
      id: 'red',
      name: 'Red Button',
      description: 'Red colored button',
      allocation: 0.33,
      changes: [
        {
          type: 'css',
          selector: '.cta-button',
          property: 'background-color',
          value: '#ef4444' // Red
        }
      ],
      configuration: {
        buttonText: 'Get Started',
        buttonColor: 'red'
      }
    }
  ],
  primaryMetrics: ['conversion_rate', 'click_through_rate'],
  secondaryMetrics: ['bounce_rate', 'session_duration'],
  successCriteria: {
    minimumSampleSize: 1000,
    minimumEffectSize: 0.05, // 5% improvement
    statisticalPower: 0.8,
    significanceLevel: 0.05
  },
  targeting: {
    pages: ['/', '/pricing', '/features'],
    elements: ['.cta-button']
  },
  configuration: {
    randomizationUnit: 'user',
    stickiness: 'user',
    attributionWindow: 24, // hours
    cooldownPeriod: 7 // days
  }
};

// Example 2: Headline Test
export const HEADLINE_EXPERIMENT: Experiment = {
  id: 'headline-optimization',
  name: 'Homepage Headline Optimization',
  description: 'Test different homepage headlines to improve engagement and conversion',
  startDate: new Date('2024-01-15'),
  endDate: new Date('2024-03-15'),
  status: 'active',
  trafficAllocation: 0.6,
  segments: [
    {
      id: 'desktop-users',
      name: 'Desktop Users',
      criteria: {
        deviceType: ['desktop'],
        screenSize: { minWidth: 1024 }
      },
      weight: 0.7
    },
    {
      id: 'mobile-users',
      name: 'Mobile Users',
      criteria: {
        deviceType: ['mobile', 'tablet']
      },
      weight: 0.3
    }
  ],
  variants: [
    {
      id: 'control',
      name: 'Control Headline',
      description: 'Original headline',
      allocation: 0.5,
      changes: [
        {
          type: 'html',
          selector: '.hero-headline',
          content: 'Data Compliance Made Simple'
        }
      ],
      configuration: {
        headline: 'Data Compliance Made Simple',
        subheadline: 'Streamline your data governance with our comprehensive platform'
      }
    },
    {
      id: 'benefit-focused',
      name: 'Benefit-Focused Headline',
      description: 'Headline focused on benefits',
      allocation: 0.5,
      changes: [
        {
          type: 'html',
          selector: '.hero-headline',
          content: 'Save Time and Reduce Risk with Automated Compliance'
        }
      ],
      configuration: {
        headline: 'Save Time and Reduce Risk with Automated Compliance',
        subheadline: 'Join thousands of companies who trust our platform'
      }
    }
  ],
  primaryMetrics: ['session_duration', 'scroll_depth', 'conversion_rate'],
  secondaryMetrics: ['bounce_rate', 'pages_per_session'],
  successCriteria: {
    minimumSampleSize: 2000,
    minimumEffectSize: 0.1, // 10% improvement
    statisticalPower: 0.85,
    significanceLevel: 0.05
  },
  targeting: {
    pages: ['/'],
    elements: ['.hero-headline', '.hero-subheadline']
  },
  configuration: {
    randomizationUnit: 'user',
    stickiness: 'user',
    attributionWindow: 48,
    cooldownPeriod: 14
  }
};

// Example 3: Pricing Page Layout Test
export const PRICING_LAYOUT_EXPERIMENT: Experiment = {
  id: 'pricing-page-layout',
  name: 'Pricing Page Layout Optimization',
  description: 'Test different pricing page layouts to improve conversion',
  startDate: new Date('2024-02-01'),
  endDate: new Date('2024-04-01'),
  status: 'draft',
  trafficAllocation: 0.4,
  segments: [
    {
      id: 'returning-visitors',
      name: 'Returning Visitors',
      criteria: {
        newVsReturning: 'returning'
      },
      weight: 1.0
    }
  ],
  variants: [
    {
      id: 'control',
      name: 'Control Layout',
      description: 'Original pricing layout',
      allocation: 0.5,
      changes: [
        {
          type: 'css',
          selector: '.pricing-cards',
          property: 'flex-direction',
          value: 'row'
        }
      ],
      configuration: {
        layout: 'horizontal',
        highlightPlan: 'middle'
      }
    },
    {
      id: 'vertical',
      name: 'Vertical Layout',
      description: 'Stacked pricing cards',
      allocation: 0.5,
      changes: [
        {
          type: 'css',
          selector: '.pricing-cards',
          property: 'flex-direction',
          value: 'column'
        }
      ],
      configuration: {
        layout: 'vertical',
        highlightPlan: 'top'
      }
    }
  ],
  primaryMetrics: ['conversion_rate', 'form_completion_rate'],
  secondaryMetrics: ['time_on_page', 'scroll_depth'],
  successCriteria: {
    minimumSampleSize: 1500,
    minimumEffectSize: 0.08,
    statisticalPower: 0.8,
    significanceLevel: 0.05
  },
  targeting: {
    pages: ['/pricing']
  },
  configuration: {
    randomizationUnit: 'session',
    stickiness: 'session',
    attributionWindow: 24,
    cooldownPeriod: 7
  }
};

// Example 4: Feature Flag Test
export const FEATURE_FLAG_EXPERIMENT: Experiment = {
  id: 'new-feature-rollout',
  name: 'New Feature Gradual Rollout',
  description: 'Gradually roll out a new feature to monitor performance impact',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-06-01'),
  status: 'active',
  trafficAllocation: 0.2, // Start with 20% of users
  segments: [
    {
      id: 'beta-users',
      name: 'Beta Users',
      criteria: {
        customAttributes: { betaUser: true }
      },
      weight: 0.3
    },
    {
      id: 'power-users',
      name: 'Power Users',
      criteria: {
        customAttributes: { usageLevel: 'high' }
      },
      weight: 0.7
    }
  ],
  variants: [
    {
      id: 'control',
      name: 'Control (Feature Off)',
      description: 'Feature disabled',
      allocation: 0.5,
      changes: [
        {
          type: 'feature',
          feature: 'newDashboard',
          enabled: false
        }
      ],
      configuration: {
        featureEnabled: false
      }
    },
    {
      id: 'treatment',
      name: 'Treatment (Feature On)',
      description: 'Feature enabled',
      allocation: 0.5,
      changes: [
        {
          type: 'feature',
          feature: 'newDashboard',
          enabled: true
        }
      ],
      configuration: {
        featureEnabled: true
      }
    }
  ],
  primaryMetrics: ['feature_adoption_rate', 'user_journey_completion'],
  secondaryMetrics: ['error_rate', 'session_duration'],
  successCriteria: {
    minimumSampleSize: 500,
    minimumEffectSize: 0.15,
    statisticalPower: 0.8,
    significanceLevel: 0.05
  },
  targeting: {
    pages: ['/dashboard', '/app/*'],
    events: ['dashboard_view', 'feature_interaction']
  },
  configuration: {
    randomizationUnit: 'user',
    stickiness: 'user',
    attributionWindow: 72,
    cooldownPeriod: 0 // No cooldown for feature flags
  }
};

// Example 5: Performance Optimization Test
export const PERFORMANCE_EXPERIMENT: Experiment = {
  id: 'performance-optimization',
  name: 'Performance Optimization Impact',
  description: 'Test the impact of performance optimizations on user experience',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-02-15'),
  status: 'active',
  trafficAllocation: 0.5,
  segments: [
    {
      id: 'mobile-users',
      name: 'Mobile Users',
      criteria: {
        deviceType: ['mobile'],
        screenSize: { maxWidth: 768 }
      },
      weight: 1.0
    }
  ],
  variants: [
    {
      id: 'control',
      name: 'Control (No Optimization)',
      description: 'Original performance',
      allocation: 0.5,
      changes: [
        {
          type: 'javascript',
          code: 'window.performanceOptimization = false;'
        }
      ],
      configuration: {
        optimizationEnabled: false,
        lazyLoading: false,
        imageCompression: false
      }
    },
    {
      id: 'optimized',
      name: 'Performance Optimized',
      description: 'All optimizations enabled',
      allocation: 0.5,
      changes: [
        {
          type: 'javascript',
          code: 'window.performanceOptimization = true;'
        }
      ],
      configuration: {
        optimizationEnabled: true,
        lazyLoading: true,
        imageCompression: true
      }
    }
  ],
  primaryMetrics: ['lcp', 'fid', 'cls', 'tti'],
  secondaryMetrics: ['bounce_rate', 'session_duration', 'conversion_rate'],
  successCriteria: {
    minimumSampleSize: 2000,
    minimumEffectSize: 0.1,
    statisticalPower: 0.8,
    significanceLevel: 0.05
  },
  targeting: {
    pages: ['/*'] // All pages
  },
  configuration: {
    randomizationUnit: 'user',
    stickiness: 'user',
    attributionWindow: 24,
    cooldownPeriod: 7
  }
};

// Example 6: Navigation Test
export const NAVIGATION_EXPERIMENT: Experiment = {
  id: 'navigation-redesign',
  name: 'Navigation Menu Redesign',
  description: 'Test a redesigned navigation menu for better user experience',
  startDate: new Date('2024-02-15'),
  endDate: new Date('2024-05-15'),
  status: 'draft',
  trafficAllocation: 0.3,
  segments: [
    {
      id: 'all-desktop',
      name: 'All Desktop Users',
      criteria: {
        deviceType: ['desktop'],
        screenSize: { minWidth: 1024 }
      },
      weight: 1.0
    }
  ],
  variants: [
    {
      id: 'control',
      name: 'Control Navigation',
      description: 'Original navigation menu',
      allocation: 0.5,
      changes: [
        {
          type: 'css',
          selector: '.main-nav',
          property: 'display',
          value: 'flex'
        }
      ],
      configuration: {
        navigationType: 'horizontal',
        menuItems: ['Home', 'Features', 'Pricing', 'About', 'Contact']
      }
    },
    {
      id: 'sidebar',
      name: 'Sidebar Navigation',
      description: 'Sidebar navigation menu',
      allocation: 0.5,
      changes: [
        {
          type: 'css',
          selector: '.main-nav',
          property: 'flex-direction',
          value: 'column'
        },
        {
          type: 'css',
          selector: '.main-nav',
          property: 'position',
          value: 'fixed'
        },
        {
          type: 'css',
          selector: '.main-nav',
          property: 'left',
          value: '0'
        }
      ],
      configuration: {
        navigationType: 'sidebar',
        menuItems: ['Home', 'Features', 'Pricing', 'About', 'Contact']
      }
    }
  ],
  primaryMetrics: ['navigation_efficiency', 'user_journey_completion'],
  secondaryMetrics: ['time_on_page', 'pages_per_session', 'bounce_rate'],
  successCriteria: {
    minimumSampleSize: 1000,
    minimumEffectSize: 0.12,
    statisticalPower: 0.8,
    significanceLevel: 0.05
  },
  targeting: {
    pages: ['/*']
  },
  configuration: {
    randomizationUnit: 'user',
    stickiness: 'user',
    attributionWindow: 48,
    cooldownPeriod: 14
  }
};

// Collection of all example experiments
export const EXAMPLE_EXPERIMENTS: Experiment[] = [
  BUTTON_COLOR_EXPERIMENT,
  HEADLINE_EXPERIMENT,
  PRICING_LAYOUT_EXPERIMENT,
  FEATURE_FLAG_EXPERIMENT,
  PERFORMANCE_EXPERIMENT,
  NAVIGATION_EXPERIMENT
];

// Quick setup experiments for common use cases
export const QUICK_EXPERIMENTS = {
  // Quick button test
  buttonTest: (buttonSelector: string, colors: string[]) => ({
    id: `button-test-${Date.now()}`,
    name: 'Quick Button Color Test',
    description: 'Quick test of button colors',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    status: 'active' as const,
    trafficAllocation: 0.5,
    segments: [{ id: 'all', name: 'All Users', criteria: {}, weight: 1.0 }],
    variants: colors.map((color, index) => ({
      id: `color-${index}`,
      name: `Color ${index + 1}`,
      description: `Button color: ${color}`,
      allocation: 1 / colors.length,
      changes: [{
        type: 'css' as const,
        selector: buttonSelector,
        property: 'background-color',
        value: color
      }],
      configuration: { color }
    })),
    primaryMetrics: ['click_through_rate'],
    secondaryMetrics: ['conversion_rate'],
    successCriteria: {
      minimumSampleSize: 100,
      minimumEffectSize: 0.05,
      statisticalPower: 0.8,
      significanceLevel: 0.05
    },
    targeting: { pages: [window.location.pathname] },
    configuration: {
      randomizationUnit: 'user' as const,
      stickiness: 'user' as const,
      attributionWindow: 24,
      cooldownPeriod: 0
    }
  }),

  // Quick headline test
  headlineTest: (headlineSelector: string, headlines: string[]) => ({
    id: `headline-test-${Date.now()}`,
    name: 'Quick Headline Test',
    description: 'Quick test of different headlines',
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    status: 'active' as const,
    trafficAllocation: 0.5,
    segments: [{ id: 'all', name: 'All Users', criteria: {}, weight: 1.0 }],
    variants: headlines.map((headline, index) => ({
      id: `headline-${index}`,
      name: `Headline ${index + 1}`,
      description: `Headline: ${headline}`,
      allocation: 1 / headlines.length,
      changes: [{
        type: 'html' as const,
        selector: headlineSelector,
        content: headline
      }],
      configuration: { headline }
    })),
    primaryMetrics: ['scroll_depth', 'time_on_page'],
    secondaryMetrics: ['bounce_rate'],
    successCriteria: {
      minimumSampleSize: 200,
      minimumEffectSize: 0.1,
      statisticalPower: 0.8,
      significanceLevel: 0.05
    },
    targeting: { pages: [window.location.pathname] },
    configuration: {
      randomizationUnit: 'user' as const,
      stickiness: 'user' as const,
      attributionWindow: 48,
      cooldownPeriod: 0
    }
  })
};