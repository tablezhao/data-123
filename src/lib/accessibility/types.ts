/**
 * Accessibility Testing Framework Types
 * Comprehensive type definitions for WCAG 2.1 compliance testing
 */

export interface AccessibilityViolation {
  id: string;
  type: 'error' | 'warning' | 'notice';
  rule: WCAGRule;
  element: HTMLElement;
  message: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  impact: 'blocker' | 'major' | 'minor';
  remediation: string;
  wcagReference: string;
  testMethod: 'automated' | 'manual' | 'hybrid';
  timestamp: number;
  selector: string;
  context?: string;
}

export interface WCAGRule {
  id: string;
  name: string;
  description: string;
  successCriteria: string[];
  level: 'A' | 'AA' | 'AAA';
  guidelines: string[];
  techniques: string[];
  commonFailures: string[];
  relatedRules: string[];
}

export interface ContrastTest {
  foreground: string;
  background: string;
  ratio: number;
  largeText: boolean;
  meetsAA: boolean;
  meetsAAA: boolean;
  meetsLargeTextAA: boolean;
  meetsLargeTextAAA: boolean;
  recommendation?: string;
}

export interface KeyboardNavigationTest {
  element: HTMLElement;
  tabbable: boolean;
  focusable: boolean;
  focusIndicator: boolean;
  skipLink: boolean;
  logicalOrder: boolean;
  trap: boolean;
  shortcuts: string[];
  issues: string[];
}

export interface ScreenReaderTest {
  element: HTMLElement;
  label: string;
  description: string;
  role: string;
  altText: string;
  headings: boolean;
  landmarks: boolean;
  forms: boolean;
  tables: boolean;
  issues: string[];
}

export interface AccessibilityReport {
  id: string;
  url: string;
  timestamp: number;
  violations: AccessibilityViolation[];
  summary: {
    total: number;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    automated: number;
    manual: number;
    wcagA: number;
    wcagAA: number;
    wcagAAA: number;
  };
  coverage: {
    automated: number;
    manual: number;
    total: number;
  };
  performance: {
    duration: number;
    elementsTested: number;
    rulesApplied: number;
  };
  recommendations: string[];
  wcagCompliance: {
    levelA: boolean;
    levelAA: boolean;
    levelAAA: boolean;
    score: number;
  };
}

export interface AccessibilityTestConfig {
  wcagLevel: 'A' | 'AA' | 'AAA';
  includeExperimental: boolean;
  includeManual: boolean;
  includeBestPractices: boolean;
  performanceBudget: {
    maxDuration: number;
    maxElements: number;
  };
  rules: {
    enabled: string[];
    disabled: string[];
    custom: WCAGRule[];
  };
  selectors: {
    include: string[];
    exclude: string[];
  };
  viewport: {
    width: number;
    height: number;
  };
  userAgent?: string;
  delay: number;
  retries: number;
}

export interface AccessibilityTestResult {
  passed: boolean;
  violations: AccessibilityViolation[];
  warnings: AccessibilityViolation[];
  notices: AccessibilityViolation[];
  duration: number;
  elementsTested: number;
  rulesApplied: number;
  coverage: number;
  recommendations: string[];
}

export interface ColorContrastResult {
  ratio: number;
  levelAA: boolean;
  levelAAA: boolean;
  largeTextAA: boolean;
  largeTextAAA: boolean;
  foreground: string;
  background: string;
  recommendation?: string;
}

export interface FocusManagementTest {
  element: HTMLElement;
  visible: boolean;
  sufficient: boolean;
  color: string;
  style: string;
  width: number;
  offset: number;
  contrast: number;
  issues: string[];
}

export interface AriaImplementationTest {
  element: HTMLElement;
  role: string;
  label: string;
  labelledBy: string;
  describedBy: string;
  expanded: boolean;
  pressed: boolean;
  checked: boolean;
  selected: boolean;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
  readonly: boolean;
  issues: string[];
}

export interface SemanticStructureTest {
  headings: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;
    hierarchy: boolean;
    empty: number;
  };
  landmarks: {
    main: number;
    nav: number;
    aside: number;
    header: number;
    footer: number;
    section: number;
    article: number;
    search: number;
  };
  lists: {
    ul: number;
    ol: number;
    dl: number;
    structured: boolean;
  };
  forms: {
    labels: number;
    fieldsets: number;
    legends: number;
    required: number;
    errors: string[];
  };
  tables: {
    tables: number;
    captions: number;
    headers: number;
    scopes: number;
    summaries: number;
    errors: string[];
  };
}

export interface AccessibilityTestSuite {
  id: string;
  name: string;
  description: string;
  tests: AccessibilityTest[];
  config: AccessibilityTestConfig;
  results: AccessibilityTestResult[];
  schedule?: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    time?: string;
  };
}

export interface AccessibilityTest {
  id: string;
  name: string;
  description: string;
  category: 'contrast' | 'navigation' | 'semantics' | 'forms' | 'media' | 'time' | 'compatibility';
  wcagLevel: 'A' | 'AA' | 'AAA';
  run: (config: AccessibilityTestConfig) => Promise<AccessibilityTestResult>;
  priority: 'high' | 'medium' | 'low';
  automated: boolean;
  requiresManualVerification: boolean;
}

export interface AccessibilityComplianceScore {
  overall: number;
  wcagA: number;
  wcagAA: number;
  wcagAAA: number;
  categories: {
    contrast: number;
    navigation: number;
    semantics: number;
    forms: number;
    media: number;
    time: number;
    compatibility: number;
  };
  trend: {
    improvement: number;
    regression: number;
    stable: number;
  };
}