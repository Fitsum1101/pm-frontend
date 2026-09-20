import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  roleService,
  type CreateRolePayload,
  type UpdateRolePayload,
} from '../api/roleService';

const KEYS = {
  all: ['roles'] as const,
  list: (page: number, limit: number) => ['roles', 'list', page, limit] as const,
  permissions: (roleId: string) => ['roles', roleId, 'permissions'] as const,
};

export function useRoles(page = 1, limit = 50) {
  return useQuery({ queryKey: KEYS.list(page, limit), queryFn: () => roleService.list(page, limit) });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => roleService.create(payload),
    meta: { successMessage: 'Role created.' },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      roleService.update(id, payload),
    meta: { successMessage: 'Role updated.' },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roleService.remove(id),
    meta: { successMessage: 'Role deleted.' },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useRolePermissions(roleId: string, enabled = true) {
  return useQuery({
    queryKey: KEYS.permissions(roleId),
    queryFn: () => roleService.getPermissions(roleId),
    enabled: enabled && !!roleId,
  });
}

export function useAssignRolePermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) =>
      roleService.assignPermissions(roleId, permissionIds),
    meta: { successMessage: 'Permissions updated.' },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

// Create-or-update a role AND reconcile its permission set in one mutation.
export function useSaveRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      id?: string;
      name: string;
      description?: string;
      permissionIds: string[];
    }) => roleService.save(payload),
    meta: { successMessage: 'Role saved.' },
    onSuccess: (_r, vars) => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      if (vars.id) qc.invalidateQueries({ queryKey: KEYS.permissions(vars.id) });
    },
  });
}
