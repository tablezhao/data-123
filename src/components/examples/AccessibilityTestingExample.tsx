/**
 * 无障碍测试集成示例 - 数据合规123导航网站
 * 
 * 展示如何在实际组件中使用无障碍测试功能
 * 包括实时测试、违规检测和修复建议
 */

import React, { useState, useEffect } from 'react';
import EnhancedButton from '@/components/ui/EnhancedButton';
import EnhancedCard from '@/components/ui/EnhancedCard';
import EnhancedInput from '@/components/ui/EnhancedInput';
import { useAccessibilityAudit, useAccessibilityDevTools } from '@/lib/accessibility/hooks';
import { AccessibilityDashboard } from '@/components/accessibility/AccessibilityDashboard';

export default function AccessibilityTestingExample() {
  const [auditResults, setAuditResults] = useState<any>(null);
  const [violations, setViolations] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  
  // 使用无障碍审计工具
  const {
    report,
    isRunning: isAuditRunning,
    progress,
    runAudit,
    hasViolations,
    complianceScore,
    wcagCompliance
  } = useAccessibilityAudit({
    wcagLevel: 'AA',
    includeBestPractices: true,
    performanceBudget: {
      maxDuration: 5000,
      maxElements: 1000
    }
  });
  
  // 使用开发工具
  const {
    isEnabled,
    showOverlay,
    highlightViolations,
    isRunning: isDevRunning,
    report: devReport,
    toggleDevTools,
    runAccessibilityCheck,
    clearHighlights
  } = useAccessibilityDevTools({
    enabled: true,
    showOverlay: true,
    highlightViolations: true
  });
  
  // 运行完整审计
  const handleRunFullAudit = async () => {
    setIsTesting(true);
    try {
      const auditReport = await runAudit();
      setAuditResults(auditReport);
      setViolations(auditReport.violations || []);
    } catch (error) {
      console.error('无障碍审计失败:', error);
    } finally {
      setIsTesting(false);
    }
  };
  
  // 运行开发模式检查
  const handleRunDevCheck = async () => {
    try {
      const result = await runAccessibilityCheck();
      if (result) {
        setViolations(result.violations || []);
      }
    } catch (error) {
      console.error('开发模式检查失败:', error);
    }
  };
  
  // 处理组件无障碍违规
  const handleComponentViolation = (componentViolations: any[]) => {
    console.warn('组件无障碍违规:', componentViolations);
    setViolations(prev => [...prev, ...componentViolations]);
  };
  
  // 清除违规记录
  const handleClearViolations = () => {
    setViolations([]);
    clearHighlights();
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 标题和控制面板 */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            无障碍测试集成示例
          </h1>
          <p className="text-lg text-gray-600">
            展示如何在实际组件中集成无障碍测试功能
          </p>
          
          {/* 控制按钮 */}
          <div className="flex justify-center gap-4 flex-wrap">
            <EnhancedButton
              variant="primary"
              onClick={handleRunFullAudit}
              loading={isAuditRunning || isTesting}
              enableAccessibilityTesting
              onAccessibilityViolation={handleComponentViolation}
            >
              运行完整无障碍审计
            </EnhancedButton>
            
            <EnhancedButton
              variant="secondary"
              onClick={handleRunDevCheck}
              loading={isDevRunning}
              enableAccessibilityTesting
              onAccessibilityViolation={handleComponentViolation}
            >
              运行开发模式检查
            </EnhancedButton>
            
            <EnhancedButton
              variant="outline"
              onClick={toggleDevTools}
              enableAccessibilityTesting
              onAccessibilityViolation={handleComponentViolation}
            >
              {isEnabled ? '禁用' : '启用'} 开发工具
            </EnhancedButton>
            
            <EnhancedButton
              variant="ghost"
              onClick={handleClearViolations}
              enableAccessibilityTesting
              onAccessibilityViolation={handleComponentViolation}
            >
              清除违规记录
            </EnhancedButton>
          </div>
        </div>
        
        {/* 审计进度 */}
        {(isAuditRunning || isTesting) && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">审计进度</h3>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">{progress}% 完成</p>
          </div>
        )}
        
        {/* 合规性状态 */}
        {wcagCompliance && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">WCAG 合规性状态</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {complianceScore}%
                </div>
                <div className="text-sm text-gray-600">总体合规性</div>
              </div>
              
              <div className="text-center">
                <div className={`text-lg font-semibold ${
                  wcagCompliance.levelA ? 'text-green-600' : 'text-red-600'
                }`}>
                  {wcagCompliance.levelA ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600">WCAG Level A</div>
              </div>
              
              <div className="text-center">
                <div className={`text-lg font-semibold ${
                  wcagCompliance.levelAA ? 'text-green-600' : 'text-red-600'
                }`}>
                  {wcagCompliance.levelAA ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600">WCAG Level AA</div>
              </div>
              
              <div className="text-center">
                <div className={`text-lg font-semibold ${
                  wcagCompliance.levelAAA ? 'text-green-600' : 'text-red-600'
                }`}>
                  {wcagCompliance.levelAAA ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600">WCAG Level AAA</div>
              </div>
            </div>
          </div>
        )}
        
        {/* 测试组件示例 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 按钮测试 */}
          <EnhancedCard
            title="按钮无障碍测试"
            description="测试按钮组件的无障碍功能"
            enableAccessibilityTesting
            onAccessibilityViolation={handleComponentViolation}
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <EnhancedButton variant="primary" enableAccessibilityTesting>
                  主要按钮
                </EnhancedButton>
                
                <EnhancedButton variant="secondary" enableAccessibilityTesting>
                  次要按钮
                </EnhancedButton>
                
                <EnhancedButton variant="outline" enableAccessibilityTesting>
                  轮廓按钮
                </EnhancedButton>
                
                <EnhancedButton variant="destructive" enableAccessibilityTesting>
                  危险按钮
                </EnhancedButton>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>测试按钮的对比度、键盘导航和屏幕阅读器兼容性</p>
                {violations.filter(v => v.element?.tagName === 'BUTTON').length > 0 && (
                  <p className="text-red-600 mt-2">
                    发现 {violations.filter(v => v.element?.tagName === 'BUTTON').length} 个按钮无障碍问题
                  </p>
                )}
              </div>
            </div>
          </EnhancedCard>
          
          {/* 输入框测试 */}
          <EnhancedCard
            title="输入框无障碍测试"
            description="测试输入框组件的无障碍功能"
            enableAccessibilityTesting
            onAccessibilityViolation={handleComponentViolation}
          >
            <div className="space-y-4">
              <EnhancedInput
                label="用户名"
                placeholder="请输入用户名"
                required
                enableAccessibilityTesting
                onAccessibilityViolation={handleComponentViolation}
              />
              
              <EnhancedInput
                label="邮箱"
                type="email"
                placeholder="请输入邮箱地址"
                description="我们将使用此邮箱与您联系"
                enableAccessibilityTesting
                onAccessibilityViolation={handleComponentViolation}
              />
              
              <EnhancedInput
                label="密码"
                type="password"
                placeholder="请输入密码"
                showPasswordToggle
                enableAccessibilityTesting
                onAccessibilityViolation={handleComponentViolation}
              />
              
              <div className="text-sm text-gray-600">
                <p>测试输入框的标签关联、错误提示和键盘导航</p>
                {violations.filter(v => v.element?.tagName === 'INPUT').length > 0 && (
                  <p className="text-red-600 mt-2">
                    发现 {violations.filter(v => v.element?.tagName === 'INPUT').length} 个输入框无障碍问题
                  </p>
                )}
              </div>
            </div>
          </EnhancedCard>
        </div>
        
        {/* 违规详情 */}
        {violations.length > 0 && (
          <EnhancedCard
            title="无障碍违规详情"
            description="发现的无障碍问题及修复建议"
            variant="error"
            enableAccessibilityTesting
            onAccessibilityViolation={handleComponentViolation}
          >
            <div className="space-y-4">
              {violations.map((violation, index) => (
                <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                  <h4 className="font-semibold text-red-800">
                    {violation.rule?.name || '未知规则'}
                  </h4>
                  <p className="text-red-700 mt-1">
                    {violation.message}
                  </p>
                  <div className="mt-2 text-sm text-gray-600">
                    <p><strong>WCAG 参考:</strong> {violation.wcagReference}</p>
                    <p><strong>严重程度:</strong> {violation.severity}</p>
                    <p><strong>修复建议:</strong> {violation.remediation}</p>
                  </div>
                </div>
              ))}
            </div>
          </EnhancedCard>
        )}
        
        {/* 无障碍仪表板 */}
        {auditResults && (
          <AccessibilityDashboard
            report={auditResults}
            onViolationClick={(violation) => {
              console.log('违规详情:', violation);
            }}
            onExportReport={(format) => {
              console.log(`导出 ${format} 格式报告`);
            }}
          />
        )}
        
        {/* 实时测试状态 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">实时测试状态</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {isEnabled ? '启用' : '禁用'}
              </div>
              <div className="text-sm text-gray-600">开发工具状态</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {violations.length}
              </div>
              <div className="text-sm text-gray-600">发现的违规</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {showOverlay ? '显示' : '隐藏'}
              </div>
              <div className="text-sm text-gray-600">覆盖层状态</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}