/**
 * Keyboard Navigation Testing Framework
 * Automated WCAG 2.1 keyboard accessibility validation
 */

import { KeyboardNavigationTest, FocusManagementTest } from './types';

export class KeyboardNavigator {
  private static instance: KeyboardNavigator;
  private tabbableElements: HTMLElement[] = [];
  private currentFocusIndex: number = -1;
  
  private constructor() {}
  
  static getInstance(): KeyboardNavigator {
    if (!this.instance) {
      this.instance = new KeyboardNavigator();
    }
    return this.instance;
  }

  /**
   * Get all tabbable elements in order
   */
  getTabbableElements(container: HTMLElement = document.body): HTMLElement[] {
    const tabbableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
      'audio[controls]',
      'video[controls]',
      'details > summary:first-of-type',
      'iframe',
      'object',
      'embed'
    ];
    
    const elements = container.querySelectorAll(tabbableSelectors.join(','));
    const tabbable: HTMLElement[] = [];
    
    elements.forEach(element => {
      if (element instanceof HTMLElement && this.isElementTabbable(element)) {
        tabbable.push(element);
      }
    });
    
    // Sort by tabindex (positive values first, then document order)
    return tabbable.sort((a, b) => {
      const aTabindex = parseInt(a.getAttribute('tabindex') || '0');
      const bTabindex = parseInt(b.getAttribute('tabindex') || '0');
      
      if (aTabindex > 0 && bTabindex > 0) {
        return aTabindex - bTabindex;
      }
      if (aTabindex > 0) return -1;
      if (bTabindex > 0) return 1;
      
      // Both have tabindex 0 or negative, maintain document order
      const position = a.compareDocumentPosition(b);
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
  }

  /**
   * Check if element is tabbable
   */
  private isElementTabbable(element: HTMLElement): boolean {
    // Check if element is visible
    if (!this.isElementVisible(element)) {
      return false;
    }
    
    // Check tabindex
    const tabindex = element.getAttribute('tabindex');
    if (tabindex && parseInt(tabindex) < 0) {
      return false;
    }
    
    // Check disabled state
    if (element.hasAttribute('disabled')) {
      return false;
    }
    
    // Check for hidden attribute
    if (element.hasAttribute('hidden')) {
      return false;
    }
    
    // Check aria-hidden
    if (element.getAttribute('aria-hidden') === 'true') {
      return false;
    }
    
    return true;
  }

  /**
   * Check if element is visible
   */
  private isElementVisible(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    // Check if element has zero dimensions
    if (rect.width === 0 || rect.height === 0) {
      return false;
    }
    
    // Check if element is hidden with display: none or visibility: hidden
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false;
    }
    
    // Check opacity
    if (parseFloat(style.opacity) === 0) {
      return false;
    }
    
    return true;
  }

  /**
   * Test keyboard navigation for a container
   */
  testKeyboardNavigation(container: HTMLElement = document.body): KeyboardNavigationTest[] {
    const elements = this.getTabbableElements(container);
    const tests: KeyboardNavigationTest[] = [];
    
    elements.forEach((element, index) => {
      const test = this.testElementNavigation(element, index, elements);
      tests.push(test);
    });
    
    return tests;
  }

  /**
   * Test individual element navigation
   */
  private testElementNavigation(element: HTMLElement, index: number, allElements: HTMLElement[]): KeyboardNavigationTest {
    const issues: string[] = [];
    
    // Test tabbability
    const tabbable = this.isElementTabbable(element);
    if (!tabbable) {
      issues.push('Element appears to be focusable but is not tabbable');
    }
    
    // Test focusability
    const focusable = this.isElementFocusable(element);
    if (!focusable) {
      issues.push('Element is not focusable');
    }
    
    // Test focus indicator
    const focusIndicator = this.hasFocusIndicator(element);
    if (!focusIndicator) {
      issues.push('Element lacks visible focus indicator');
    }
    
    // Test skip links
    const skipLink = this.isSkipLink(element);
    
    // Test logical order
    const logicalOrder = this.hasLogicalOrder(element, index, allElements);
    if (!logicalOrder) {
      issues.push('Element is not in logical tab order');
    }
    
    // Test for keyboard traps
    const trap = this.hasKeyboardTrap(element);
    if (trap) {
      issues.push('Element may create a keyboard trap');
    }
    
    // Test for keyboard shortcuts
    const shortcuts = this.getKeyboardShortcuts(element);
    
    return {
      element,
      tabbable,
      focusable,
      focusIndicator,
      skipLink,
      logicalOrder,
      trap,
      shortcuts,
      issues
    };
  }

  /**
   * Check if element is focusable
   */
  private isElementFocusable(element: HTMLElement): boolean {
    try {
      element.focus();
      return document.activeElement === element;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if element has focus indicator
   */
  private hasFocusIndicator(element: HTMLElement): boolean {
    const computedStyle = window.getComputedStyle(element);
    
    // Check for outline
    const outlineWidth = parseFloat(computedStyle.outlineWidth);
    const outlineColor = computedStyle.outlineColor;
    const outlineStyle = computedStyle.outlineStyle;
    
    if (outlineWidth > 0 && outlineStyle !== 'none' && outlineColor !== 'transparent') {
      return true;
    }
    
    // Check for box-shadow
    const boxShadow = computedStyle.boxShadow;
    if (boxShadow && boxShadow !== 'none') {
      return true;
    }
    
    // Check for border changes
    const borderWidth = parseFloat(computedStyle.borderWidth);
    const borderColor = computedStyle.borderColor;
    
    if (borderWidth > 0 && borderColor !== 'transparent') {
      return true;
    }
    
    // Check for background changes
    const backgroundColor = computedStyle.backgroundColor;
    if (backgroundColor && backgroundColor !== 'transparent') {
      return true;
    }
    
    return false;
  }

  /**
   * Check if element is a skip link
   */
  private isSkipLink(element: HTMLElement): boolean {
    const text = element.textContent?.toLowerCase() || '';
    const href = element.getAttribute('href') || '';
    
    const skipKeywords = ['skip', 'jump', 'bypass'];
    const skipTargets = ['#main', '#content', '#navigation'];
    
    const hasSkipText = skipKeywords.some(keyword => text.includes(keyword));
    const hasSkipTarget = skipTargets.some(target => href.includes(target));
    
    return hasSkipText || hasSkipTarget;
  }

  /**
   * Check if element is in logical order
   */
  private hasLogicalOrder(element: HTMLElement, index: number, allElements: HTMLElement[]): boolean {
    // This is a simplified check - in a real implementation, you'd want to
    // consider the visual layout and DOM structure more carefully
    const rect = element.getBoundingClientRect();
    const previousElement = index > 0 ? allElements[index - 1] : null;
    
    if (previousElement) {
      const previousRect = previousElement.getBoundingClientRect();
      
      // Check if current element is visually after previous element
      if (rect.top < previousRect.bottom - 10) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Check for keyboard traps
   */
  private hasKeyboardTrap(element: HTMLElement): boolean {
    // Check for modal dialogs without proper focus management
    const role = element.getAttribute('role');
    if (role === 'dialog' || role === 'modal') {
      // Check if there's a proper focus management mechanism
      const hasFocusManagement = element.querySelector('[data-focus-trap]') !== null;
      if (!hasFocusManagement) {
        return true;
      }
    }
    
    // Check for elements that might trap focus
    const trapIndicators = ['trap', 'loop', 'cycle'];
    const className = element.className.toLowerCase();
    const id = element.id.toLowerCase();
    
    return trapIndicators.some(indicator => 
      className.includes(indicator) || id.includes(indicator)
    );
  }

  /**
   * Get keyboard shortcuts for element
   */
  private getKeyboardShortcuts(element: HTMLElement): string[] {
    const shortcuts: string[] = [];
    
    // Check accesskey attribute
    const accessKey = element.getAttribute('accesskey');
    if (accessKey) {
      shortcuts.push(`Alt+${accessKey}`);
    }
    
    // Check for common keyboard event listeners
    const onclick = element.getAttribute('onclick');
    if (onclick && onclick.includes('keydown')) {
      shortcuts.push('Custom keyboard handler detected');
    }
    
    return shortcuts;
  }

  /**
   * Test focus management
   */
  testFocusManagement(element: HTMLElement): FocusManagementTest {
    const issues: string[] = [];
    
    // Test focus visibility
    const visible = this.hasFocusIndicator(element);
    if (!visible) {
      issues.push('Focus indicator is not visible');
    }
    
    // Test focus sufficiency
    const sufficient = this.hasSufficientFocusIndicator(element);
    if (!sufficient) {
      issues.push('Focus indicator is not sufficient');
    }
    
    // Get focus indicator properties
    const focusProps = this.getFocusIndicatorProperties(element);
    
    // Test focus contrast
    const contrast = this.getFocusContrast(element);
    
    return {
      element,
      visible,
      sufficient,
      color: focusProps.color,
      style: focusProps.style,
      width: focusProps.width,
      offset: focusProps.offset,
      contrast,
      issues
    };
  }

  /**
   * Check if focus indicator is sufficient
   */
  private hasSufficientFocusIndicator(element: HTMLElement): boolean {
    const computedStyle = window.getComputedStyle(element);
    
    // Check outline width (minimum 2px)
    const outlineWidth = parseFloat(computedStyle.outlineWidth);
    if (outlineWidth >= 2) {
      return true;
    }
    
    // Check border width (minimum 2px)
    const borderWidth = parseFloat(computedStyle.borderWidth);
    if (borderWidth >= 2) {
      return true;
    }
    
    // Check box-shadow spread (minimum 2px)
    const boxShadow = computedStyle.boxShadow;
    if (boxShadow && boxShadow !== 'none') {
      const shadowMatch = boxShadow.match(/(\d+)px/);
      if (shadowMatch && parseInt(shadowMatch[1]) >= 2) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get focus indicator properties
   */
  private getFocusIndicatorProperties(element: HTMLElement): {
    color: string;
    style: string;
    width: number;
    offset: number;
  } {
    const computedStyle = window.getComputedStyle(element);
    
    return {
      color: computedStyle.outlineColor || computedStyle.borderColor || computedStyle.backgroundColor,
      style: computedStyle.outlineStyle || computedStyle.borderStyle || 'solid',
      width: parseFloat(computedStyle.outlineWidth) || parseFloat(computedStyle.borderWidth) || 0,
      offset: parseFloat(computedStyle.outlineOffset) || 0
    };
  }

  /**
   * Get focus contrast ratio
   */
  private getFocusContrast(element: HTMLElement): number {
    // This would require the ColorContrastAnalyzer
    // For now, return a placeholder value
    return 4.5;
  }

  /**
   * Simulate keyboard navigation
   */
  async simulateKeyboardNavigation(container: HTMLElement = document.body): Promise<{
    path: HTMLElement[];
    issues: string[];
    duration: number;
  }> {
    const startTime = performance.now();
    const elements = this.getTabbableElements(container);
    const path: HTMLElement[] = [];
    const issues: string[] = [];
    
    for (const element of elements) {
      try {
        element.focus();
        path.push(element);
        
        // Check if focus was successful
        if (document.activeElement !== element) {
          issues.push(`Failed to focus element: ${element.tagName}${element.id ? '#' + element.id : ''}`);
        }
        
        // Small delay to simulate user interaction
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        issues.push(`Error focusing element: ${error}`);
      }
    }
    
    const duration = performance.now() - startTime;
    
    return {
      path,
      issues,
      duration
    };
  }

  /**
   * Test for common keyboard navigation issues
   */
  testCommonIssues(container: HTMLElement = document.body): {
    skipLinks: boolean;
    focusVisible: boolean;
    logicalOrder: boolean;
    noTraps: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    // Test skip links
    const skipLinks = this.hasSkipLinks(container);
    if (!skipLinks) {
      issues.push('No skip links found for keyboard navigation');
    }
    
    // Test focus visibility
    const focusVisible = this.hasVisibleFocus(container);
    if (!focusVisible) {
      issues.push('Focus indicators are not consistently visible');
    }
    
    // Test logical order
    const logicalOrder = this.hasLogicalTabOrder(container);
    if (!logicalOrder) {
      issues.push('Tab order is not logical');
    }
    
    // Test for keyboard traps
    const noTraps = this.hasNoKeyboardTraps(container);
    if (!noTraps) {
      issues.push('Potential keyboard traps detected');
    }
    
    return {
      skipLinks,
      focusVisible,
      logicalOrder,
      noTraps,
      issues
    };
  }

  /**
   * Check for skip links
   */
  private hasSkipLinks(container: HTMLElement): boolean {
    const links = container.querySelectorAll('a[href^="#"]');
    return Array.from(links).some(link => {
      const text = link.textContent?.toLowerCase() || '';
      return text.includes('skip') || text.includes('jump') || text.includes('bypass');
    });
  }

  /**
   * Check for visible focus indicators
   */
  private hasVisibleFocus(container: HTMLElement): boolean {
    const focusableElements = this.getTabbableElements(container);
    return focusableElements.some(element => this.hasFocusIndicator(element));
  }

  /**
   * Check for logical tab order
   */
  private hasLogicalTabOrder(container: HTMLElement): boolean {
    const elements = this.getTabbableElements(container);
    
    // Simple check: elements should generally follow document order
    for (let i = 1; i < elements.length; i++) {
      const current = elements[i];
      const previous = elements[i - 1];
      
      if (current.compareDocumentPosition(previous) & Node.DOCUMENT_POSITION_PRECEDING) {
        continue; // Correct order
      } else {
        return false; // Incorrect order
      }
    }
    
    return true;
  }

  /**
   * Check for keyboard traps
   */
  private hasNoKeyboardTraps(container: HTMLElement): boolean {
    // This is a simplified check
    // In a real implementation, you'd want to test actual keyboard navigation
    const modals = container.querySelectorAll('[role="dialog"], [role="modal"]');
    
    return Array.from(modals).every(modal => {
      // Check if modal has proper focus management
      return modal.querySelector('[data-focus-trap]') !== null ||
             modal.querySelector('[aria-modal="true"]') !== null;
    });
  }
}