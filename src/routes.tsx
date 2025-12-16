import { lazy, ReactNode, useEffect } from 'react';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// 1. 预加载关键页面组件，提升首屏加载速度
// 首页作为关键页面，使用 webpackPrefetch 优化
const HomePage = lazy(() => import('./pages/HomePage'));
// 登录页作为关键页面，预加载
const LoginPage = lazy(() => import('./pages/LoginPage'));
// 非关键页面，普通懒加载
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

// 2. 预加载函数，在应用加载后预加载非关键页面
const preloadNonCriticalPages = () => {
  // 预加载非关键页面，延迟 1 秒执行，避免影响首屏加载
  setTimeout(() => {
    import('./pages/FavoritesPage');
    import('./pages/AdminPage');
  }, 1000);
};

// 3. 导出预加载函数，供 App 组件使用
export const usePreloadRoutes = () => {
  useEffect(() => {
    preloadNonCriticalPages();
  }, []);
};

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  preload?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: '首页',
    path: '/',
    element: <HomePage />,
    preload: true,
  },
  {
    name: '登录',
    path: '/login',
    element: <LoginPage />,
    preload: true,
  },
  {
    name: '我的收藏',
    path: '/favorites',
    element: (
      <ProtectedRoute>
        <FavoritesPage />
      </ProtectedRoute>
    ),
  },
  {
    name: '管理后台',
    path: '/admin',
    element: (
      <ProtectedRoute requireAdmin>
        <AdminPage />
      </ProtectedRoute>
    ),
  },
];

export default routes;
