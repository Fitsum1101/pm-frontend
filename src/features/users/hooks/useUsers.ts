import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../api/userService';
import type { UserProfile } from '@/domain/entities/user.types';

const KEYS = {
  all: ['users'] as const,
  me: ['users', 'me'] as const,
  list: (page: number, limit: number) => ['users', 'list', page, limit] as const,
  roles: (userId: string) => ['users', userId, 'roles'] as const,
};

// Current user's profile (server state).
export function useMe() {
  return useQuery({ queryKey: KEYS.me, queryFn: userService.me });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Pick<UserProfile, 'full_name' | 'bio'>>) =>
      userService.updateMe(payload),
    meta: { successMessage: 'Profile updated.' },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.me }),
  });
}

// Upload/replace the current user's avatar (accepts a data URL or hosted URL).
export function useUpdateAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (avatarUrl: string) => userService.updateAvatar(avatarUrl),
    meta: { successMessage: 'Avatar updated.' },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.me }),
  });
}

// Admin user list.
export function useUsersList(page = 1, limit = 10) {
  return useQuery({
    queryKey: KEYS.list(page, limit),
    queryFn: () => userService.list(page, limit),
  });
}

// Admin: create user + assign roles.
export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      full_name: string;
      email: string;
      password: string;
      roleIds?: string[];
    }) => userService.createWithRole(payload),
    meta: { successMessage: 'User created.' },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

// Admin actions — invalidate the list on success.
export function useSuspendUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.suspend(id),
    meta: { successMessage: 'User suspended.' },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useActivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.activate(id),
    meta: { successMessage: 'User activated.' },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.remove(id),
    meta: { successMessage: 'User deleted.' },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

// Role assignment (keyed by auth user id = UserProfile.auth_id).
export function useUserRoles(userId: string, enabled = true) {
  return useQuery({
    queryKey: KEYS.roles(userId),
    queryFn: () => userService.getRoles(userId),
    enabled: enabled && !!userId,
  });
}

export function useAssignUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      userService.assignRole(userId, roleId),
    meta: { successMessage: 'Role assigned.' },
    onSuccess: (_r, { userId }) => qc.invalidateQueries({ queryKey: KEYS.roles(userId) }),
  });
}

export function useRemoveUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      userService.removeRole(userId, roleId),
    meta: { successMessage: 'Role removed.' },
    onSuccess: (_r, { userId }) => qc.invalidateQueries({ queryKey: KEYS.roles(userId) }),
  });
}
