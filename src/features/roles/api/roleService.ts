import { apiClient } from '@/infrastructure/api/api';
import { API_ENDPOINTS } from '@/infrastructure/api/endpoints';
import type { ApiEnvelope } from '@/types/api';
import type { Role, RoleListData, PermissionRecord } from '@/domain/entities/rbac.types';

export interface CreateRolePayload {
  name: string;
  description?: string;
}
export interface UpdateRolePayload {
  name?: string;
  description?: string;
}

export const roleService = {
  list: async (page = 1, limit = 50): Promise<RoleListData> => {
    const { data } = await apiClient.get<ApiEnvelope<RoleListData>>(API_ENDPOINTS.permissions.roles, {
      params: { page, limit },
    });
    return data.data;
  },

  create: async (payload: CreateRolePayload): Promise<Role> => {
    const { data } = await apiClient.post<ApiEnvelope<Role>>(API_ENDPOINTS.permissions.roles, payload);
    return data.data;
  },

  update: async (id: string, payload: UpdateRolePayload): Promise<Role> => {
    const { data } = await apiClient.put<ApiEnvelope<Role>>(
      API_ENDPOINTS.permissions.roleById(id),
      payload,
    );
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.permissions.roleById(id));
  },

  // Permissions currently attached to a role.
  getPermissions: async (roleId: string): Promise<PermissionRecord[]> => {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(
      API_ENDPOINTS.permissions.rolePermissions(roleId),
    );
    const d = data.data;
    if (Array.isArray(d)) return d as PermissionRecord[];
    return ((d as { permissions?: PermissionRecord[] })?.permissions) ?? [];
  },

  assignPermissions: async (roleId: string, permission_ids: string[]): Promise<void> => {
    if (!permission_ids.length) return;
    await apiClient.post(API_ENDPOINTS.permissions.rolePermissions(roleId), { permission_ids });
  },

  removePermissions: async (roleId: string, permission_ids: string[]): Promise<void> => {
    if (!permission_ids.length) return;
    // DELETE with a body — the backend expects { permission_ids }.
    await apiClient.delete(API_ENDPOINTS.permissions.rolePermissions(roleId), {
      data: { permission_ids },
    });
  },

  // Create/update a role and reconcile its permission set in one call.
  save: async (
    payload: CreateRolePayload & { id?: string; permissionIds: string[] },
  ): Promise<Role> => {
    const { id, name, description, permissionIds } = payload;

    const role = id
      ? await roleService.update(id, { name, description })
      : await roleService.create({ name, description });

    // Reconcile permissions: add newly-checked, remove unchecked.
    const current = id ? (await roleService.getPermissions(id)).map((p) => p.id) : [];
    const currentSet = new Set(current);
    const nextSet = new Set(permissionIds);
    const toAdd = permissionIds.filter((pid) => !currentSet.has(pid));
    const toRemove = current.filter((pid) => !nextSet.has(pid));

    await roleService.assignPermissions(role.id, toAdd);
    await roleService.removePermissions(role.id, toRemove);
    return role;
  },
};
