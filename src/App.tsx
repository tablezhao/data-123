import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { FaviconManager } from '@/components/common/FaviconManager';
import { useAccessibilityDevTools } from '@/lib/accessibility/hooks';
import routes, { usePreloadRoutes } from './routes';

// 导入初始化函数
import { initializeAuth } from './stores/authStore';
import { useSettingsStore } from './stores/settingsStore';

// 页面加载指示器
const PageLoadingIndicator = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="space-y-4 max-w-md w-full p-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  </div>
);

// 简化的应用加载指示器
const AppLoadingIndicator = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-primary text-primary-foreground rounded-full animate-pulse">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-foreground">加载中...</h2>
      <p className="text-sm text-muted-foreground mt-1">正在准备您的应用</p>
    </div>
  </div>
);

const App: React.FC = () => {
  // 使用路由预加载钩子
  usePreloadRoutes();
  
  // 使用 useSettingsStore 获取加载设置的方法
  const loadSettings = useSettingsStore.getState().loadSettings;
  
  // 集成无障碍开发工具
  const {
    isEnabled,
    showOverlay,
    highlightViolations,
    isRunning,
    report,
    toggleDevTools,
    runAccessibilityCheck,
    clearHighlights
  } = useAccessibilityDevTools({
    enabled: process.env.NODE_ENV === 'development',
    showOverlay: true,
    highlightViolations: true
  });
  
  // 运行初始无障碍检查
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      runAccessibilityCheck().catch(error => {
        console.warn('初始无障碍检查失败:', error);
      });
    }
  }, [runAccessibilityCheck]);

  useEffect(() => {
    // 初始化应用，分离关键和非关键初始化
    const initApp = async () => {
      try {
        // 1. 首先初始化认证（关键功能）
        await initializeAuth();
        
        // 2. 延迟加载非关键功能（网站设置），给用户更好的初始加载体验
        setTimeout(async () => {
          await loadSettings();
        }, 500);
      } catch (error) {
        console.error("初始化应用失败:", error);
      }
    };

    initApp();
  }, [loadSettings]);

  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {/* 动态 Favicon 管理器 */}
          <FaviconManager />
          
          {/* 无障碍测试开发工具覆盖层 */}
          {process.env.NODE_ENV === 'development' && isEnabled && showOverlay && (
            <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg border p-4 max-w-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900">无障碍测试</h4>
                <button
                  onClick={toggleDevTools}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="关闭无障碍测试工具"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">状态:</span>
                  <span className={isRunning ? 'text-blue-600' : 'text-green-600'}>
                    {isRunning ? '测试中...' : '就绪'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">违规数量:</span>
                  <span className={report?.violations?.length > 0 ? 'text-red-600' : 'text-green-600'}>
                    {report?.violations?.length || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">合规性:</span>
                  <span className="text-gray-900">
                    {report?.wcagCompliance?.score || 0}%
                  </span>
                </div>
              </div>
              
              <div className="mt-3 flex gap-2">
                <button
                  onClick={runAccessibilityCheck}
                  disabled={isRunning}
                  className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  重新检查
                </button>
                <button
                  onClick={clearHighlights}
                  className="flex-1 px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  清除高亮
                </button>
              </div>
            </div>
          )}
          
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
              <Suspense fallback={<PageLoadingIndicator />}>
                <Routes>
                  {routes.map((route, index) => (
                    <Route key={index} path={route.path} element={route.element} />
                  ))}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
