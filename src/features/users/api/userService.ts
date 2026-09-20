import { apiClient } from '@/infrastructure/api/api';
import { API_ENDPOINTS } from '@/infrastructure/api/endpoints';
import { authService, type AdminCreateUserResult } from '@/features/auth/api/authService';
import type { ApiEnvelope, PaginatedData } from '@/types/api';
import type { UserProfile } from '@/domain/entities/user.types';
import type { Role } from '@/domain/entities/rbac.types';

export const userService = {
  // Current user's rich profile (created asynchronously by user-service).
  me: async (): Promise<UserProfile> => {
    const { data } = await apiClient.get<ApiEnvelope<UserProfile>>(API_ENDPOINTS.users.me);
    return data.data;
  },

  updateMe: async (payload: Partial<Pick<UserProfile, 'full_name' | 'bio'>>): Promise<UserProfile> => {
    const { data } = await apiClient.patch<ApiEnvelope<UserProfile>>(API_ENDPOINTS.users.me, payload);
    return data.data;
  },

  // Set the avatar. `avatar_url` may be a hosted URL or an inline data URL
  // (the backend stores it as-is), so uploads work without a file store.
  updateAvatar: async (avatar_url: string): Promise<UserProfile> => {
    const { data } = await apiClient.patch<ApiEnvelope<UserProfile>>(
      API_ENDPOINTS.users.avatar,
      { avatar_url },
    );
    return data.data;
  },

  // Admin: paginated user list (requires users:list on the server).
  list: async (page = 1, limit = 10): Promise<PaginatedData<UserProfile>> => {
    const { data } = await apiClient.get<ApiEnvelope<PaginatedData<UserProfile>>>(
      API_ENDPOINTS.users.list,
      { params: { page, limit } },
    );
    return data.data;
  },

  // Admin: create an already-verified user and assign RBAC roles in one call
  // (auth-service /admin/users attaches role_ids server-side). Unlike self
  // sign-up, the created user can sign in immediately — no email OTP step.
  createWithRole: async (payload: {
    full_name: string;
    email: string;
    password: string;
    roleIds?: string[];
  }): Promise<AdminCreateUserResult> => {
    return authService.adminCreateUser({
      full_name: payload.full_name,
      email: payload.email,
      password: payload.password,
      role: 'USER',
      role_ids: payload.roleIds ?? [],
    });
  },

  // ─── Admin actions ─────────────────────────────────────────────────────────
  suspend: async (id: string): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.users.suspend(id));
  },
  activate: async (id: string): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.users.activate(id));
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.users.remove(id));
  },

  // ─── Role assignment (permission-service; keyed by auth user id) ─────────────
  getRoles: async (userId: string): Promise<Role[]> => {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(
      API_ENDPOINTS.permissions.userRoles(userId),
    );
    const d = data.data;
    if (Array.isArray(d)) return d as Role[];
    return ((d as { roles?: Role[] })?.roles) ?? [];
  },
  assignRole: async (userId: string, role_id: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.permissions.userRoles(userId), { role_id });
  },
  removeRole: async (userId: string, roleId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.permissions.userRoleById(userId, roleId));
  },
};
