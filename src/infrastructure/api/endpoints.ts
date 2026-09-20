// All endpoint strings live here — never inline them in services.
// Paths are relative to API_CONFIG.baseURL, which already includes "/v1".
export const API_ENDPOINTS = {
  auth: {
    register: 'auth/register',
    adminCreateUser: 'auth/admin/users',
    login: 'auth/login',
    verifyOtp: 'auth/otp/verify',
    resendOtp: 'auth/otp/resend',
    verifyEmail: 'auth/verify-email',
    forgotPassword: 'auth/forgot-password',
    resetPassword: 'auth/reset-password',
    refresh: 'auth/refresh',
    logout: 'auth/logout',
    twoFactorStatus: 'auth/2fa/status',
    twoFactorSetup: 'auth/2fa/setup',
    twoFactorVerify: 'auth/2fa/verify',
    twoFactorLogin: 'auth/2fa/login',
    twoFactorDisable: 'auth/2fa/disable',
  },
  users: {
    me: 'users/me',
    settings: 'users/me/settings',
    notificationSettings: 'users/me/notification-settings',
    avatar: 'users/me/avatar',
    list: 'users',
    byId: (id: string) => `users/${id}`,
    suspend: (id: string) => `users/${id}/suspend`,
    activate: (id: string) => `users/${id}/activate`,
    remove: (id: string) => `users/${id}`,
  },
  permissions: {
    check: 'permissions/check',
    // Roles CRUD
    roles: 'permissions/roles',
    roleById: (id: string) => `permissions/roles/${id}`,
    rolePermissions: (roleId: string) => `permissions/roles/${roleId}/permissions`,
    // Permissions CRUD
    permissions: 'permissions/permissions',
    permissionById: (id: string) => `permissions/permissions/${id}`,
    // User ↔ role/permission assignment
    userRoles: (userId: string) => `permissions/users/${userId}/roles`,
    userRolesBulk: (userId: string) => `permissions/users/${userId}/roles/bulk`,
    userRoleById: (userId: string, roleId: string) =>
      `permissions/users/${userId}/roles/${roleId}`,
    userPermissions: (id: string) => `permissions/users/${id}/permissions`,
    userPermissionsBulk: (userId: string) => `permissions/users/${userId}/permissions/bulk`,
    userDirectPermissions: (userId: string) =>
      `permissions/users/${userId}/permissions/direct`,
  },
  notifications: {
    list: 'notifications',
    unreadCount: 'notifications/unread-count',
    markAllRead: 'notifications/read-all',
    markManyRead: 'notifications/read',
    byId: (id: string) => `notifications/${id}`,
    markRead: (id: string) => `notifications/${id}/read`,
    // Web Push
    vapidKey: 'notifications/push/vapid-key',
    pushSubscribe: 'notifications/push/subscribe',
    pushUnsubscribe: 'notifications/push/unsubscribe',
  },
} as const;
