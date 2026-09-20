import type { PermissionRecord } from '@/domain/entities/rbac.types';

// Display permissions as `action_resource` (e.g. create_employee) to match the
// admin UI convention. Falls back to the stored `resource:action` name.
export function permissionLabel(
  p: Pick<PermissionRecord, 'resource' | 'action' | 'name'>,
): string {
  if (p.action && p.resource) return `${p.action}_${p.resource}`;
  return p.name;
}
