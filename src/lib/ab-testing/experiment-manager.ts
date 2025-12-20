/**
 * A/B Testing Experiment Manager
 * Manages experiment lifecycle, user assignment, variant selection, and statistical analysis
 */

import { Experiment, Variant, UserSegment, UserAssignment, ExperimentResult } from './types';
import { ABTestingTracker, getTracker } from './tracker';
import { validateMetricValue } from './metrics';

// Experiment configuration manager
export class ExperimentManager {
  private experiments: Map<string, Experiment> = new Map();
  private userAssignments: Map<string, Map<string, UserAssignment>> = new Map();
  private tracker: ABTestingTracker;
  private randomizationUnit: 'user' | 'session' = 'user';

  constructor(tracker?: ABTestingTracker) {
    this.tracker = tracker || getTracker();
  }

  // Load experiments from configuration
  loadExperiments(experiments: Experiment[]): void {
    experiments.forEach(experiment => {
      this.experiments.set(experiment.id, experiment);
    });
  }

  // Add a new experiment
  addExperiment(experiment: Experiment): void {
    this.validateExperiment(experiment);
    this.experiments.set(experiment.id, experiment);
  }

  // Remove an experiment
  removeExperiment(experimentId: string): void {
    this.experiments.delete(experimentId);
    this.userAssignments.delete(experimentId);
  }

  // Get experiment by ID
  getExperiment(experimentId: string): Experiment | undefined {
    return this.experiments.get(experimentId);
  }

  // Get all active experiments for current user
  getActiveExperiments(userId?: string): Experiment[] {
    const now = new Date();
    const userIdToUse = userId || this.tracker.getUserId();
    
    return Array.from(this.experiments.values()).filter(experiment => {
      if (experiment.status !== 'active') return false;
      if (now < experiment.startDate || now > experiment.endDate) return false;
      
      // Check if user is eligible
      return this.isUserEligible(userIdToUse, experiment);
    });
  }

  // Assign user to experiment variant
  assignToExperiment(userId: string, experimentId: string): Variant | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'active') {
      return null;
    }

    // Check if user is already assigned
    const existingAssignment = this.getUserAssignment(userId, experimentId);
    if (existingAssignment) {
      const variant = experiment.variants.find(v => v.id === existingAssignment.variantId);
      return variant || null;
    }

    // Check eligibility
    if (!this.isUserEligible(userId, experiment)) {
      return null;
    }

    // Check traffic allocation
    if (Math.random() > experiment.trafficAllocation) {
      return null;
    }

    // Select variant using randomization
    const selectedVariant = this.selectVariant(experiment);
    if (!selectedVariant) {
      return null;
    }

    // Create assignment
    const assignment: UserAssignment = {
      userId,
      experimentId,
      variantId: selectedVariant.id,
      assignedAt: new Date(),
      status: 'active',
      events: []
    };

    // Store assignment
    this.storeUserAssignment(userId, experimentId, assignment);
    
    // Track assignment
    this.tracker.assignToExperiment(experimentId, selectedVariant.id);
    
    // Apply variant changes
    this.applyVariantChanges(selectedVariant);

    return selectedVariant;
  }

  // Check if user is eligible for experiment
  private isUserEligible(userId: string, experiment: Experiment): boolean {
    // Check segments
    if (experiment.segments.length > 0) {
      const eligibleSegments = experiment.segments.filter(segment => 
        this.matchesSegment(userId, segment)
      );
      
      if (eligibleSegments.length === 0) {
        return false;
      }
    }

    // Check targeting
    if (experiment.targeting.pages.length > 0) {
      const currentUrl = window.location.href;
      const matchesPage = experiment.targeting.pages.some(pattern => 
        this.matchesUrlPattern(currentUrl, pattern)
      );
      
      if (!matchesPage) {
        return false;
      }
    }

    // Check cooldown period
    if (experiment.configuration.cooldownPeriod > 0) {
      const recentExperiments = this.getRecentExperiments(userId, experiment.configuration.cooldownPeriod);
      if (recentExperiments.length > 0) {
        return false;
      }
    }

    return true;
  }

  // Check if user matches segment criteria
  private matchesSegment(userId: string, segment: UserSegment): boolean {
    const criteria = segment.criteria;
    
    // Device type check
    if (criteria.deviceType && criteria.deviceType.length > 0) {
      const deviceType = this.getDeviceType();
      if (!criteria.deviceType.includes(deviceType)) {
        return false;
      }
    }

    // Screen size check
    if (criteria.screenSize) {
      const { width, height } = this.getScreenSize();
      
      if (criteria.screenSize.minWidth && width < criteria.screenSize.minWidth) {
        return false;
      }
      if (criteria.screenSize.maxWidth && width > criteria.screenSize.maxWidth) {
        return false;
      }
      if (criteria.screenSize.minHeight && height < criteria.screenSize.minHeight) {
        return false;
      }
      if (criteria.screenSize.maxHeight && height > criteria.screenSize.maxHeight) {
        return false;
      }
    }

    // Browser check
    if (criteria.browser && criteria.browser.length > 0) {
      const browser = this.getBrowser();
      if (!criteria.browser.includes(browser)) {
        return false;
      }
    }

    // OS check
    if (criteria.os && criteria.os.length > 0) {
      const os = this.getOS();
      if (!criteria.os.includes(os)) {
        return false;
      }
    }

    // New vs returning check
    if (criteria.newVsReturning) {
      const isNewUser = this.isNewUser(userId);
      if (criteria.newVsReturning === 'new' && !isNewUser) {
        return false;
      }
      if (criteria.newVsReturning === 'returning' && isNewUser) {
        return false;
      }
    }

    // Custom attributes check
    if (criteria.customAttributes) {
      const userAttributes = this.getUserAttributes(userId);
      for (const [key, value] of Object.entries(criteria.customAttributes)) {
        if (userAttributes[key] !== value) {
          return false;
        }
      }
    }

    return true;
  }

  // Select variant using randomization
  private selectVariant(experiment: Experiment): Variant | null {
    const random = Math.random();
    let cumulativeProbability = 0;

    for (const variant of experiment.variants) {
      cumulativeProbability += variant.allocation;
      if (random <= cumulativeProbability) {
        return variant;
      }
    }

    // Fallback to first variant if randomization fails
    return experiment.variants[0] || null;
  }

  // Apply variant changes to the page
  private applyVariantChanges(variant: Variant): void {
    variant.changes.forEach(change => {
      try {
        switch (change.type) {
          case 'css':
            this.applyCssChange(change);
            break;
          case 'html':
            this.applyHtmlChange(change);
            break;
          case 'javascript':
            this.applyJavaScriptChange(change);
            break;
          case 'redirect':
            this.applyRedirectChange(change);
            break;
          case 'feature':
            this.applyFeatureChange(change);
            break;
        }
      } catch (error) {
        console.error('Failed to apply variant change:', error);
      }
    });
  }

  private applyCssChange(change: any): void {
    if (!change.selector || !change.property || !change.value) return;
    
    const elements = document.querySelectorAll(change.selector);
    elements.forEach(element => {
      (element as HTMLElement).style.setProperty(change.property, change.value);
    });
  }

  private applyHtmlChange(change: any): void {
    if (!change.selector || !change.content) return;
    
    const elements = document.querySelectorAll(change.selector);
    elements.forEach(element => {
      element.innerHTML = change.content;
    });
  }

  private applyJavaScriptChange(change: any): void {
    if (!change.code) return;
    
    try {
      // eslint-disable-next-line no-eval
      eval(change.code);
    } catch (error) {
      console.error('Failed to execute JavaScript change:', error);
    }
  }

  private applyRedirectChange(change: any): void {
    if (!change.url) return;
    
    window.location.href = change.url;
  }

  private applyFeatureChange(change: any): void {
    if (!change.feature || change.enabled === undefined) return;
    
    // This would integrate with a feature flag system
    // For now, we'll store in window object
    (window as any)[`feature_${change.feature}`] = change.enabled;
  }

  // Utility methods for user information
  private getDeviceType(): string {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getScreenSize(): { width: number; height: number } {
    return {
      width: window.screen.width,
      height: window.screen.height
    };
  }

  private getBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Other';
  }

  private getOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Other';
  }

  private isNewUser(userId: string): boolean {
    // Check if user has been seen before
    const storageKey = `ab_user_${userId}`;
    const userData = localStorage.getItem(storageKey);
    
    if (!userData) {
      localStorage.setItem(storageKey, JSON.stringify({ firstSeen: Date.now() }));
      return true;
    }
    
    return false;
  }

  private getUserAttributes(userId: string): Record<string, any> {
    // This would integrate with user profile system
    // For now, return empty object
    return {};
  }

  private matchesUrlPattern(url: string, pattern: string): boolean {
    // Simple URL pattern matching
    // This could be enhanced with regex support
    return url.includes(pattern.replace('*', ''));
  }

  private getRecentExperiments(userId: string, hours: number): UserAssignment[] {
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    const userAssignments = this.userAssignments.get(userId);
    
    if (!userAssignments) {
      return [];
    }

    return Array.from(userAssignments.values()).filter(assignment => 
      assignment.assignedAt.getTime() > cutoffTime
    );
  }

  // User assignment management
  private getUserAssignment(userId: string, experimentId: string): UserAssignment | undefined {
    const userAssignments = this.userAssignments.get(userId);
    return userAssignments?.get(experimentId);
  }

  private storeUserAssignment(userId: string, experimentId: string, assignment: UserAssignment): void {
    if (!this.userAssignments.has(userId)) {
      this.userAssignments.set(userId, new Map());
    }
    
    this.userAssignments.get(userId)!.set(experimentId, assignment);
    
    // Persist to localStorage
    const storageKey = `ab_assignment_${userId}`;
    const assignments = JSON.parse(localStorage.getItem(storageKey) || '{}');
    assignments[experimentId] = {
      variantId: assignment.variantId,
      assignedAt: assignment.assignedAt.toISOString(),
      status: assignment.status
    };
    localStorage.setItem(storageKey, JSON.stringify(assignments));
  }

  private loadUserAssignments(userId: string): void {
    const storageKey = `ab_assignment_${userId}`;
    const assignments = JSON.parse(localStorage.getItem(storageKey) || '{}');
    
    const userMap = new Map<string, UserAssignment>();
    
    Object.entries(assignments).forEach(([experimentId, assignment]: [string, any]) => {
      userMap.set(experimentId, {
        userId,
        experimentId,
        variantId: assignment.variantId,
        assignedAt: new Date(assignment.assignedAt),
        status: assignment.status,
        events: []
      });
    });
    
    this.userAssignments.set(userId, userMap);
  }

  // Validate experiment configuration
  private validateExperiment(experiment: Experiment): void {
    if (!experiment.id || !experiment.name) {
      throw new Error('Experiment must have id and name');
    }

    if (experiment.variants.length < 2) {
      throw new Error('Experiment must have at least 2 variants');
    }

    // Validate variant allocations sum to 1
    const totalAllocation = experiment.variants.reduce((sum, variant) => sum + variant.allocation, 0);
    if (Math.abs(totalAllocation - 1) > 0.001) {
      throw new Error('Variant allocations must sum to 1');
    }

    // Validate segment weights sum to 1
    if (experiment.segments.length > 0) {
      const totalWeight = experiment.segments.reduce((sum, segment) => sum + segment.weight, 0);
      if (Math.abs(totalWeight - 1) > 0.001) {
        throw new Error('Segment weights must sum to 1');
      }
    }
  }

  // Get experiment results
  async getExperimentResults(experimentId: string): Promise<ExperimentResult | null> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      return null;
    }

    // This would integrate with analytics backend
    // For now, return a placeholder structure
    
    const variantResults = experiment.variants.map(variant => ({
      variantId: variant.id,
      users: 0,
      sessions: 0,
      events: 0,
      metrics: {},
      confidenceIntervals: {},
      significanceTests: {}
    }));

    return {
      experimentId,
      variantResults,
      summary: {
        totalUsers: 0,
        totalSessions: 0,
        totalEvents: 0,
        startDate: experiment.startDate,
        endDate: experiment.endDate,
        duration: Math.ceil((experiment.endDate.getTime() - experiment.startDate.getTime()) / (1000 * 60 * 60 * 24)),
        confidenceLevel: 0.95
      },
      statisticalAnalysis: {
        overallSignificance: 0,
        multipleComparisonCorrection: 'bonferroni',
        familyWiseErrorRate: 0.05,
        powerAnalysis: {
          observedPower: 0,
          requiredSampleSize: experiment.successCriteria.minimumSampleSize,
          minimumDetectableEffect: experiment.successCriteria.minimumEffectSize,
          earlyStopping: {
            enabled: false,
            type: 'both',
            boundaries: { efficacy: 0.05, futility: 0.5 },
            minimumSampleSize: experiment.successCriteria.minimumSampleSize,
            maximumDuration: 30
          }
        },
        assumptions: {
          normality: { testName: 'shapiro_wilk', pValue: 0, isSatisfied: true, notes: '' },
          homogeneity: { testName: 'levene', pValue: 0, isSatisfied: true, notes: '' },
          independence: { testName: 'durbin_watson', pValue: 0, isSatisfied: true, notes: '' },
          sampleSize: { testName: 'power_analysis', pValue: 0, isSatisfied: true, notes: '' }
        }
      },
      recommendations: []
    };
  }

  // Utility methods
  getAllExperiments(): Experiment[] {
    return Array.from(this.experiments.values());
  }

  getExperimentsByStatus(status: Experiment['status']): Experiment[] {
    return Array.from(this.experiments.values()).filter(exp => exp.status === status);
  }

  updateExperimentStatus(experimentId: string, status: Experiment['status']): void {
    const experiment = this.experiments.get(experimentId);
    if (experiment) {
      experiment.status = status;
    }
  }

  // Initialize user assignments on creation
  initializeUser(userId: string): void {
    this.loadUserAssignments(userId);
  }
}

// Singleton instance
let experimentManagerInstance: ExperimentManager | null = null;

export function getExperimentManager(tracker?: ABTestingTracker): ExperimentManager {
  if (!experimentManagerInstance) {
    experimentManagerInstance = new ExperimentManager(tracker);
  }
  return experimentManagerInstance;
}

export function initializeExperimentManager(tracker?: ABTestingTracker): ExperimentManager {
  if (experimentManagerInstance) {
    // Don't destroy existing instance to preserve assignments
  }
  experimentManagerInstance = new ExperimentManager(tracker);
  return experimentManagerInstance;
}