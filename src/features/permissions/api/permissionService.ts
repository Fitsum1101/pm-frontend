import { apiClient } from '@/infrastructure/api/api';
import { API_ENDPOINTS } from '@/infrastructure/api/endpoints';
import type { ApiEnvelope } from '@/types/api';
import type { PermissionRecord, PermissionListData } from '@/domain/entities/rbac.types';

export interface CreatePermissionPayload {
  resource: string;
  action: string;
  description?: string;
}

// Normalize the permission-service payloads, which return either a bare array
// or a `{ permissions: [...] }` object depending on the endpoint.
function toPermissionArray(d: unknown): PermissionRecord[] {
  if (Array.isArray(d)) return d as PermissionRecord[];
  return ((d as { permissions?: PermissionRecord[] })?.permissions) ?? [];
}

export const permissionService = {
  // The backend returns either a plain array or a paged object — normalize both.
  list: async (page = 1, limit = 100): Promise<PermissionListData> => {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(API_ENDPOINTS.permissions.permissions, {
      params: { page, limit },
    });
    const d = data.data;
    if (Array.isArray(d)) {
      const permissions = d as PermissionRecord[];
      return { permissions, total: permissions.length, page, limit, totalPages: 1 };
    }
    return d as PermissionListData;
  },

  create: async (payload: CreatePermissionPayload): Promise<PermissionRecord> => {
    const { data } = await apiClient.post<ApiEnvelope<PermissionRecord>>(
      API_ENDPOINTS.permissions.permissions,
      payload,
    );
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.permissions.permissionById(id));
  },

  // ─── User ↔ role/permission assignment (permission-service) ──────────────────
  // Assign several roles to a user in one call.
  assignRolesToUser: async (userId: string, role_ids: string[]): Promise<void> => {
    if (!role_ids.length) return;
    await apiClient.post(API_ENDPOINTS.permissions.userRolesBulk(userId), { role_ids });
  },

  // Assign several direct permissions to a user in one call.
  assignPermissionsToUser: async (userId: string, permission_ids: string[]): Promise<void> => {
    if (!permission_ids.length) return;
    await apiClient.post(API_ENDPOINTS.permissions.userPermissionsBulk(userId), { permission_ids });
  },

  removePermissionsFromUser: async (userId: string, permission_ids: string[]): Promise<void> => {
    if (!permission_ids.length) return;
    await apiClient.delete(API_ENDPOINTS.permissions.userPermissionsBulk(userId), {
      data: { permission_ids },
    });
  },

  // Effective permissions for a user (roles + direct), or just the direct grants.
  getUserPermissions: async (userId: string): Promise<PermissionRecord[]> => {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(
      API_ENDPOINTS.permissions.userPermissions(userId),
    );
    return toPermissionArray(data.data);
  },

  getUserDirectPermissions: async (userId: string): Promise<PermissionRecord[]> => {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(
      API_ENDPOINTS.permissions.userDirectPermissions(userId),
    );
    return toPermissionArray(data.data);
  },
};
