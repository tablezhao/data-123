/**
 * Accessibility Violation Card Component
 * Displays detailed information about individual accessibility violations
 */

import React, { useState } from 'react';
import { 
  AlertCircle, 
  XCircle, 
  Info, 
  ChevronDown, 
  ChevronRight,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  HelpCircle
} from 'lucide-react';
import { AccessibilityViolation } from '../../lib/accessibility/types';
import { cn } from '../../lib/utils';

interface AccessibilityViolationCardProps {
  violation: AccessibilityViolation;
  className?: string;
  showActions?: boolean;
  onHighlight?: (violation: AccessibilityViolation, highlight: boolean) => void;
  onCopy?: (text: string) => void;
  compact?: boolean;
  expandable?: boolean;
}

export const AccessibilityViolationCard: React.FC<AccessibilityViolationCardProps> = ({
  violation,
  className,
  showActions = true,
  onHighlight,
  onCopy,
  compact = false,
  expandable = true
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  const getSeverityIcon = () => {
    switch (violation.severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'serious':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'moderate':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'minor':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getSeverityColor = () => {
    switch (violation.severity) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'serious':
        return 'border-orange-200 bg-orange-50';
      case 'moderate':
        return 'border-yellow-200 bg-yellow-50';
      case 'minor':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };
  
  const getSeverityTextColor = () => {
    switch (violation.severity) {
      case 'critical':
        return 'text-red-800';
      case 'serious':
        return 'text-orange-800';
      case 'moderate':
        return 'text-yellow-800';
      case 'minor':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };
  
  const handleHighlight = () => {
    const newHighlighted = !isHighlighted;
    setIsHighlighted(newHighlighted);
    onHighlight?.(violation, newHighlighted);
    
    if (violation.element) {
      if (newHighlighted) {
        violation.element.style.outline = '3px solid #ff0000';
        violation.element.style.outlineOffset = '2px';
        violation.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        violation.element.style.outline = '';
        violation.element.style.outlineOffset = '';
      }
    }
  };
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    onCopy?.(text);
  };
  
  const handleOpenWCAGReference = () => {
    const wcagUrl = `https://www.w3.org/WAI/WCAG21/Understanding/${violation.rule.id.replace('.', '')}.html`;
    window.open(wcagUrl, '_blank');
  };
  
  const getWCAGHelpText = () => {
    const helpTexts: Record<string, string> = {
      '1.1.1': 'Provide text alternatives for images and other non-text content',
      '1.3.1': 'Ensure information and relationships are programmatically determinable',
      '1.4.3': 'Maintain sufficient color contrast between text and background',
      '2.1.1': 'Make all functionality available from a keyboard',
      '2.4.7': 'Ensure keyboard focus is visible and clearly indicated',
      '3.3.2': 'Provide labels or instructions for user input',
      '4.1.2': 'Ensure name, role, and value are programmatically determinable'
    };
    
    return helpTexts[violation.rule.id] || 'Follow WCAG guidelines for improved accessibility';
  };
  
  if (compact) {
    return (
      <div className={cn(
        "border rounded-lg p-3 cursor-pointer transition-colors",
        getSeverityColor(),
        className
      )}>
        <div 
          className="flex items-center gap-3"
          onClick={() => expandable && setIsExpanded(!isExpanded)}
        >
          {getSeverityIcon()}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className={cn("text-sm font-medium truncate", getSeverityTextColor())}>
                {violation.rule.name} ({violation.rule.id})
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase text-gray-500">
                  Level {violation.rule.level}
                </span>
                {expandable && (
                  <ChevronRight className={cn(
                    "h-4 w-4 text-gray-400 transition-transform",
                    isExpanded && "rotate-90"
                  )} />
                )}
              </div>
            </div>
            <p className={cn("text-xs truncate", getSeverityTextColor())}>
              {violation.message}
            </p>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleHighlight();
                }}
                className={cn(
                  "p-1 rounded hover:bg-white hover:bg-opacity-50 transition-colors",
                  isHighlighted && "bg-red-100 text-red-600"
                )}
                title={isHighlighted ? "Remove highlight" : "Highlight element"}
              >
                {isHighlighted ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </button>
            </div>
          )}
        </div>
        
        {isExpanded && expandable && (
          <div className="mt-3 pt-3 border-t border-current border-opacity-20">
            <CompactViolationDetails 
              violation={violation} 
              onCopy={handleCopy}
              onOpenReference={handleOpenWCAGReference}
            />
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className={cn(
      "border rounded-lg overflow-hidden transition-all",
      getSeverityColor(),
      className
    )}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {getSeverityIcon()}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className={cn("text-lg font-semibold", getSeverityTextColor())}>
                {violation.rule.name} ({violation.rule.id})
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium uppercase text-gray-500">
                  Level {violation.rule.level}
                </span>
                <span className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  "bg-white bg-opacity-50 text-current"
                )}>
                  {violation.severity}
                </span>
              </div>
            </div>
            
            <p className={cn("text-sm mb-3", getSeverityTextColor())}>
              {violation.message}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>Type: {violation.type}</span>
              <span>Impact: {violation.impact}</span>
              <span>Method: {violation.testMethod}</span>
              <code className="bg-white bg-opacity-50 px-2 py-1 rounded text-xs">
                {violation.selector}
              </code>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="p-2 rounded hover:bg-white hover:bg-opacity-50 transition-colors"
                title="Show help"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
              
              <button
                onClick={handleHighlight}
                className={cn(
                  "p-2 rounded hover:bg-white hover:bg-opacity-50 transition-colors",
                  isHighlighted && "bg-red-100 text-red-600"
                )}
                title={isHighlighted ? "Remove highlight" : "Highlight element"}
              >
                {isHighlighted ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>
        
        {showHelp && (
          <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-lg">
            <div className="flex items-start gap-2">
              <HelpCircle className="h-4 w-4 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-700 mb-2">{getWCAGHelpText()}</p>
                <button
                  onClick={handleOpenWCAGReference}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  Learn more about {violation.rule.id}
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Details */}
      <div className="px-4 pb-4">
        <ViolationDetails 
          violation={violation} 
          onCopy={handleCopy}
          onOpenReference={handleOpenWCAGReference}
        />
      </div>
    </div>
  );
};

/**
 * Detailed violation information
 */
const ViolationDetails: React.FC<{
  violation: AccessibilityViolation;
  onCopy: (text: string) => void;
  onOpenReference: () => void;
}> = ({ violation, onCopy, onOpenReference }) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-gray-900 mb-2 flex items-center justify-between">
          Remediation
          <button
            onClick={() => onCopy(violation.remediation)}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Copy remediation text"
          >
            <Copy className="h-4 w-4" />
          </button>
        </h4>
        <p className="text-sm text-gray-700">{violation.remediation}</p>
      </div>
      
      <div>
        <h4 className="font-medium text-gray-900 mb-2">WCAG Reference</h4>
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-700">{violation.wcagReference}</p>
          <button
            onClick={onOpenReference}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            View Guidelines
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>
      
      {violation.context && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Context</h4>
          <p className="text-sm text-gray-700">{violation.context}</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-900">Element:</span>
          <div className="flex items-center gap-2 mt-1">
            <code className="bg-gray-100 px-2 py-1 rounded text-xs flex-1">
              {violation.selector}
            </code>
            <button
              onClick={() => onCopy(violation.selector)}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Copy selector"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
        </div>
        
        <div>
          <span className="font-medium text-gray-900">Timestamp:</span>
          <p className="text-gray-700 mt-1">
            {new Date(violation.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-900">Severity:</span>
          <p className="text-gray-700 capitalize">{violation.severity}</p>
        </div>
        <div>
          <span className="font-medium text-gray-900">Impact:</span>
          <p className="text-gray-700 capitalize">{violation.impact}</p>
        </div>
        <div>
          <span className="font-medium text-gray-900">Test Method:</span>
          <p className="text-gray-700 capitalize">{violation.testMethod}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Compact violation details for expanded compact view
 */
const CompactViolationDetails: React.FC<{
  violation: AccessibilityViolation;
  onCopy: (text: string) => void;
  onOpenReference: () => void;
}> = ({ violation, onCopy, onOpenReference }) => {
  return (
    <div className="space-y-2 text-xs">
      <div>
        <span className="font-medium">Remediation:</span>
        <p className="mt-1">{violation.remediation}</p>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onCopy(violation.remediation)}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <Copy className="h-3 w-3" />
          Copy
        </button>
        
        <button
          onClick={onOpenReference}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <ExternalLink className="h-3 w-3" />
          WCAG
        </button>
      </div>
    </div>
  );
};

export default AccessibilityViolationCard;