import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { PATHS } from '@/app/routes/paths';
import { FullPageSpinner } from '@/components/ui/Spinner';

// Auth gate for the private area. Waits for store rehydration so a refresh
// doesn't flash the login page.
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const location = useLocation();

  if (isHydrating) return <FullPageSpinner />;

  if (!isAuthenticated) {
    // Preserve intended destination so we can return after login.
    return <Navigate to={PATHS.auth.signIn} replace state={{ from: location }} />;
  }
  return <>{children}</>;
}
