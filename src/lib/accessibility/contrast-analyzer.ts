/**
 * Color Contrast Analyzer
 * Automated WCAG 2.1 contrast ratio validation and analysis
 */

import { ColorContrastResult, ContrastTest } from './types';

export interface RGBColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface HSLColor {
  h: number;
  s: number;
  l: number;
  a?: number;
}

export class ColorContrastAnalyzer {
  private static instance: ColorContrastAnalyzer;
  
  private constructor() {}
  
  static getInstance(): ColorContrastAnalyzer {
    if (!this.instance) {
      this.instance = new ColorContrastAnalyzer();
    }
    return this.instance;
  }

  /**
   * Parse color string to RGB values
   */
  parseColor(color: string): RGBColor | null {
    color = color.trim();
    
    // Handle hex colors
    if (color.startsWith('#')) {
      return this.parseHexColor(color);
    }
    
    // Handle rgb/rgba colors
    if (color.startsWith('rgb')) {
      return this.parseRGBColor(color);
    }
    
    // Handle hsl/hsla colors
    if (color.startsWith('hsl')) {
      const hsl = this.parseHSLColor(color);
      return hsl ? this.hslToRgb(hsl) : null;
    }
    
    // Handle named colors
    return this.parseNamedColor(color);
  }

  /**
   * Parse hex color
   */
  private parseHexColor(hex: string): RGBColor | null {
    hex = hex.replace('#', '');
    
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    
    if (hex.length !== 6) {
      return null;
    }
    
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return null;
    }
    
    return { r, g, b, a: 1 };
  }

  /**
   * Parse RGB/RGBA color
   */
  private parseRGBColor(rgb: string): RGBColor | null {
    const match = rgb.match(/rgba?\(([^)]+)\)/);
    if (!match) return null;
    
    const values = match[1].split(',').map(v => parseFloat(v.trim()));
    if (values.length < 3) return null;
    
    const [r, g, b, a = 1] = values;
    
    if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) {
      return null;
    }
    
    return { r, g, b, a };
  }

  /**
   * Parse HSL/HSLA color
   */
  private parseHSLColor(hsl: string): HSLColor | null {
    const match = hsl.match(/hsla?\(([^)]+)\)/);
    if (!match) return null;
    
    const values = match[1].split(',').map(v => v.trim());
    if (values.length < 3) return null;
    
    const h = parseFloat(values[0]);
    const s = parseFloat(values[1].replace('%', '')) / 100;
    const l = parseFloat(values[2].replace('%', '')) / 100;
    const a = values[3] ? parseFloat(values[3]) : 1;
    
    if (isNaN(h) || isNaN(s) || isNaN(l) || isNaN(a)) {
      return null;
    }
    
    return { h, s, l, a };
  }

  /**
   * Convert HSL to RGB
   */
  private hslToRgb(hsl: HSLColor): RGBColor {
    const { h, s, l, a = 1 } = hsl;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x;
    }
    
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
      a
    };
  }

  /**
   * Parse named colors
   */
  private parseNamedColor(name: string): RGBColor | null {
    const colors: Record<string, string> = {
      'transparent': 'rgba(0,0,0,0)',
      'black': '#000000',
      'white': '#ffffff',
      'red': '#ff0000',
      'green': '#008000',
      'blue': '#0000ff',
      'yellow': '#ffff00',
      'cyan': '#00ffff',
      'magenta': '#ff00ff',
      'silver': '#c0c0c0',
      'gray': '#808080',
      'grey': '#808080',
      'maroon': '#800000',
      'olive': '#808000',
      'lime': '#00ff00',
      'aqua': '#00ffff',
      'teal': '#008080',
      'navy': '#000080',
      'fuchsia': '#ff00ff',
      'purple': '#800080'
    };
    
    const normalizedName = name.toLowerCase();
    if (colors[normalizedName]) {
      return this.parseColor(colors[normalizedName]);
    }
    
    return null;
  }

  /**
   * Calculate relative luminance
   */
  calculateLuminance(color: RGBColor): number {
    const { r, g, b } = color;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  calculateContrastRatio(color1: RGBColor, color2: RGBColor): number {
    const lum1 = this.calculateLuminance(color1);
    const lum2 = this.calculateLuminance(color2);
    
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Check if text is large according to WCAG standards
   */
  isLargeText(fontSize: string, fontWeight: string | number): boolean {
    const size = parseFloat(fontSize);
    const weight = typeof fontWeight === 'string' ? parseInt(fontWeight) : fontWeight;
    
    // Large text: 18pt (24px) or larger, or 14pt (18.66px) or larger if bold
    if (fontSize.includes('pt')) {
      return size >= 18 || (size >= 14 && weight >= 700);
    }
    
    if (fontSize.includes('px')) {
      return size >= 24 || (size >= 18.66 && weight >= 700);
    }
    
    // Assume rem/em units, 1rem = 16px
    const pxSize = size * 16;
    return pxSize >= 24 || (pxSize >= 18.66 && weight >= 700);
  }

  /**
   * Analyze contrast for an element
   */
  analyzeElementContrast(element: HTMLElement): ColorContrastResult | null {
    const computedStyle = window.getComputedStyle(element);
    
    const foreground = this.parseColor(computedStyle.color);
    const background = this.getBackgroundColor(element);
    
    if (!foreground || !background) {
      return null;
    }
    
    const ratio = this.calculateContrastRatio(foreground, background);
    const fontSize = computedStyle.fontSize;
    const fontWeight = computedStyle.fontWeight;
    const isLarge = this.isLargeText(fontSize, fontWeight);
    
    return {
      ratio,
      levelAA: isLarge ? ratio >= 3 : ratio >= 4.5,
      levelAAA: isLarge ? ratio >= 4.5 : ratio >= 7,
      largeTextAA: ratio >= 3,
      largeTextAAA: ratio >= 4.5,
      foreground: computedStyle.color,
      background: this.colorToString(background),
      recommendation: this.getContrastRecommendation(ratio, isLarge)
    };
  }

  /**
   * Get background color of an element
   */
  private getBackgroundColor(element: HTMLElement): RGBColor | null {
    let current = element as HTMLElement | null;
    
    while (current) {
      const style = window.getComputedStyle(current);
      const bg = this.parseColor(style.backgroundColor);
      
      if (bg && bg.a > 0) {
        return bg;
      }
      
      current = current.parentElement;
    }
    
    // Default to white if no background found
    return { r: 255, g: 255, b: 255, a: 1 };
  }

  /**
   * Convert color to string
   */
  private colorToString(color: RGBColor): string {
    if (color.a < 1) {
      return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    }
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
  }

  /**
   * Get contrast recommendation
   */
  private getContrastRecommendation(ratio: number, isLarge: boolean): string {
    const target = isLarge ? 3 : 4.5;
    
    if (ratio >= target) {
      return 'Contrast ratio meets WCAG AA standards';
    }
    
    const improvement = Math.ceil((target - ratio) * 100) / 100;
    return `Contrast ratio needs to be increased by ${improvement}:1 to meet WCAG AA standards`;
  }

  /**
   * Find all text elements with contrast issues
   */
  findContrastViolations(container: HTMLElement = document.body): ContrastTest[] {
    const violations: ContrastTest[] = [];
    const textElements = container.querySelectorAll('*');
    
    textElements.forEach(element => {
      if (element instanceof HTMLElement) {
        const contrast = this.analyzeElementContrast(element);
        if (contrast && !contrast.levelAA) {
          const computedStyle = window.getComputedStyle(element);
          const isLarge = this.isLargeText(computedStyle.fontSize, computedStyle.fontWeight);
          
          violations.push({
            foreground: contrast.foreground,
            background: contrast.background,
            ratio: contrast.ratio,
            largeText: isLarge,
            meetsAA: contrast.levelAA,
            meetsAAA: contrast.levelAAA,
            meetsLargeTextAA: contrast.largeTextAA,
            meetsLargeTextAAA: contrast.largeTextAAA,
            recommendation: contrast.recommendation
          });
        }
      }
    });
    
    return violations;
  }

  /**
   * Get color suggestions for better contrast
   */
  getContrastSuggestions(foreground: string, background: string, targetRatio: number = 4.5): {
    foreground: string;
    background: string;
    ratio: number;
  }[] {
    const fg = this.parseColor(foreground);
    const bg = this.parseColor(background);
    
    if (!fg || !bg) {
      return [];
    }
    
    const currentRatio = this.calculateContrastRatio(fg, bg);
    if (currentRatio >= targetRatio) {
      return [];
    }
    
    const suggestions: { foreground: string; background: string; ratio: number }[] = [];
    
    // Try darkening foreground
    const darkerFg = this.darkenColor(fg, 0.2);
    const darkerRatio = this.calculateContrastRatio(darkerFg, bg);
    if (darkerRatio >= targetRatio) {
      suggestions.push({
        foreground: this.colorToString(darkerFg),
        background,
        ratio: darkerRatio
      });
    }
    
    // Try lightening background
    const lighterBg = this.lightenColor(bg, 0.2);
    const lighterRatio = this.calculateContrastRatio(fg, lighterBg);
    if (lighterRatio >= targetRatio) {
      suggestions.push({
        foreground,
        background: this.colorToString(lighterBg),
        ratio: lighterRatio
      });
    }
    
    // Try lightening foreground (if background is dark)
    const lighterFg = this.lightenColor(fg, 0.2);
    const lightFgRatio = this.calculateContrastRatio(lighterFg, bg);
    if (lightFgRatio >= targetRatio) {
      suggestions.push({
        foreground: this.colorToString(lighterFg),
        background,
        ratio: lightFgRatio
      });
    }
    
    return suggestions;
  }

  /**
   * Darken a color
   */
  private darkenColor(color: RGBColor, amount: number): RGBColor {
    return {
      r: Math.max(0, Math.round(color.r * (1 - amount))),
      g: Math.max(0, Math.round(color.g * (1 - amount))),
      b: Math.max(0, Math.round(color.b * (1 - amount))),
      a: color.a
    };
  }

  /**
   * Lighten a color
   */
  private lightenColor(color: RGBColor, amount: number): RGBColor {
    return {
      r: Math.min(255, Math.round(color.r + (255 - color.r) * amount)),
      g: Math.min(255, Math.round(color.g + (255 - color.g) * amount)),
      b: Math.min(255, Math.round(color.b + (255 - color.b) * amount)),
      a: color.a
    };
  }

  /**
   * Validate color contrast for WCAG compliance
   */
  validateContrast(element: HTMLElement, wcagLevel: 'AA' | 'AAA' = 'AA'): {
    valid: boolean;
    ratio: number;
    required: number;
    issues: string[];
  } {
    const contrast = this.analyzeElementContrast(element);
    if (!contrast) {
      return {
        valid: false,
        ratio: 0,
        required: wcagLevel === 'AA' ? 4.5 : 7,
        issues: ['Unable to analyze contrast']
      };
    }
    
    const computedStyle = window.getComputedStyle(element);
    const isLarge = this.isLargeText(computedStyle.fontSize, computedStyle.fontWeight);
    const required = isLarge ? (wcagLevel === 'AA' ? 3 : 4.5) : (wcagLevel === 'AA' ? 4.5 : 7);
    
    const valid = contrast.ratio >= required;
    const issues: string[] = [];
    
    if (!valid) {
      issues.push(`Contrast ratio ${contrast.ratio.toFixed(2)}:1 is below WCAG ${wcagLevel} requirement of ${required}:1`);
      
      const suggestions = this.getContrastSuggestions(
        contrast.foreground,
        contrast.background,
        required
      );
      
      if (suggestions.length > 0) {
        issues.push(`Suggested improvements: ${suggestions.length} color combinations available`);
      }
    }
    
    return {
      valid,
      ratio: contrast.ratio,
      required,
      issues
    };
  }
}