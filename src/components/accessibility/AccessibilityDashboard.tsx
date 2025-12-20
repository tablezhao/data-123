/**
 * Accessibility Testing Dashboard
 * Comprehensive dashboard for monitoring and analyzing accessibility compliance
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target, 
  Eye, 
  EyeOff,
  Download,
  RefreshCw,
  Filter,
  Settings,
  Activity
} from 'lucide-react';
import { AccessibilityReport, AccessibilityViolation } from '../../lib/accessibility/types';
import { useAccessibilityAudit, useAccessibilityMonitor } from '../../lib/accessibility/hooks';
import { AccessibilityViolationCard } from './AccessibilityViolationCard';
import { cn } from '../../lib/utils';

interface AccessibilityDashboardProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showTrends?: boolean;
  showAnalytics?: boolean;
  onReportGenerated?: (report: AccessibilityReport) => void;
}

interface TrendData {
  date: string;
  score: number;
  violations: number;
  critical: number;
}

export const AccessibilityDashboard: React.FC<AccessibilityDashboardProps> = ({
  className,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
  showTrends = true,
  showAnalytics = true,
  onReportGenerated
}) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastReport, setLastReport] = useState<AccessibilityReport | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [showFilters, setShowFilters] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  
  const { 
    report, 
    isRunning, 
    error, 
    runAudit 
  } = useAccessibilityAudit({
    wcagLevel: 'AA',
    includeExperimental: false,
    includeManual: false,
    includeBestPractices: true
  });
  
  const {
    violations: monitorViolations,
    startMonitoring,
    stopMonitoring,
    violationCount,
    warningCount,
    clearViolations
  } = useAccessibilityMonitor({
    enabled: isMonitoring,
    debounceMs: 2000
  });
  
  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      if (!isRunning) {
        handleRunAudit();
      }
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, isRunning]);
  
  // Update last report when new report is generated
  useEffect(() => {
    if (report) {
      setLastReport(report);
      onReportGenerated?.(report);
      
      // Update trend data
      const newTrendPoint: TrendData = {
        date: new Date().toISOString(),
        score: report.wcagCompliance.score,
        violations: report.summary.total,
        critical: report.summary.critical
      };
      
      setTrendData(prev => {
        const updated = [...prev, newTrendPoint];
        // Keep only last 30 data points
        return updated.slice(-30);
      });
    }
  }, [report, onReportGenerated]);
  
  const handleRunAudit = async () => {
    try {
      await runAudit();
    } catch (err) {
      console.error('Accessibility audit failed:', err);
    }
  };
  
  const handleToggleMonitoring = () => {
    if (isMonitoring) {
      stopMonitoring();
      setIsMonitoring(false);
    } else {
      startMonitoring();
      setIsMonitoring(true);
    }
  };
  
  const handleExportReport = () => {
    if (!lastReport) return;
    
    const content = JSON.stringify(lastReport, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getComplianceIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-6 w-6 text-green-600" />;
    if (score >= 70) return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
    return <AlertTriangle className="h-6 w-6 text-red-600" />;
  };
  
  const filteredViolations = lastReport?.violations.filter(violation => {
    if (filterSeverity.length > 0 && !filterSeverity.includes(violation.severity)) {
      return false;
    }
    if (filterCategory.length > 0) {
      const category = getViolationCategory(violation.rule.id);
      if (!filterCategory.includes(category)) {
        return false;
      }
    }
    return true;
  }) || [];
  
  const getViolationCategory = (ruleId: string): string => {
    if (ruleId.startsWith('1.4')) return 'contrast';
    if (ruleId.startsWith('2.1') || ruleId.startsWith('2.4')) return 'navigation';
    if (ruleId.startsWith('1.3') || ruleId.startsWith('4.1')) return 'semantics';
    if (ruleId.startsWith('3.3')) return 'forms';
    if (ruleId.startsWith('1.2')) return 'media';
    if (ruleId.startsWith('2.2')) return 'time';
    return 'compatibility';
  };
  
  const getCategoryStats = () => {
    if (!lastReport) return [];
    
    const categories = ['contrast', 'navigation', 'semantics', 'forms', 'media', 'time', 'compatibility'];
    return categories.map(category => {
      const count = lastReport.violations.filter(v => 
        getViolationCategory(v.rule.id) === category
      ).length;
      return { category, count, percentage: Math.round((count / lastReport.violations.length) * 100) };
    }).filter(stat => stat.count > 0);
  };
  
  return (
    <div className={cn("w-full max-w-7xl mx-auto p-6 space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accessibility Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and analyze WCAG 2.1 compliance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleMonitoring}
            className={cn(
              "px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2",
              isMonitoring 
                ? "bg-red-100 text-red-700 hover:bg-red-200" 
                : "bg-green-100 text-green-700 hover:bg-green-200"
            )}
          >
            {isMonitoring ? (
              <><EyeOff className="h-4 w-4" />Stop Monitoring</>
            ) : (
              <><Eye className="h-4 w-4" />Start Monitoring</>
            )}
          </button>
          
          <button
            onClick={handleRunAudit}
            disabled={isRunning}
            className={cn(
              "px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2",
              isRunning
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            {isRunning ? (
              <><RefreshCw className="h-4 w-4 animate-spin" />Running...</>
            ) : (
              <><Activity className="h-4 w-4" />Run Audit</>
            )}
          </button>
          
          {lastReport && (
            <button
              onClick={handleExportReport}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          )}
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="font-medium text-red-800">Audit Failed</span>
          </div>
          <p className="mt-2 text-red-700">{error.message}</p>
        </div>
      )}
      
      {/* Real-time Monitoring Status */}
      {isMonitoring && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <div>
                <h3 className="font-medium text-blue-900">Real-time Monitoring Active</h3>
                <p className="text-sm text-blue-700">Detecting accessibility issues as they occur</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">{violationCount}</div>
                <div className="text-sm text-blue-700">Violations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">{warningCount}</div>
                <div className="text-sm text-blue-700">Warnings</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Overview Cards */}
      {lastReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Overall Score */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Overall Score</h3>
              {getComplianceIcon(lastReport.wcagCompliance.score)}
            </div>
            <div className={cn("text-3xl font-bold", getComplianceColor(lastReport.wcagCompliance.score))}>
              {lastReport.wcagCompliance.score}/100
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {lastReport.wcagCompliance.score >= 90 ? 'Excellent' :
               lastReport.wcagCompliance.score >= 70 ? 'Good' :
               lastReport.wcagCompliance.score >= 50 ? 'Needs Improvement' : 'Poor'}
            </p>
          </div>
          
          {/* WCAG Compliance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">WCAG Compliance</h3>
              <Target className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Level A</span>
                <span className={cn(
                  "text-sm font-medium",
                  lastReport.wcagCompliance.levelA ? "text-green-600" : "text-red-600"
                )}>
                  {lastReport.wcagCompliance.levelA ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Level AA</span>
                <span className={cn(
                  "text-sm font-medium",
                  lastReport.wcagCompliance.levelAA ? "text-green-600" : "text-red-600"
                )}>
                  {lastReport.wcagCompliance.levelAA ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Level AAA</span>
                <span className={cn(
                  "text-sm font-medium",
                  lastReport.wcagCompliance.levelAAA ? "text-green-600" : "text-red-600"
                )}>
                  {lastReport.wcagCompliance.levelAAA ? 'PASS' : 'FAIL'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Total Violations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Total Violations</h3>
              <AlertTriangle className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {lastReport.summary.total}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="text-red-600">{lastReport.summary.critical} Critical</span>
              <span className="text-orange-600">{lastReport.summary.serious} Serious</span>
              <span className="text-yellow-600">{lastReport.summary.moderate} Moderate</span>
            </div>
          </div>
          
          {/* Last Updated */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {new Date(lastReport.timestamp).toLocaleTimeString()}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {new Date(lastReport.timestamp).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
      
      {/* Analytics Section */}
      {lastReport && showAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Violation Categories</h3>
            <div className="space-y-4">
              {getCategoryStats().map(stat => (
                <div key={stat.category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 capitalize">{stat.category}</span>
                    <span className="text-sm text-gray-500">{stat.count} ({stat.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent Violations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Violations</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
            
            {/* Filters */}
            {showFilters && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                    <div className="space-y-1">
                      {['critical', 'serious', 'moderate', 'minor'].map(severity => (
                        <label key={severity} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filterSeverity.includes(severity)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilterSeverity(prev => [...prev, severity]);
                              } else {
                                setFilterSeverity(prev => prev.filter(s => s !== severity));
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm capitalize">{severity}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <div className="space-y-1">
                      {['contrast', 'navigation', 'semantics', 'forms'].map(category => (
                        <label key={category} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filterCategory.includes(category)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilterCategory(prev => [...prev, category]);
                              } else {
                                setFilterCategory(prev => prev.filter(c => c !== category));
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm capitalize">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setFilterSeverity([]);
                    setFilterCategory([]);
                  }}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear Filters
                </button>
              </div>
            )}
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {filteredViolations.slice(0, 10).map((violation, index) => (
                <AccessibilityViolationCard
                  key={`${violation.id}-${index}`}
                  violation={violation}
                  compact={true}
                  showActions={false}
                />
              ))}
              
              {filteredViolations.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No violations match your filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Trends Section */}
      {showTrends && trendData.length > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Trends</h3>
          <div className="h-64">
            {/* Simple trend visualization */}
            <div className="flex items-end justify-between h-full">
              {trendData.slice(-10).map((point, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div 
                    className={cn(
                      "w-8 rounded-t transition-all duration-300",
                      point.score >= 90 ? "bg-green-500" :
                      point.score >= 70 ? "bg-yellow-500" : "bg-red-500"
                    )}
                    style={{ height: `${(point.score / 100) * 100}%` }}
                  />
                  <span className="text-xs text-gray-500 transform -rotate-45 origin-center">
                    {new Date(point.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Performance Info */}
      {lastReport && (
        <div className="text-center text-sm text-gray-500">
          Last audit completed in {lastReport.performance.duration.toFixed(0)}ms • 
          {lastReport.performance.elementsTested} elements tested • 
          {lastReport.performance.rulesApplied} rules applied
        </div>
      )}
    </div>
  );
};

export default AccessibilityDashboard;