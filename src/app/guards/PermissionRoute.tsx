import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { PATHS } from '@/app/routes/paths';
import type { Permission } from '@/domain/enums/permission.enum';

// Permission gate — wrap any route subtree that requires a grant.
// Client checks are UX only; the API independently enforces every request.
export function PermissionRoute({
  require,
  mode = 'all',
  children,
}: {
  require: Permission | Permission[];
  mode?: 'all' | 'any';
  children: ReactNode;
}) {
  const canAll = useAuthStore((s) => s.canAll);
  const canAny = useAuthStore((s) => s.canAny);
  const required = Array.isArray(require) ? require : [require];

  const allowed = mode === 'all' ? canAll(required) : canAny(required);
  if (!allowed) return <Navigate to={PATHS.app.dashboard} replace />;
  return <>{children}</>;
}
