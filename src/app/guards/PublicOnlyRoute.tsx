import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { PATHS } from '@/app/routes/paths';

// Keeps logged-in users out of sign-in / sign-up.
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to={PATHS.app.dashboard} replace />;
  return <>{children}</>;
}
