/**
 * Accessibility Audit Reporting System
 * Comprehensive WCAG 2.1 compliance reporting and analysis
 */

import { 
  AccessibilityReport, 
  AccessibilityViolation, 
  AccessibilityTestConfig, 
  AccessibilityTestResult, 
  AccessibilityComplianceScore,
  WCAGRule 
} from './types';
import { WCAG_RULES, getRequiredRules } from './wcag-rules';
import { ColorContrastAnalyzer } from './contrast-analyzer';
import { KeyboardNavigator } from './keyboard-navigator';
import { ScreenReaderTester } from './screen-reader';

export class AccessibilityAuditReporter {
  private static instance: AccessibilityAuditReporter;
  private contrastAnalyzer: ColorContrastAnalyzer;
  private keyboardNavigator: KeyboardNavigator;
  private screenReaderTester: ScreenReaderTester;
  
  private constructor() {
    this.contrastAnalyzer = ColorContrastAnalyzer.getInstance();
    this.keyboardNavigator = KeyboardNavigator.getInstance();
    this.screenReaderTester = ScreenReaderTester.getInstance();
  }
  
  static getInstance(): AccessibilityAuditReporter {
    if (!this.instance) {
      this.instance = new AccessibilityAuditReporter();
    }
    return this.instance;
  }

  /**
   * Generate comprehensive accessibility audit report
   */
  async generateAuditReport(
    container: HTMLElement = document.body,
    config: AccessibilityTestConfig = this.getDefaultConfig()
  ): Promise<AccessibilityReport> {
    const startTime = performance.now();
    const url = window.location.href;
    const violations: AccessibilityViolation[] = [];
    
    // Run all accessibility tests
    const testResults = await this.runAllTests(container, config);
    
    // Collect violations from all tests
    testResults.forEach(result => {
      violations.push(...result.violations);
    });
    
    // Generate summary statistics
    const summary = this.generateSummary(violations);
    
    // Calculate coverage
    const coverage = this.calculateCoverage(testResults, container);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(violations, config);
    
    // Calculate WCAG compliance
    const wcagCompliance = this.calculateWCAGCompliance(violations, config);
    
    const duration = performance.now() - startTime;
    
    return {
      id: this.generateReportId(),
      url,
      timestamp: Date.now(),
      violations,
      summary,
      coverage,
      performance: {
        duration,
        elementsTested: this.countElements(container),
        rulesApplied: getRequiredRules(config.wcagLevel).length
      },
      recommendations,
      wcagCompliance
    };
  }

  /**
   * Run all accessibility tests
   */
  private async runAllTests(
    container: HTMLElement,
    config: AccessibilityTestConfig
  ): Promise<AccessibilityTestResult[]> {
    const results: AccessibilityTestResult[] = [];
    
    // Color contrast tests
    if (this.shouldRunTest('contrast', config)) {
      results.push(await this.runContrastTests(container, config));
    }
    
    // Keyboard navigation tests
    if (this.shouldRunTest('navigation', config)) {
      results.push(await this.runKeyboardNavigationTests(container, config));
    }
    
    // Screen reader tests
    if (this.shouldRunTest('semantics', config)) {
      results.push(await this.runScreenReaderTests(container, config));
    }
    
    // ARIA tests
    if (this.shouldRunTest('semantics', config)) {
      results.push(await this.runARIATests(container, config));
    }
    
    // Semantic structure tests
    if (this.shouldRunTest('semantics', config)) {
      results.push(await this.runSemanticStructureTests(container, config));
    }
    
    return results;
  }

  /**
   * Determine if a test should be run based on configuration
   */
  private shouldRunTest(category: string, config: AccessibilityTestConfig): boolean {
    // Check if test category is enabled
    if (config.rules.enabled.length > 0) {
      return config.rules.enabled.some(rule => rule.includes(category));
    }
    
    // Check if test category is disabled
    if (config.rules.disabled.length > 0) {
      return !config.rules.disabled.some(rule => rule.includes(category));
    }
    
    return true;
  }

  /**
   * Run color contrast tests
   */
  private async runContrastTests(
    container: HTMLElement,
    config: AccessibilityTestConfig
  ): Promise<AccessibilityTestResult> {
    const violations: AccessibilityViolation[] = [];
    const startTime = performance.now();
    
    const contrastViolations = this.contrastAnalyzer.findContrastViolations(container);
    
    contrastViolations.forEach((violation, index) => {
      const rule = WCAG_RULES['1.4.3']; // Contrast (Minimum)
      const element = this.findElementByColors(violation.foreground, violation.background, container);
      
      violations.push({
        id: `contrast-${index}`,
        type: 'error',
        rule,
        element: element || container,
        message: `Insufficient color contrast: ${violation.ratio.toFixed(2)}:1 (required: ${violation.largeText ? '3:1' : '4.5:1'})`,
        severity: 'serious',
        impact: 'major',
        remediation: `Increase contrast ratio to at least ${violation.largeText ? '3:1' : '4.5:1'}. Consider using: ${violation.recommendation}`,
        wcagReference: 'WCAG 2.1 - 1.4.3 Contrast (Minimum)',
        testMethod: 'automated',
        timestamp: Date.now(),
        selector: this.generateSelector(element || container),
        context: `Foreground: ${violation.foreground}, Background: ${violation.background}`
      });
    });
    
    const duration = performance.now() - startTime;
    
    return {
      passed: violations.length === 0,
      violations,
      warnings: [],
      notices: [],
      duration,
      elementsTested: this.countElements(container),
      rulesApplied: 1,
      coverage: 0.8,
      recommendations: violations.length > 0 ? ['Review color palette for better contrast'] : []
    };
  }

  /**
   * Run keyboard navigation tests
   */
  private async runKeyboardNavigationTests(
    container: HTMLElement,
    config: AccessibilityTestConfig
  ): Promise<AccessibilityTestResult> {
    const violations: AccessibilityViolation[] = [];
    const startTime = performance.now();
    
    const keyboardTests = this.keyboardNavigator.testKeyboardNavigation(container);
    const commonIssues = this.keyboardNavigator.testCommonIssues(container);
    
    // Process keyboard navigation test results
    keyboardTests.forEach((test, index) => {
      if (test.issues.length > 0) {
        test.issues.forEach(issue => {
          const rule = this.getRuleForKeyboardIssue(issue);
          violations.push({
            id: `keyboard-${index}`,
            type: 'error',
            rule,
            element: test.element,
            message: issue,
            severity: this.getSeverityForIssue(issue),
            impact: this.getImpactForIssue(issue),
            remediation: this.getRemediationForKeyboardIssue(issue),
            wcagReference: `WCAG 2.1 - ${rule.id} ${rule.name}`,
            testMethod: 'automated',
            timestamp: Date.now(),
            selector: this.generateSelector(test.element)
          });
        });
      }
    });
    
    // Process common issues
    commonIssues.issues.forEach((issue, index) => {
      const rule = this.getRuleForKeyboardIssue(issue);
      violations.push({
        id: `keyboard-common-${index}`,
        type: 'error',
        rule,
        element: container,
        message: issue,
        severity: 'serious',
        impact: 'major',
        remediation: this.getRemediationForKeyboardIssue(issue),
        wcagReference: `WCAG 2.1 - ${rule.id} ${rule.name}`,
        testMethod: 'automated',
        timestamp: Date.now(),
        selector: 'body'
      });
    });
    
    const duration = performance.now() - startTime;
    
    return {
      passed: violations.length === 0,
      violations,
      warnings: [],
      notices: [],
      duration,
      elementsTested: keyboardTests.length,
      rulesApplied: 3, // Multiple keyboard navigation rules
      coverage: 0.9,
      recommendations: violations.length > 0 ? ['Review keyboard navigation implementation'] : []
    };
  }

  /**
   * Run screen reader tests
   */
  private async runScreenReaderTests(
    container: HTMLElement,
    config: AccessibilityTestConfig
  ): Promise<AccessibilityTestResult> {
    const violations: AccessibilityViolation[] = [];
    const startTime = performance.now();
    
    const semanticStructure = this.screenReaderTester.testSemanticStructure(container);
    
    // Test headings
    if (semanticStructure.headings.h1 === 0) {
      const rule = WCAG_RULES['2.4.6']; // Headings and Labels
      violations.push({
        id: 'screen-reader-headings',
        type: 'error',
        rule,
        element: container,
        message: 'No H1 heading found on the page',
        severity: 'serious',
        impact: 'major',
        remediation: 'Add an H1 heading to provide page structure',
        wcagReference: 'WCAG 2.1 - 2.4.6 Headings and Labels',
        testMethod: 'automated',
        timestamp: Date.now(),
        selector: 'body'
      });
    }
    
    // Test landmarks
    if (semanticStructure.landmarks.main === 0) {
      const rule = WCAG_RULES['2.4.1']; // Bypass Blocks
      violations.push({
        id: 'screen-reader-landmarks',
        type: 'error',
        rule,
        element: container,
        message: 'No main landmark found on the page',
        severity: 'moderate',
        impact: 'minor',
        remediation: 'Add a main landmark to provide page structure',
        wcagReference: 'WCAG 2.1 - 2.4.1 Bypass Blocks',
        testMethod: 'automated',
        timestamp: Date.now(),
        selector: 'body'
      });
    }
    
    // Test forms
    if (semanticStructure.forms.errors.length > 0) {
      const rule = WCAG_RULES['3.3.2']; // Labels or Instructions
      semanticStructure.forms.errors.forEach((error, index) => {
        violations.push({
          id: `screen-reader-forms-${index}`,
          type: 'error',
          rule,
          element: container,
          message: error,
          severity: 'serious',
          impact: 'major',
          remediation: 'Add proper labels to all form controls',
          wcagReference: 'WCAG 2.1 - 3.3.2 Labels or Instructions',
          testMethod: 'automated',
          timestamp: Date.now(),
          selector: 'form'
        });
      });
    }
    
    // Test tables
    if (semanticStructure.tables.errors.length > 0) {
      const rule = WCAG_RULES['1.3.1']; // Info and Relationships
      semanticStructure.tables.errors.forEach((error, index) => {
        violations.push({
          id: `screen-reader-tables-${index}`,
          type: 'error',
          rule,
          element: container,
          message: error,
          severity: 'moderate',
          impact: 'minor',
          remediation: 'Add proper table structure with captions and headers',
          wcagReference: 'WCAG 2.1 - 1.3.1 Info and Relationships',
          testMethod: 'automated',
          timestamp: Date.now(),
          selector: 'table'
        });
      });
    }
    
    const duration = performance.now() - startTime;
    
    return {
      passed: violations.length === 0,
      violations,
      warnings: [],
      notices: [],
      duration,
      elementsTested: this.countElements(container),
      rulesApplied: 4, // Multiple screen reader rules
      coverage: 0.85,
      recommendations: violations.length > 0 ? ['Review semantic markup structure'] : []
    };
  }

  /**
   * Run ARIA tests
   */
  private async runARIATests(
    container: HTMLElement,
    config: AccessibilityTestConfig
  ): Promise<AccessibilityTestResult> {
    const violations: AccessibilityViolation[] = [];
    const startTime = performance.now();
    
    const elements = container.querySelectorAll('*');
    
    elements.forEach((element, index) => {
      if (!(element instanceof HTMLElement)) return;
      
      const ariaTest = this.screenReaderTester.testARIAImplementation(element);
      
      if (ariaTest.issues.length > 0) {
        ariaTest.issues.forEach(issue => {
          const rule = WCAG_RULES['4.1.2']; // Name, Role, Value
          violations.push({
            id: `aria-${index}`,
            type: 'error',
            rule,
            element,
            message: issue,
            severity: 'serious',
            impact: 'major',
            remediation: 'Fix ARIA implementation issues',
            wcagReference: 'WCAG 2.1 - 4.1.2 Name, Role, Value',
            testMethod: 'automated',
            timestamp: Date.now(),
            selector: this.generateSelector(element)
          });
        });
      }
    });
    
    const duration = performance.now() - startTime;
    
    return {
      passed: violations.length === 0,
      violations,
      warnings: [],
      notices: [],
      duration,
      elementsTested: elements.length,
      rulesApplied: 1,
      coverage: 0.9,
      recommendations: violations.length > 0 ? ['Review ARIA implementation'] : []
    };
  }

  /**
   * Run semantic structure tests
   */
  private async runSemanticStructureTests(
    container: HTMLElement,
    config: AccessibilityTestConfig
  ): Promise<AccessibilityTestResult> {
    const violations: AccessibilityViolation[] = [];
    const startTime = performance.now();
    
    const semanticStructure = this.screenReaderTester.testSemanticStructure(container);
    
    // Check for semantic HTML usage
    const semanticElements = container.querySelectorAll('main, nav, header, footer, article, section, aside');
    if (semanticElements.length === 0) {
      const rule = WCAG_RULES['1.3.1']; // Info and Relationships
      violations.push({
        id: 'semantic-structure',
        type: 'warning',
        rule,
        element: container,
        message: 'Page lacks semantic HTML elements',
        severity: 'moderate',
        impact: 'minor',
        remediation: 'Use semantic HTML elements (main, nav, header, footer, article, section, aside)',
        wcagReference: 'WCAG 2.1 - 1.3.1 Info and Relationships',
        testMethod: 'automated',
        timestamp: Date.now(),
        selector: 'body'
      });
    }
    
    const duration = performance.now() - startTime;
    
    return {
      passed: violations.length === 0,
      violations,
      warnings: [],
      notices: [],
      duration,
      elementsTested: semanticElements.length,
      rulesApplied: 1,
      coverage: 0.7,
      recommendations: violations.length > 0 ? ['Use semantic HTML elements'] : []
    };
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): AccessibilityTestConfig {
    return {
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
        width: 1920,
        height: 1080
      },
      delay: 0,
      retries: 1
    };
  }

  /**
   * Generate report ID
   */
  private generateReportId(): string {
    return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Find element by colors
   */
  private findElementByColors(foreground: string, background: string, container: HTMLElement): HTMLElement | null {
    const elements = container.querySelectorAll('*');
    
    for (const element of elements) {
      if (element instanceof HTMLElement) {
        const style = window.getComputedStyle(element);
        if (style.color === foreground) {
          // Check if this element or its parent has the background color
          let parent = element as HTMLElement | null;
          while (parent) {
            const parentStyle = window.getComputedStyle(parent);
            if (parentStyle.backgroundColor === background) {
              return element;
            }
            parent = parent.parentElement;
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Generate CSS selector for element
   */
  private generateSelector(element: HTMLElement): string {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      return `${element.tagName.toLowerCase()}.${element.className.split(' ').join('.')}`;
    }
    
    return element.tagName.toLowerCase();
  }

  /**
   * Count elements in container
   */
  private countElements(container: HTMLElement): number {
    return container.querySelectorAll('*').length;
  }

  /**
   * Get rule for keyboard issue
   */
  private getRuleForKeyboardIssue(issue: string): WCAGRule {
    if (issue.includes('focus')) {
      return WCAG_RULES['2.4.7']; // Focus Visible
    }
    if (issue.includes('trap')) {
      return WCAG_RULES['2.1.2']; // No Keyboard Trap
    }
    if (issue.includes('skip')) {
      return WCAG_RULES['2.4.1']; // Bypass Blocks
    }
    return WCAG_RULES['2.1.1']; // Keyboard
  }

  /**
   * Get severity for issue
   */
  private getSeverityForIssue(issue: string): 'critical' | 'serious' | 'moderate' | 'minor' {
    if (issue.includes('critical') || issue.includes('blocker')) {
      return 'critical';
    }
    if (issue.includes('serious') || issue.includes('major')) {
      return 'serious';
    }
    if (issue.includes('moderate')) {
      return 'moderate';
    }
    return 'minor';
  }

  /**
   * Get impact for issue
   */
  private getImpactForIssue(issue: string): 'blocker' | 'major' | 'minor' {
    if (issue.includes('blocker') || issue.includes('trap')) {
      return 'blocker';
    }
    if (issue.includes('major') || issue.includes('focus')) {
      return 'major';
    }
    return 'minor';
  }

  /**
   * Get remediation for keyboard issue
   */
  private getRemediationForKeyboardIssue(issue: string): string {
    if (issue.includes('focus')) {
      return 'Add visible focus indicators to interactive elements';
    }
    if (issue.includes('trap')) {
      return 'Implement proper focus management to avoid keyboard traps';
    }
    if (issue.includes('skip')) {
      return 'Add skip links to bypass repetitive content';
    }
    return 'Review keyboard navigation implementation';
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(violations: AccessibilityViolation[]) {
    const summary = {
      total: violations.length,
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
      automated: 0,
      manual: 0,
      wcagA: 0,
      wcagAA: 0,
      wcagAAA: 0
    };
    
    violations.forEach(violation => {
      // Count by severity
      summary[violation.severity]++;
      
      // Count by test method
      if (violation.testMethod === 'automated') {
        summary.automated++;
      } else {
        summary.manual++;
      }
      
      // Count by WCAG level
      if (violation.rule.level === 'A') {
        summary.wcagA++;
      } else if (violation.rule.level === 'AA') {
        summary.wcagAA++;
      } else if (violation.rule.level === 'AAA') {
        summary.wcagAAA++;
      }
    });
    
    return summary;
  }

  /**
   * Calculate test coverage
   */
  private calculateCoverage(results: AccessibilityTestResult[], container: HTMLElement): {
    automated: number;
    manual: number;
    total: number;
  } {
    const totalElements = this.countElements(container);
    const automatedElements = results.reduce((sum, result) => sum + result.elementsTested, 0);
    
    return {
      automated: Math.min(1, automatedElements / totalElements),
      manual: 0.1, // Placeholder for manual testing coverage
      total: Math.min(1, (automatedElements + totalElements * 0.1) / totalElements)
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(violations: AccessibilityViolation[], config: AccessibilityTestConfig): string[] {
    const recommendations: string[] = [];
    
    // Group violations by category
    const categories = this.groupViolationsByCategory(violations);
    
    // Generate recommendations based on most common issues
    if (categories.contrast > 0) {
      recommendations.push('Review and improve color contrast throughout the application');
    }
    
    if (categories.navigation > 0) {
      recommendations.push('Enhance keyboard navigation and focus management');
    }
    
    if (categories.semantics > 0) {
      recommendations.push('Improve semantic markup and ARIA implementation');
    }
    
    if (categories.forms > 0) {
      recommendations.push('Add proper labels and instructions to form controls');
    }
    
    // Add general recommendations
    recommendations.push('Conduct user testing with assistive technologies');
    recommendations.push('Provide accessibility training for development team');
    recommendations.push('Establish ongoing accessibility testing processes');
    
    return recommendations;
  }

  /**
   * Group violations by category
   */
  private groupViolationsByCategory(violations: AccessibilityViolation[]): Record<string, number> {
    const categories: Record<string, number> = {
      contrast: 0,
      navigation: 0,
      semantics: 0,
      forms: 0,
      media: 0,
      time: 0,
      compatibility: 0
    };
    
    violations.forEach(violation => {
      const category = this.getCategoryForRule(violation.rule);
      categories[category]++;
    });
    
    return categories;
  }

  /**
   * Get category for rule
   */
  private getCategoryForRule(rule: WCAGRule): string {
    if (rule.id.startsWith('1.4')) return 'contrast';
    if (rule.id.startsWith('2.1') || rule.id.startsWith('2.4')) return 'navigation';
    if (rule.id.startsWith('1.3') || rule.id.startsWith('4.1')) return 'semantics';
    if (rule.id.startsWith('3.3')) return 'forms';
    if (rule.id.startsWith('1.2')) return 'media';
    if (rule.id.startsWith('2.2')) return 'time';
    return 'compatibility';
  }

  /**
   * Calculate WCAG compliance
   */
  private calculateWCAGCompliance(violations: AccessibilityViolation[], config: AccessibilityTestConfig): {
    levelA: boolean;
    levelAA: boolean;
    levelAAA: boolean;
    score: number;
  } {
    const requiredRules = getRequiredRules(config.wcagLevel);
    const violatedRules = new Set(violations.map(v => v.rule.id));
    
    const levelAViolations = violations.filter(v => v.rule.level === 'A').length;
    const levelAAViolations = violations.filter(v => v.rule.level === 'AA').length;
    const levelAAAViolations = violations.filter(v => v.rule.level === 'AAA').length;
    
    const levelA = levelAViolations === 0;
    const levelAA = levelA && levelAAViolations === 0;
    const levelAAA = levelAA && levelAAAViolations === 0;
    
    // Calculate compliance score (0-100)
    const totalPossibleViolations = requiredRules.length;
    const actualViolations = violations.filter(v => requiredRules.includes(v.rule)).length;
    const score = Math.max(0, Math.round((1 - actualViolations / totalPossibleViolations) * 100));
    
    return {
      levelA,
      levelAA,
      levelAAA,
      score
    };
  }

  /**
   * Export report in different formats
   */
  exportReport(report: AccessibilityReport, format: 'json' | 'csv' | 'html' = 'json'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2);
      
      case 'csv':
        return this.exportToCSV(report);
      
      case 'html':
        return this.exportToHTML(report);
      
      default:
        return JSON.stringify(report, null, 2);
    }
  }

  /**
   * Export to CSV format
   */
  private exportToCSV(report: AccessibilityReport): string {
    const headers = ['ID', 'Type', 'Severity', 'Impact', 'WCAG Rule', 'Message', 'Selector', 'Remediation'];
    const rows = report.violations.map(violation => [
      violation.id,
      violation.type,
      violation.severity,
      violation.impact,
      violation.rule.id,
      violation.message,
      violation.selector,
      violation.remediation
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
  }

  /**
   * Export to HTML format
   */
  private exportToHTML(report: AccessibilityReport): string {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Audit Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .violation { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .critical { border-left: 5px solid #d32f2f; }
        .serious { border-left: 5px solid #f57c00; }
        .moderate { border-left: 5px solid #fbc02d; }
        .minor { border-left: 5px solid #689f38; }
        .compliance { font-weight: bold; }
        .pass { color: #4caf50; }
        .fail { color: #f44336; }
    </style>
</head>
<body>
    <h1>Accessibility Audit Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p>URL: ${report.url}</p>
        <p>Date: ${new Date(report.timestamp).toLocaleString()}</p>
        <p>Total Violations: ${report.summary.total}</p>
        <p>WCAG Compliance Score: ${report.wcagCompliance.score}/100</p>
        <p>Level A: <span class="${report.wcagCompliance.levelA ? 'pass' : 'fail'}">${report.wcagCompliance.levelA ? 'PASS' : 'FAIL'}</span></p>
        <p>Level AA: <span class="${report.wcagCompliance.levelAA ? 'pass' : 'fail'}">${report.wcagCompliance.levelAA ? 'PASS' : 'FAIL'}</span></p>
        <p>Level AAA: <span class="${report.wcagCompliance.levelAAA ? 'pass' : 'fail'}">${report.wcagCompliance.levelAAA ? 'PASS' : 'FAIL'}</span></p>
    </div>
    
    <h2>Violations</h2>
    ${report.violations.map(violation => `
        <div class="violation ${violation.severity}">
            <h3>${violation.rule.name} (${violation.rule.id})</h3>
            <p><strong>Type:</strong> ${violation.type}</p>
            <p><strong>Severity:</strong> ${violation.severity}</p>
            <p><strong>Message:</strong> ${violation.message}</p>
            <p><strong>Selector:</strong> <code>${violation.selector}</code></p>
            <p><strong>Remediation:</strong> ${violation.remediation}</p>
        </div>
    `).join('')}
    
    ${report.recommendations.length > 0 ? `
        <h2>Recommendations</h2>
        <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    ` : ''}
</body>
</html>`;
    return html;
  }
}
