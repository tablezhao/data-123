/**
 * Accessibility Test Runner Component
 * Comprehensive UI component for running accessibility tests and displaying results
 */

import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Info, 
  Play, 
  Download, 
  Filter, 
  Search,
  Settings,
  RefreshCw,
  Eye,
  EyeOff,
  FileText,
  BarChart3
} from 'lucide-react';
import { useAccessibilityAudit, useAccessibilityMonitor } from '../../lib/accessibility/hooks';
import { AccessibilityReport, AccessibilityViolation } from '../../lib/accessibility/types';
import { cn } from '../../lib/utils';

interface AccessibilityTestRunnerProps {
  className?: string;
  onTestComplete?: (report: AccessibilityReport) => void;
  onViolationFound?: (violation: AccessibilityViolation) => void;
  autoRun?: boolean;
  showProgress?: boolean;
  showExport?: boolean;
  testConfig?: any;
}

interface ViolationFilters {
  severity: string[];
  type: string[];
  wcagLevel: string[];
  category: string[];
}

export const AccessibilityTestRunner: React.FC<AccessibilityTestRunnerProps> = ({
  className,
  onTestComplete,
  onViolationFound,
  autoRun = false,
  showProgress = true,
  showExport = true,
  testConfig
}) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ViolationFilters>({
    severity: [],
    type: [],
    wcagLevel: [],
    category: []
  });
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'html'>('json');
  
  const { 
    report, 
    isRunning, 
    error, 
    progress, 
    runAudit, 
    hasViolations, 
    complianceScore, 
    wcagCompliance 
  } = useAccessibilityAudit(testConfig);
  
  const {
    violations: monitorViolations,
    startMonitoring,
    stopMonitoring,
    violationCount,
    warningCount
  } = useAccessibilityMonitor({
    enabled: isMonitoring,
    onViolation: onViolationFound
  });
  
  useEffect(() => {
    if (autoRun && !isRunning) {
      handleRunTest();
    }
  }, [autoRun]);
  
  useEffect(() => {
    if (report && onTestComplete) {
      onTestComplete(report);
    }
  }, [report, onTestComplete]);
  
  const handleRunTest = async () => {
    try {
      await runAudit();
    } catch (err) {
      console.error('Accessibility test failed:', err);
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
  
  const handleExport = () => {
    if (!report) return;
    
    const reporter = (window as any).__accessibilityReporter;
    if (reporter) {
      const content = reporter.exportReport(report, exportFormat);
      const blob = new Blob([content], { 
        type: exportFormat === 'json' ? 'application/json' : 
              exportFormat === 'csv' ? 'text/csv' : 'text/html'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `accessibility-audit-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };
  
  const filteredViolations = report?.violations.filter(violation => {
    if (searchTerm && !violation.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (filters.severity.length > 0 && !filters.severity.includes(violation.severity)) {
      return false;
    }
    
    if (filters.type.length > 0 && !filters.type.includes(violation.type)) {
      return false;
    }
    
    if (filters.wcagLevel.length > 0 && !filters.wcagLevel.includes(violation.rule.level)) {
      return false;
    }
    
    return true;
  }) || [];
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'serious':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'moderate':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'minor':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getComplianceIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 70) return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };
  
  return (
    <div className={cn("w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Accessibility Test Runner</h2>
          <p className="text-gray-600 mt-1">Run comprehensive WCAG 2.1 compliance tests</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleMonitoring}
            className={cn(
              "px-4 py-2 rounded-md font-medium transition-colors",
              isMonitoring 
                ? "bg-red-100 text-red-700 hover:bg-red-200" 
                : "bg-green-100 text-green-700 hover:bg-green-200"
            )}
          >
            {isMonitoring ? (
              <><EyeOff className="h-4 w-4 inline mr-2" />Stop Monitoring</>
            ) : (
              <><Eye className="h-4 w-4 inline mr-2" />Start Monitoring</>
            )}
          </button>
          
          <button
            onClick={handleRunTest}
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
              <><Play className="h-4 w-4" />Run Test</>
            )}
          </button>
          
          {showExport && report && (
            <div className="flex items-center gap-2">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="html">HTML</option>
              </select>
              
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Progress Bar */}
      {showProgress && isRunning && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Running accessibility tests...</span>
            <span className="text-sm text-gray-500">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <span className="font-medium text-red-800">Test Failed</span>
          </div>
          <p className="mt-2 text-red-700">{error.message}</p>
        </div>
      )}
      
      {/* Results Summary */}
      {report && (
        <div className="mb-6">
          {/* Overall Score */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Overall Compliance Score</h3>
              <div className="flex items-center gap-2">
                {getComplianceIcon(complianceScore)}
                <span className={cn("text-2xl font-bold", getComplianceColor(complianceScore))}>
                  {complianceScore}/100
                </span>
              </div>
            </div>
            
            {/* WCAG Levels */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className={cn(
                  "text-sm font-medium",
                  wcagCompliance?.levelA ? "text-green-600" : "text-red-600"
                )}>
                  Level A: {wcagCompliance?.levelA ? 'PASS' : 'FAIL'}
                </div>
              </div>
              <div className="text-center">
                <div className={cn(
                  "text-sm font-medium",
                  wcagCompliance?.levelAA ? "text-green-600" : "text-red-600"
                )}>
                  Level AA: {wcagCompliance?.levelAA ? 'PASS' : 'FAIL'}
                </div>
              </div>
              <div className="text-center">
                <div className={cn(
                  "text-sm font-medium",
                  wcagCompliance?.levelAAA ? "text-green-600" : "text-red-600"
                )}>
                  Level AAA: {wcagCompliance?.levelAAA ? 'PASS' : 'FAIL'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Summary Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{report.summary.total}</div>
              <div className="text-sm text-gray-600">Total Violations</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{report.summary.critical}</div>
              <div className="text-sm text-gray-600">Critical</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">{report.summary.serious}</div>
              <div className="text-sm text-gray-600">Serious</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">{report.summary.moderate}</div>
              <div className="text-sm text-gray-600">Moderate</div>
            </div>
          </div>
          
          {/* Real-time Monitoring Stats */}
          {isMonitoring && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900">Real-time Monitoring Active</h4>
                  <p className="text-sm text-blue-700">Detecting accessibility issues as they occur</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-blue-900">{violationCount}</div>
                  <div className="text-sm text-blue-700">Violations</div>
                  <div className="text-lg font-semibold text-blue-900 mt-2">{warningCount}</div>
                  <div className="text-sm text-blue-700">Warnings</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Search and Filters */}
      {report && filteredViolations.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search violations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "px-4 py-2 rounded-md flex items-center gap-2 transition-colors",
                showFilters
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>
          
          {/* Filter Options */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                  <div className="space-y-2">
                    {['critical', 'serious', 'moderate', 'minor'].map(severity => (
                      <label key={severity} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.severity.includes(severity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({ ...prev, severity: [...prev.severity, severity] }));
                            } else {
                              setFilters(prev => ({ ...prev, severity: prev.severity.filter(s => s !== severity) }));
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <div className="space-y-2">
                    {['error', 'warning', 'notice'].map(type => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.type.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({ ...prev, type: [...prev.type, type] }));
                            } else {
                              setFilters(prev => ({ ...prev, type: prev.type.filter(t => t !== type) }));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WCAG Level</label>
                  <div className="space-y-2">
                    {['A', 'AA', 'AAA'].map(level => (
                      <label key={level} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.wcagLevel.includes(level)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({ ...prev, wcagLevel: [...prev.wcagLevel, level] }));
                            } else {
                              setFilters(prev => ({ ...prev, wcagLevel: prev.wcagLevel.filter(l => l !== level) }));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">Level {level}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({ severity: [], type: [], wcagLevel: [], category: [] })}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Violations List */}
      {report && filteredViolations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Violations ({filteredViolations.length})
            </h3>
            <button
              onClick={() => setShowDetails(showDetails ? null : 'all')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showDetails === 'all' ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          {filteredViolations.map((violation, index) => (
            <div key={violation.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="p-4 bg-white cursor-pointer hover:bg-gray-50"
                onClick={() => setShowDetails(showDetails === violation.id ? null : violation.id)}
              >
                <div className="flex items-start gap-3">
                  {getSeverityIcon(violation.severity)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">
                        {violation.rule.name} ({violation.rule.id})
                      </h4>
                      <span className="text-xs text-gray-500 uppercase">
                        Level {violation.rule.level}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{violation.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Selector: <code className="bg-gray-100 px-1 rounded">{violation.selector}</code></span>
                      <span>Type: {violation.type}</span>
                      <span>Method: {violation.testMethod}</span>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    {showDetails === violation.id ? '▼' : '▶'}
                  </div>
                </div>
              </div>
              
              {showDetails === violation.id && (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Remediation</h5>
                      <p className="text-sm text-gray-700">{violation.remediation}</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">WCAG Reference</h5>
                      <p className="text-sm text-gray-700">{violation.wcagReference}</p>
                    </div>
                    
                    {violation.context && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">Context</h5>
                        <p className="text-sm text-gray-700">{violation.context}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Timestamp: {new Date(violation.timestamp).toLocaleString()}</span>
                      <span>Impact: {violation.impact}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* No Violations */}
      {report && filteredViolations.length === 0 && !hasViolations && (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Accessibility Violations Found</h3>
          <p className="text-gray-600">Your application meets WCAG 2.1 compliance standards.</p>
        </div>
      )}
      
      {/* No Results */}
      {report && filteredViolations.length === 0 && hasViolations && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Violations Match Your Filters</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}
      
      {/* Recommendations */}
      {report && report.recommendations.length > 0 && (
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Recommendations
          </h3>
          <ul className="space-y-2">
            {report.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-blue-800">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Performance Info */}
      {report && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Test completed in {report.performance.duration.toFixed(0)}ms • 
          {report.performance.elementsTested} elements tested • 
          {report.performance.rulesApplied} rules applied
        </div>
      )}
    </div>
  );
};

export default AccessibilityTestRunner;