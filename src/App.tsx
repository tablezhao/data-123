import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { FaviconManager } from '@/components/common/FaviconManager';
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
