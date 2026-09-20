import type { Permission } from '@/domain/enums/permission.enum';

// Every permission the client knows about — mirrors the backend registry.
// Used to grant admins the full set for UX gating (the API still authorizes).
export const ALL_PERMISSIONS: Permission[] = [
  'users:create',
  'users:read',
  'users:update',
  'users:delete',
  'users:list',
  'users:suspend',
  'roles:create',
  'roles:read',
  'roles:update',
  'roles:delete',
  'roles:list',
  'roles:assign',
  'permissions:create',
  'permissions:read',
  'permissions:update',
  'permissions:delete',
  'permissions:list',
  'permissions:assign',
  'audit:read',
  'audit:list',
  'notifications:read',
  'notifications:update',
  'notifications:delete',
  'notifications:list',
];
