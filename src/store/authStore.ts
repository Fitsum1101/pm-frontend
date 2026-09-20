import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/domain/entities/user.types';
import type { Permission } from '@/domain/enums/permission.enum';
import { authStorage } from '@/infrastructure/storage/auth.storage';

interface SetSessionPayload {
  user: User;
  token: string;
  refreshToken?: string;
  permissions: Permission[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  isHydrating: boolean;
  setSession: (payload: SetSessionPayload) => void;
  clearSession: () => void;
  // Permission checkers used by guards and the <Can> component.
  can: (permission: Permission) => boolean;
  canAll: (permissions: Permission[]) => boolean;
  canAny: (permissions: Permission[]) => boolean;
}

// Zustand is the primary client store (session + permissions). Server data
// (profile, notifications) lives in React Query, never here.
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      permissions: [],
      isAuthenticated: false,
      isHydrating: true,
      setSession: ({ user, token, refreshToken, permissions }) => {
        authStorage.setToken(token);
        if (refreshToken) authStorage.setRefreshToken(refreshToken);
        set({ user, token, permissions, isAuthenticated: true });
      },
      clearSession: () => {
        authStorage.clear();
        set({ user: null, token: null, permissions: [], isAuthenticated: false });
      },
      can: (permission) => get().permissions.includes(permission),
      canAll: (permissions) => permissions.every((p) => get().permissions.includes(p)),
      canAny: (permissions) => permissions.some((p) => get().permissions.includes(p)),
    }),
    {
      name: 'auth-store',
      // Persist only identity — the token itself lives in authStorage.
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        permissions: s.permissions,
        isAuthenticated: s.isAuthenticated,
      }),
      // Flip the hydration flag once persisted state is restored so guards wait.
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrating = false;
      },
    },
  ),
);
