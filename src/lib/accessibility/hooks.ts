/**
 * React Hooks for Accessibility Testing Integration
 * Provides easy-to-use hooks for implementing accessibility testing in React applications
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  AccessibilityReport, 
  AccessibilityTestConfig, 
  AccessibilityTestResult,
  AccessibilityViolation 
} from './types';
import { AccessibilityAuditReporter } from './audit-reporter';
import { ColorContrastAnalyzer } from './contrast-analyzer';
import { KeyboardNavigator } from './keyboard-navigator';
import { ScreenReaderTester } from './screen-reader';

/**
 * Hook for running comprehensive accessibility audits
 */
export function useAccessibilityAudit(config?: Partial<AccessibilityTestConfig>) {
  const [report, setReport] = useState<AccessibilityReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);
  
  const reporter = useRef(AccessibilityAuditReporter.getInstance());
  
  const runAudit = useCallback(async (container?: HTMLElement) => {
    setIsRunning(true);
    setError(null);
    setProgress(0);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      const targetContainer = container || document.body;
      const auditConfig: AccessibilityTestConfig = {
        wcagLevel: 'AA',
        includeExperimental: false,
        includeManual: false,
        includeBestPractices: true,
        performanceBudget: {
          maxDuration: 5000,
          maxElements: 1000
        },
        rules: {
          enabled: [],
          disabled: [],
          custom: []
        },
        selectors: {
          include: ['*'],
          exclude: []
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        delay: 0,
        retries: 1,
        ...config
      };
      
      const auditReport = await reporter.current.generateAuditReport(targetContainer, auditConfig);
      
      clearInterval(progressInterval);
      setProgress(100);
      setReport(auditReport);
      
      return auditReport;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Audit failed'));
      throw err;
    } finally {
      setIsRunning(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [config]);
  
  return {
    report,
    isRunning,
    error,
    progress,
    runAudit,
    hasViolations: report ? report.violations.length > 0 : false,
    complianceScore: report ? report.wcagCompliance.score : 0,
    wcagCompliance: report ? report.wcagCompliance : null
  };
}

/**
 * Hook for real-time color contrast monitoring
 */
export function useColorContrastMonitor(elementRef: React.RefObject<HTMLElement>, targetRatio = 4.5) {
  const [contrastResult, setContrastResult] = useState<{
    ratio: number;
    meetsAA: boolean;
    meetsAAA: boolean;
    foreground: string;
    background: string;
  } | null>(null);
  
  const [violations, setViolations] = useState<any[]>([]);
  const analyzer = useRef(ColorContrastAnalyzer.getInstance());
  
  const checkContrast = useCallback(() => {
    if (!elementRef.current) return;
    
    try {
      const result = analyzer.current.analyzeElementContrast(elementRef.current);
      if (result) {
        setContrastResult({
          ratio: result.ratio,
          meetsAA: result.levelAA,
          meetsAAA: result.levelAAA,
          foreground: result.foreground,
          background: result.background
        });
        
        if (!result.levelAA) {
          setViolations(prev => [...prev, {
            element: elementRef.current,
            ratio: result.ratio,
            required: targetRatio,
            timestamp: Date.now()
          }]);
        }
      }
    } catch (error) {
      console.warn('Contrast analysis failed:', error);
    }
  }, [elementRef, targetRatio]);
  
  useEffect(() => {
    if (!elementRef.current) return;
    
    // Initial check
    checkContrast();
    
    // Set up mutation observer to monitor changes
    const observer = new MutationObserver(() => {
      checkContrast();
    });
    
    observer.observe(elementRef.current, {
      attributes: true,
      attributeFilter: ['style', 'class'],
      childList: true,
      subtree: true
    });
    
    return () => observer.disconnect();
  }, [elementRef, checkContrast]);
  
  return {
    contrastResult,
    violations,
    checkContrast,
    hasViolation: contrastResult ? !contrastResult.meetsAA : false
  };
}

/**
 * Hook for keyboard navigation testing
 */
export function useKeyboardNavigation(containerRef: React.RefObject<HTMLElement>) {
  const [navigationTest, setNavigationTest] = useState<{
    tabbableElements: HTMLElement[];
    issues: string[];
    hasSkipLinks: boolean;
    hasLogicalOrder: boolean;
  } | null>(null);
  
  const [isTesting, setIsTesting] = useState(false);
  const navigator = useRef(KeyboardNavigator.getInstance());
  
  const testNavigation = useCallback(async () => {
    if (!containerRef.current) return;
    
    setIsTesting(true);
    
    try {
      const tabbableElements = navigator.current.getTabbableElements(containerRef.current);
      const commonIssues = navigator.current.testCommonIssues(containerRef.current);
      
      setNavigationTest({
        tabbableElements,
        issues: commonIssues.issues,
        hasSkipLinks: commonIssues.skipLinks,
        hasLogicalOrder: commonIssues.logicalOrder
      });
    } catch (error) {
      console.error('Keyboard navigation test failed:', error);
    } finally {
      setIsTesting(false);
    }
  }, [containerRef]);
  
  const simulateKeyboardNavigation = useCallback(async () => {
    if (!containerRef.current) return;
    
    try {
      return await navigator.current.simulateKeyboardNavigation(containerRef.current);
    } catch (error) {
      console.error('Keyboard navigation simulation failed:', error);
      throw error;
    }
  }, [containerRef]);
  
  useEffect(() => {
    testNavigation();
  }, [testNavigation]);
  
  return {
    navigationTest,
    isTesting,
    testNavigation,
    simulateKeyboardNavigation,
    hasIssues: navigationTest ? navigationTest.issues.length > 0 : false
  };
}

/**
 * Hook for screen reader compatibility testing
 */
export function useScreenReaderCompatibility(elementRef: React.RefObject<HTMLElement>) {
  const [compatibilityTest, setCompatibilityTest] = useState<{
    label: string;
    role: string;
    hasProperStructure: boolean;
    issues: string[];
  } | null>(null);
  
  const [isTesting, setIsTesting] = useState(false);
  const tester = useRef(ScreenReaderTester.getInstance());
  
  const testCompatibility = useCallback(() => {
    if (!elementRef.current) return;
    
    setIsTesting(true);
    
    try {
      const testResult = tester.current.testScreenReaderCompatibility(elementRef.current);
      const semanticStructure = tester.current.testSemanticStructure(elementRef.current);
      
      setCompatibilityTest({
        label: testResult.label,
        role: testResult.role,
        hasProperStructure: testResult.headings && testResult.landmarks && testResult.forms && testResult.tables,
        issues: testResult.issues
      });
    } catch (error) {
      console.error('Screen reader compatibility test failed:', error);
    } finally {
      setIsTesting(false);
    }
  }, [elementRef]);
  
  useEffect(() => {
    testCompatibility();
  }, [testCompatibility]);
  
  return {
    compatibilityTest,
    isTesting,
    testCompatibility,
    hasIssues: compatibilityTest ? compatibilityTest.issues.length > 0 : false
  };
}

/**
 * Hook for real-time accessibility monitoring
 */
export function useAccessibilityMonitor(options?: {
  enabled?: boolean;
  onViolation?: (violation: any) => void;
  onWarning?: (warning: any) => void;
  debounceMs?: number;
}) {
  const [violations, setViolations] = useState<AccessibilityViolation[]>([]);
  const [warnings, setWarnings] = useState<any[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const reporter = useRef(AccessibilityAuditReporter.getInstance());
  const timeoutRef = useRef<number | null>(null);
  
  const {
    enabled = true,
    onViolation,
    onWarning,
    debounceMs = 1000
  } = options || {};
  
  const monitor = useCallback(async () => {
    if (!enabled) return;
    
    try {
      const report = await reporter.current.generateAuditReport(document.body);
      
      const newViolations = report.violations.filter(v => 
        !violations.some(existing => existing.id === v.id)
      );
      
      if (newViolations.length > 0) {
        setViolations(prev => [...prev, ...newViolations]);
        newViolations.forEach(v => onViolation?.(v));
      }
      
      // 从报告中提取警告项
      const newWarnings = report.violations
        .filter(v => v.type === 'warning')
        .map(v => ({ id: v.id, message: v.message, severity: v.severity, timestamp: Date.now() }));
      if (newWarnings.length > 0) {
        setWarnings(prev => [...prev, ...newWarnings]);
        newWarnings.forEach(w => onWarning?.(w));
      }
    } catch (error) {
      console.warn('Accessibility monitoring failed:', error);
    }
  }, [enabled, violations, onViolation, onWarning]);
  
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    
    const check = () => {
      monitor();
      timeoutRef.current = window.setTimeout(check, debounceMs);
    };
    
    check();
  }, [monitor, debounceMs]);
  
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  
  const clearViolations = useCallback(() => {
    setViolations([]);
    setWarnings([]);
  }, []);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return {
    violations,
    warnings,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearViolations,
    violationCount: violations.length,
    warningCount: warnings.length
  };
}

/**
 * Hook for accessibility testing in development mode
 */
export function useAccessibilityDevTools(options?: {
  enabled?: boolean;
  showOverlay?: boolean;
  highlightViolations?: boolean;
}) {
  const [isEnabled, setIsEnabled] = useState(options?.enabled ?? process.env.NODE_ENV === 'development');
  const [showOverlay, setShowOverlay] = useState(options?.showOverlay ?? true);
  const [highlightEnabled, setHighlightEnabled] = useState(options?.highlightViolations ?? true);
  
  const { report, isRunning, runAudit } = useAccessibilityAudit();
  
  const toggleDevTools = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);
  
  const runAccessibilityCheck = useCallback(async () => {
    if (!isEnabled) return;
    
    try {
      const auditReport = await runAudit();
      
      if (highlightEnabled && auditReport.violations.length > 0) {
        applyHighlights(auditReport.violations);
      }
      
      console.group('Accessibility Audit Results');
      console.log('Compliance Score:', auditReport.wcagCompliance.score);
      console.log('Violations:', auditReport.violations.length);
      console.log('WCAG Level A:', auditReport.wcagCompliance.levelA ? 'PASS' : 'FAIL');
      console.log('WCAG Level AA:', auditReport.wcagCompliance.levelAA ? 'PASS' : 'FAIL');
      console.log('WCAG Level AAA:', auditReport.wcagCompliance.levelAAA ? 'PASS' : 'FAIL');
      console.groupEnd();
      
      return auditReport;
    } catch (error) {
      console.error('Accessibility audit failed:', error);
      throw error;
    }
  }, [isEnabled, highlightEnabled, runAudit]);
  
  const applyHighlights = (violations: AccessibilityViolation[]) => {
    violations.forEach(violation => {
      const element = violation.element;
      if (element) {
        element.style.outline = '3px solid #ff0000';
        element.style.outlineOffset = '2px';
        element.title = `Accessibility Violation: ${violation.message}`;
        
        // Add data attribute for styling
        element.setAttribute('data-a11y-violation', violation.id);
        element.setAttribute('data-a11y-severity', violation.severity);
      }
    });
  };
  
  const clearHighlights = () => {
    const highlightedElements = document.querySelectorAll('[data-a11y-violation]');
    highlightedElements.forEach(element => {
      (element as HTMLElement).style.outline = '';
      (element as HTMLElement).style.outlineOffset = '';
      (element as HTMLElement).title = '';
      element.removeAttribute('data-a11y-violation');
      element.removeAttribute('data-a11y-severity');
    });
  };
  
  return {
    isEnabled,
    showOverlay,
    highlightViolations: highlightEnabled,
    isRunning,
    report,
    toggleDevTools,
    runAccessibilityCheck,
    clearHighlights,
    setShowOverlay,
    setHighlightViolations: setHighlightEnabled
  };
}

/**
 * Hook for component-level accessibility testing
 */
export function useComponentAccessibility<T extends HTMLElement>() {
  const elementRef = useRef<T>(null);
  const [violations, setViolations] = useState<AccessibilityViolation[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  
  const { checkContrast, hasViolation } = useColorContrastMonitor(elementRef as any);
  const { navigationTest, testNavigation } = useKeyboardNavigation(elementRef as any);
  const { compatibilityTest, testCompatibility } = useScreenReaderCompatibility(elementRef as any);
  
  const testComponent = useCallback(async () => {
    if (!elementRef.current) return;
    
    setIsTesting(true);
    setViolations([]);
    
    try {
      // Run all component-level tests
      checkContrast();
      testNavigation();
      testCompatibility();
      
      // Collect violations from all tests
      const allViolations: AccessibilityViolation[] = [];
      
      if (hasViolation) {
        allViolations.push({
          id: `contrast-${Date.now()}`,
          type: 'error',
          rule: { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA' } as any,
          element: elementRef.current,
          message: 'Insufficient color contrast',
          severity: 'serious',
          impact: 'major',
          remediation: 'Increase color contrast to meet WCAG standards',
          wcagReference: 'WCAG 2.1 - 1.4.3',
          testMethod: 'automated',
          timestamp: Date.now(),
          selector: elementRef.current.tagName.toLowerCase()
        });
      }
      
      if (navigationTest?.hasIssues) {
        allViolations.push({
          id: `navigation-${Date.now()}`,
          type: 'error',
          rule: { id: '2.1.1', name: 'Keyboard', level: 'A' } as any,
          element: elementRef.current,
          message: 'Keyboard navigation issues detected',
          severity: 'serious',
          impact: 'major',
          remediation: 'Fix keyboard navigation issues',
          wcagReference: 'WCAG 2.1 - 2.1.1',
          testMethod: 'automated',
          timestamp: Date.now(),
          selector: elementRef.current.tagName.toLowerCase()
        });
      }
      
      if (compatibilityTest?.hasIssues) {
        allViolations.push({
          id: `screen-reader-${Date.now()}`,
          type: 'error',
          rule: { id: '4.1.2', name: 'Name, Role, Value', level: 'A' } as any,
          element: elementRef.current,
          message: 'Screen reader compatibility issues detected',
          severity: 'serious',
          impact: 'major',
          remediation: 'Fix screen reader compatibility issues',
          wcagReference: 'WCAG 2.1 - 4.1.2',
          testMethod: 'automated',
          timestamp: Date.now(),
          selector: elementRef.current.tagName.toLowerCase()
        });
      }
      
      setViolations(allViolations);
      
      return {
        violations: allViolations,
        hasViolations: allViolations.length > 0,
        contrast: { hasViolation, result: compatibilityTest },
        navigation: navigationTest,
        screenReader: compatibilityTest
      };
    } catch (error) {
      console.error('Component accessibility test failed:', error);
      throw error;
    } finally {
      setIsTesting(false);
    }
  }, [checkContrast, testNavigation, testCompatibility, hasViolation, navigationTest, compatibilityTest]);
  
  return {
    elementRef,
    violations,
    isTesting,
    testComponent,
    hasViolations: violations.length > 0,
    contrastTest: { hasViolation, result: compatibilityTest },
    navigationTest,
    screenReaderTest: compatibilityTest
  };
}
