import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { PrivateLayout } from '@/app/layouts/PrivateLayout';
import { ProtectedRoute } from '@/app/guards/ProtectedRoute';
import { PermissionRoute } from '@/app/guards/PermissionRoute';
import { DashboardPage } from '@/pages/private/DashboardPage';
import { ProfilePage } from '@/pages/private/ProfilePage';
import { SettingsPage } from '@/pages/private/SettingsPage';
import { NotificationsPage } from '@/pages/private/NotificationsPage';
import { UsersPage } from '@/pages/private/UsersPage';
import { RolesPage } from '@/pages/private/RolesPage';

// /app/* — authenticated area behind ProtectedRoute. Individual places are
// additionally gated by permission where needed (PermissionRoute).
export const privateRoutes: RouteObject = {
  path: 'app',
  element: (
    <ProtectedRoute>
      <PrivateLayout />
    </ProtectedRoute>
  ),
  children: [
    { index: true, element: <Navigate to="dashboard" replace /> },
    { path: 'dashboard', element: <DashboardPage /> },
    { path: 'profile', element: <ProfilePage /> },
    { path: 'settings', element: <SettingsPage /> },
    { path: 'notifications', element: <NotificationsPage /> },
    {
      path: 'users',
      element: (
        <PermissionRoute require="users:list">
          <UsersPage />
        </PermissionRoute>
      ),
    },
    {
      path: 'roles',
      element: (
        <PermissionRoute require="roles:list">
          <RolesPage />
        </PermissionRoute>
      ),
    },
  ],
};
