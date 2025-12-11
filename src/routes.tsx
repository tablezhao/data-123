import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import FavoritesPage from './pages/FavoritesPage';
import AdminPage from './pages/AdminPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: '首页',
    path: '/',
    element: <HomePage />,
  },
  {
    name: '登录',
    path: '/login',
    element: <LoginPage />,
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
