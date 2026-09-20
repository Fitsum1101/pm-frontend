import type { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import type { Permission } from '@/domain/enums/permission.enum';

// Permission-gated UI. Hides children unless the user holds the grant(s).
// Client checks are UX only — the API independently authorizes each request.
export function Can({
  require,
  mode = 'all',
  fallback = null,
  children,
}: {
  require: Permission | Permission[];
  mode?: 'all' | 'any';
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const canAll = useAuthStore((s) => s.canAll);
  const canAny = useAuthStore((s) => s.canAny);
  const required = Array.isArray(require) ? require : [require];
  const allowed = mode === 'all' ? canAll(required) : canAny(required);
  return <>{allowed ? children : fallback}</>;
}
