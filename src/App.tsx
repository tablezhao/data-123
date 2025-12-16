import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { FaviconManager } from '@/components/common/FaviconManager';
import routes from './routes';

// 加载指示器组件
const LoadingIndicator = () => (
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
  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {/* 动态 Favicon 管理器 */}
          <FaviconManager />
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
              <Suspense fallback={<LoadingIndicator />}>
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
