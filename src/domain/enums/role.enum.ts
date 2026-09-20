// Platform roles issued by auth-service. The very first registered user is
// force-promoted to SUPER_ADMIN by the backend.
export type PlatformRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER';

export const PlatformRoles = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;
