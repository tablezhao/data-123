/**
 * Screen Reader Compatibility Testing Framework
 * Automated WCAG 2.1 screen reader accessibility validation
 */

import { ScreenReaderTest, AriaImplementationTest, SemanticStructureTest } from './types';

export class ScreenReaderTester {
  private static instance: ScreenReaderTester;
  
  private constructor() {}
  
  static getInstance(): ScreenReaderTester {
    if (!this.instance) {
      this.instance = new ScreenReaderTester();
    }
    return this.instance;
  }

  /**
   * Test screen reader compatibility for an element
   */
  testScreenReaderCompatibility(element: HTMLElement): ScreenReaderTest {
    const issues: string[] = [];
    
    // Test label
    const label = this.getElementLabel(element);
    if (!label) {
      issues.push('Element lacks accessible label');
    }
    
    // Test description
    const description = this.getElementDescription(element);
    
    // Test role
    const role = this.getElementRole(element);
    if (!role && this.requiresRole(element)) {
      issues.push('Element lacks appropriate ARIA role');
    }
    
    // Test alt text for images
    const altText = this.getAltText(element);
    if (element.tagName === 'IMG' && !altText) {
      issues.push('Image lacks alt text');
    }
    
    // Test headings
    const headings = this.hasProperHeadings(element);
    if (!headings) {
      issues.push('Headings are not properly structured');
    }
    
    // Test landmarks
    const landmarks = this.hasProperLandmarks(element);
    if (!landmarks) {
      issues.push('Page lacks proper ARIA landmarks');
    }
    
    // Test forms
    const forms = this.hasProperFormLabels(element);
    if (!forms) {
      issues.push('Form controls lack proper labels');
    }
    
    // Test tables
    const tables = this.hasProperTableStructure(element);
    if (!tables) {
      issues.push('Tables lack proper structure');
    }
    
    return {
      element,
      label: label || '',
      description: description || '',
      role: role || '',
      altText: altText || '',
      headings,
      landmarks,
      forms,
      tables,
      issues
    };
  }

  /**
   * Get element label
   */
  private getElementLabel(element: HTMLElement): string | null {
    // Check aria-label
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) {
      return ariaLabel;
    }
    
    // Check aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labels = labelledBy.split(' ').map(id => {
        const labelElement = document.getElementById(id);
        return labelElement ? labelElement.textContent : '';
      }).filter(Boolean).join(' ');
      
      if (labels) {
        return labels;
      }
    }
    
    // Check for associated label element
    if (element.id) {
      const labelElement = document.querySelector(`label[for="${element.id}"]`);
      if (labelElement) {
        return labelElement.textContent;
      }
    }
    
    // Check if element is wrapped in a label
    const parentLabel = element.closest('label');
    if (parentLabel) {
      return parentLabel.textContent;
    }
    
    // Check for title attribute
    const title = element.getAttribute('title');
    if (title) {
      return title;
    }
    
    // Check for placeholder (for input elements)
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      const placeholder = (element as HTMLInputElement).placeholder;
      if (placeholder) {
        return placeholder;
      }
    }
    
    // Check for button text content
    if (element.tagName === 'BUTTON') {
      return element.textContent;
    }
    
    // Check for link text content
    if (element.tagName === 'A') {
      return element.textContent;
    }
    
    return null;
  }

  /**
   * Get element description
   */
  private getElementDescription(element: HTMLElement): string | null {
    // Check aria-describedby
    const describedBy = element.getAttribute('aria-describedby');
    if (describedBy) {
      const descriptions = describedBy.split(' ').map(id => {
        const descElement = document.getElementById(id);
        return descElement ? descElement.textContent : '';
      }).filter(Boolean).join(' ');
      
      if (descriptions) {
        return descriptions;
      }
    }
    
    // Check for title attribute (if not used as label)
    if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
      const title = element.getAttribute('title');
      if (title) {
        return title;
      }
    }
    
    return null;
  }

  /**
   * Get element role
   */
  private getElementRole(element: HTMLElement): string | null {
    // Check explicit role
    const role = element.getAttribute('role');
    if (role) {
      return role;
    }
    
    // Check implicit roles
    const tagName = element.tagName.toLowerCase();
    const implicitRoles: Record<string, string> = {
      'a': 'link',
      'button': 'button',
      'input': this.getInputRole(element as HTMLInputElement),
      'select': 'combobox',
      'textarea': 'textbox',
      'img': 'img',
      'h1': 'heading',
      'h2': 'heading',
      'h3': 'heading',
      'h4': 'heading',
      'h5': 'heading',
      'h6': 'heading',
      'nav': 'navigation',
      'main': 'main',
      'aside': 'complementary',
      'header': 'banner',
      'footer': 'contentinfo',
      'section': 'region',
      'article': 'article',
      'form': 'form',
      'table': 'table',
      'ul': 'list',
      'ol': 'list',
      'li': 'listitem',
      'fieldset': 'group',
      'legend': null, // No implicit role
      'label': null, // No implicit role
      'span': null, // No implicit role
      'div': null // No implicit role
    };
    
    return implicitRoles[tagName] || null;
  }

  /**
   * Get input role based on type
   */
  private getInputRole(input: HTMLInputElement): string {
    const type = input.type;
    const roleMap: Record<string, string> = {
      'button': 'button',
      'checkbox': 'checkbox',
      'radio': 'radio',
      'range': 'slider',
      'search': 'searchbox',
      'email': 'textbox',
      'tel': 'textbox',
      'url': 'textbox',
      'number': 'spinbutton',
      'date': 'textbox',
      'time': 'textbox',
      'datetime-local': 'textbox',
      'month': 'textbox',
      'week': 'textbox',
      'color': 'textbox',
      'file': 'textbox',
      'hidden': 'textbox',
      'image': 'button',
      'reset': 'button',
      'submit': 'button'
    };
    
    return roleMap[type] || 'textbox';
  }

  /**
   * Check if element requires a role
   */
  private requiresRole(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    const requiresRoleTags = ['div', 'span', 'p', 'i', 'b', 'strong', 'em'];
    
    return requiresRoleTags.includes(tagName);
  }

  /**
   * Get alt text for images
   */
  private getAltText(element: HTMLElement): string | null {
    if (element.tagName === 'IMG') {
      return (element as HTMLImageElement).alt || null;
    }
    
    return null;
  }

  /**
   * Check heading structure
   */
  private hasProperHeadings(element: HTMLElement): boolean {
    const container = element.closest('main, body, [role="main"]') || document.body;
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    if (headings.length === 0) {
      return true; // No headings is not necessarily an error
    }
    
    // Check for h1
    const h1s = container.querySelectorAll('h1');
    if (h1s.length === 0) {
      return false; // Should have at least one h1
    }
    
    // Check heading hierarchy
    let previousLevel = 0;
    for (const heading of headings) {
      const level = parseInt(heading.tagName.charAt(1));
      
      // Allow skipping levels when going down, but not when going up
      if (level > previousLevel + 1 && previousLevel > 0) {
        return false;
      }
      
      previousLevel = level;
    }
    
    return true;
  }

  /**
   * Check landmark structure
   */
  private hasProperLandmarks(element: HTMLElement): boolean {
    const container = element.closest('body') || document.body;
    
    // Check for main landmark
    const main = container.querySelector('main, [role="main"]');
    if (!main) {
      return false;
    }
    
    // Check for navigation landmark
    const nav = container.querySelector('nav, [role="navigation"]');
    if (!nav) {
      return false;
    }
    
    // Check for banner landmark (header)
    const banner = container.querySelector('header, [role="banner"]');
    if (!banner) {
      return false;
    }
    
    // Check for contentinfo landmark (footer)
    const contentinfo = container.querySelector('footer, [role="contentinfo"]');
    if (!contentinfo) {
      return false;
    }
    
    return true;
  }

  /**
   * Check form labels
   */
  private hasProperFormLabels(element: HTMLElement): boolean {
    const forms = element.closest('form') ? [element.closest('form')] : 
                 element.tagName === 'FORM' ? [element] : 
                 Array.from(document.querySelectorAll('form'));
    
    for (const form of forms) {
      if (!(form instanceof HTMLFormElement)) continue;
      
      const inputs = form.querySelectorAll('input, select, textarea');
      
      for (const input of inputs) {
        if (!(input instanceof HTMLElement)) continue;
        
        // Skip hidden inputs and submit buttons
        if (input.type === 'hidden' || input.type === 'submit') continue;
        
        // Check if input has proper labeling
        if (!this.getElementLabel(input)) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Check table structure
   */
  private hasProperTableStructure(element: HTMLElement): boolean {
    const tables = element.tagName === 'TABLE' ? [element] : 
                  element.querySelectorAll('table');
    
    for (const table of tables) {
      if (!(table instanceof HTMLTableElement)) continue;
      
      // Check for caption
      const caption = table.querySelector('caption');
      if (!caption) {
        return false;
      }
      
      // Check for headers
      const headers = table.querySelectorAll('th');
      if (headers.length === 0) {
        return false;
      }
      
      // Check for scope attributes
      for (const header of headers) {
        if (!(header instanceof HTMLTableCellElement)) continue;
        
        if (!header.getAttribute('scope')) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Test ARIA implementation
   */
  testARIAImplementation(element: HTMLElement): AriaImplementationTest {
    const issues: string[] = [];
    
    // Test role
    const role = element.getAttribute('role') || '';
    
    // Test label
    const label = element.getAttribute('aria-label') || '';
    const labelledBy = element.getAttribute('aria-labelledby') || '';
    
    // Test description
    const describedBy = element.getAttribute('aria-describedby') || '';
    
    // Test states and properties
    const expanded = element.getAttribute('aria-expanded') === 'true';
    const pressed = element.getAttribute('aria-pressed') === 'true';
    const checked = element.getAttribute('aria-checked') === 'true';
    const selected = element.getAttribute('aria-selected') === 'true';
    const invalid = element.getAttribute('aria-invalid') === 'true';
    const required = element.getAttribute('aria-required') === 'true';
    const disabled = element.getAttribute('aria-disabled') === 'true';
    const readonly = element.getAttribute('aria-readonly') === 'true';
    
    // Validate ARIA usage
    if (role) {
      const validRoles = this.getValidARIARoles();
      if (!validRoles.includes(role)) {
        issues.push(`Invalid ARIA role: ${role}`);
      }
    }
    
    // Check for proper ARIA usage patterns
    if (labelledBy && !document.getElementById(labelledBy)) {
      issues.push(`aria-labelledby references non-existent element: ${labelledBy}`);
    }
    
    if (describedBy && !document.getElementById(describedBy)) {
      issues.push(`aria-describedby references non-existent element: ${describedBy}`);
    }
    
    return {
      element,
      role,
      label,
      labelledBy,
      describedBy,
      expanded,
      pressed,
      checked,
      selected,
      invalid,
      required,
      disabled,
      readonly,
      issues
    };
  }

  /**
   * Get valid ARIA roles
   */
  private getValidARIARoles(): string[] {
    return [
      'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
      'cell', 'checkbox', 'columnheader', 'combobox', 'complementary', 'contentinfo',
      'definition', 'dialog', 'directory', 'document', 'feed', 'figure', 'form',
      'grid', 'gridcell', 'group', 'heading', 'img', 'link', 'list', 'listbox',
      'listitem', 'log', 'main', 'marquee', 'math', 'menu', 'menubar', 'menuitem',
      'menuitemcheckbox', 'menuitemradio', 'navigation', 'none', 'note', 'option',
      'presentation', 'progressbar', 'radio', 'radiogroup', 'region', 'row',
      'rowgroup', 'rowheader', 'scrollbar', 'search', 'searchbox', 'separator',
      'slider', 'spinbutton', 'status', 'switch', 'tab', 'table', 'tablist',
      'tabpanel', 'term', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree',
      'treegrid', 'treeitem'
    ];
  }

  /**
   * Test semantic structure
   */
  testSemanticStructure(container: HTMLElement = document.body): SemanticStructureTest {
    return {
      headings: this.analyzeHeadings(container),
      landmarks: this.analyzeLandmarks(container),
      lists: this.analyzeLists(container),
      forms: this.analyzeForms(container),
      tables: this.analyzeTables(container)
    };
  }

  /**
   * Analyze headings structure
   */
  private analyzeHeadings(container: HTMLElement) {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const counts = { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };
    let empty = 0;
    
    headings.forEach(heading => {
      const level = heading.tagName.toLowerCase() as keyof typeof counts;
      counts[level]++;
      
      if (!heading.textContent?.trim()) {
        empty++;
      }
    });
    
    // Check hierarchy
    let hierarchy = true;
    let previousLevel = 0;
    for (const heading of headings) {
      const level = parseInt(heading.tagName.charAt(1));
      
      if (level > previousLevel + 1 && previousLevel > 0) {
        hierarchy = false;
        break;
      }
      
      previousLevel = level;
    }
    
    return {
      ...counts,
      hierarchy,
      empty
    };
  }

  /**
   * Analyze landmarks structure
   */
  private analyzeLandmarks(container: HTMLElement) {
    return {
      main: container.querySelectorAll('main, [role="main"]').length,
      nav: container.querySelectorAll('nav, [role="navigation"]').length,
      aside: container.querySelectorAll('aside, [role="complementary"]').length,
      header: container.querySelectorAll('header, [role="banner"]').length,
      footer: container.querySelectorAll('footer, [role="contentinfo"]').length,
      section: container.querySelectorAll('section, [role="region"]').length,
      article: container.querySelectorAll('article, [role="article"]').length,
      search: container.querySelectorAll('[role="search"]').length
    };
  }

  /**
   * Analyze lists structure
   */
  private analyzeLists(container: HTMLElement) {
    const lists = {
      ul: container.querySelectorAll('ul').length,
      ol: container.querySelectorAll('ol').length,
      dl: container.querySelectorAll('dl').length,
      structured: true
    };
    
    // Check if lists are properly structured
    const allLists = container.querySelectorAll('ul, ol, dl');
    for (const list of allLists) {
      if (list.tagName === 'DL') {
        const hasDt = list.querySelector('dt');
        const hasDd = list.querySelector('dd');
        if (!hasDt || !hasDd) {
          lists.structured = false;
          break;
        }
      } else {
        const hasLi = list.querySelector('li');
        if (!hasLi) {
          lists.structured = false;
          break;
        }
      }
    }
    
    return lists;
  }

  /**
   * Analyze forms structure
   */
  private analyzeForms(container: HTMLElement) {
    const forms = container.querySelectorAll('form');
    const analysis = {
      labels: container.querySelectorAll('label').length,
      fieldsets: container.querySelectorAll('fieldset').length,
      legends: container.querySelectorAll('legend').length,
      required: container.querySelectorAll('[required], [aria-required="true"]').length,
      errors: [] as string[]
    };
    
    // Check for form issues
    for (const form of forms) {
      const inputs = form.querySelectorAll('input, select, textarea');
      
      for (const input of inputs) {
        if (!(input instanceof HTMLElement)) continue;
        
        // Skip hidden inputs and submit buttons
        if ((input as HTMLInputElement).type === 'hidden' || 
            (input as HTMLInputElement).type === 'submit') continue;
        
        // Check if input has proper labeling
        if (!this.getElementLabel(input)) {
          analysis.errors.push(`Form control lacks label: ${input.id || input.tagName}`);
        }
      }
    }
    
    return analysis;
  }

  /**
   * Analyze tables structure
   */
  private analyzeTables(container: HTMLElement) {
    const tables = container.querySelectorAll('table');
    const analysis = {
      tables: tables.length,
      captions: container.querySelectorAll('caption').length,
      headers: container.querySelectorAll('th').length,
      scopes: container.querySelectorAll('th[scope]').length,
      summaries: container.querySelectorAll('table[summary]').length,
      errors: [] as string[]
    };
    
    // Check for table issues
    for (const table of tables) {
      if (!(table instanceof HTMLTableElement)) continue;
      
      // Check for caption
      if (!table.querySelector('caption')) {
        analysis.errors.push(`Table lacks caption: ${table.id || 'unnamed'}`);
      }
      
      // Check for headers
      const headers = table.querySelectorAll('th');
      if (headers.length === 0) {
        analysis.errors.push(`Table lacks headers: ${table.id || 'unnamed'}`);
      }
      
      // Check for scope attributes
      for (const header of headers) {
        if (!header.getAttribute('scope')) {
          analysis.errors.push(`Header lacks scope attribute: ${header.textContent}`);
        }
      }
    }
    
    return analysis;
  }
}