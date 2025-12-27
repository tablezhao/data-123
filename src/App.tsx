import React, { Suspense, useEffect, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { FaviconManager } from '@/components/common/FaviconManager';
import { FloatingAI } from '@/components/common/FloatingAI';
import routes, { usePreloadRoutes } from './routes';

// 懒加载 Toaster 组件，避免阻塞首屏
const Toaster = lazy(() => import('@/components/ui/sonner').then(module => ({ default: module.Toaster })));

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



const App: React.FC = () => {
  // 使用路由预加载钩子
  usePreloadRoutes();
  
  // 使用 useSettingsStore 获取加载设置的方法
  const loadSettings = useSettingsStore.getState().loadSettings;

  useEffect(() => {
    // 初始化应用，并行加载关键和非关键数据
    const initApp = async () => {
      try {
        // 并行执行认证初始化和设置加载，移除之前的延迟
        // 这样可以更快显示正确的网站标题和 Favicon
        await Promise.all([
          initializeAuth().catch(e => console.error("Auth init error:", e)),
          loadSettings().catch(e => console.error("Settings load error:", e))
        ]);
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
          <FloatingAI />
          <Suspense fallback={null}>
            <Toaster />
          </Suspense>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
