import { apiClient } from '@/infrastructure/api/api';
import { API_ENDPOINTS } from '@/infrastructure/api/endpoints';
import type { ApiEnvelope } from '@/types/api';
import type { User } from '@/domain/entities/user.types';
import type { Permission } from '@/domain/enums/permission.enum';
import type { PlatformRole } from '@/domain/enums/role.enum';
import { ALL_PERMISSIONS } from '@/constant/permissions';

// ─── Request payloads ────────────────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}
export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  role?: PlatformRole;
}
export interface VerifyOtpPayload {
  email: string;
  code: string;
  type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'TWO_FACTOR';
}
export interface ForgotPasswordPayload {
  email: string;
}
export interface ResetPasswordPayload {
  email: string;
  code: string;
  new_password: string;
}
// Admin-only user creation: creates an already-verified account and attaches
// RBAC roles / direct permissions by id in one call (no email OTP required).
export interface AdminCreateUserPayload {
  full_name: string;
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN';
  is_verified?: boolean;
  role_ids?: string[];
  permission_ids?: string[];
}
export interface AdminCreateUserResult {
  auth_id: string;
  email: string;
  role: PlatformRole;
  is_verified: boolean;
}

// ─── Result the app consumes ─────────────────────────────────────────────────
export interface AuthResult {
  user: User;
  token: string;
  refreshToken: string;
  permissions: Permission[];
}

// Returned by login when the account has 2FA enabled — the app must collect a
// TOTP code and call twoFactor.loginVerify before a session exists.
export interface TwoFactorChallenge {
  requiresTwoFactor: true;
  tempToken: string;
  message: string;
}
export type LoginOutcome = AuthResult | TwoFactorChallenge;

export function isTwoFactorChallenge(r: LoginOutcome): r is TwoFactorChallenge {
  return 'requiresTwoFactor' in r && r.requiresTwoFactor === true;
}

// Raw shape of the gateway's login `data` payload.
interface LoginData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
  expires_in: number;
  roles?: Array<{ permissions?: Array<{ name?: string }> }>;
  direct_permissions?: Array<{ name?: string }>;
}

// Flatten roles + direct permissions into a permission-string list.
// Admins get all known permissions for UX convenience — the API still
// enforces every request independently (client checks are UX only).
function derivePermissions(data: LoginData): Permission[] {
  const role = data.user.role;
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    return [...ALL_PERMISSIONS];
  }
  const fromRoles = (data.roles ?? []).flatMap((r) =>
    (r.permissions ?? []).map((p) => p.name).filter(Boolean),
  );
  const fromDirect = (data.direct_permissions ?? []).map((p) => p.name).filter(Boolean);
  return Array.from(new Set([...fromRoles, ...fromDirect])) as Permission[];
}

// Map the gateway's login `data` payload into the app's AuthResult. Shared by
// the normal login path and the post-2FA-verification path so both are identical.
function toAuthResult(d: LoginData): AuthResult {
  return {
    user: d.user,
    token: d.access_token,
    refreshToken: d.refresh_token,
    permissions: derivePermissions(d),
  };
}

export const authService = {
  register: async (payload: RegisterPayload): Promise<{ auth_id: string; message: string }> => {
    const { data } = await apiClient.post<ApiEnvelope<{ auth_id: string; message: string }>>(
      API_ENDPOINTS.auth.register,
      payload,
    );
    return data.data;
  },

  login: async (payload: LoginPayload): Promise<LoginOutcome> => {
    const { data } = await apiClient.post<
      ApiEnvelope<LoginData> & { requiresTwoFactor?: boolean; tempToken?: string; message?: string }
    >(API_ENDPOINTS.auth.login, payload);
    // 2FA-enabled accounts get a challenge (no `data` payload) instead of tokens.
    if (data.requiresTwoFactor && data.tempToken) {
      return { requiresTwoFactor: true, tempToken: data.tempToken, message: data.message ?? '' };
    }
    return toAuthResult(data.data);
  },

  verifyOtp: async (payload: VerifyOtpPayload): Promise<{ message: string }> => {
    const { data } = await apiClient.post<ApiEnvelope<{ message: string }>>(
      API_ENDPOINTS.auth.verifyOtp,
      payload,
    );
    return data.data;
  },

  resendOtp: async (email: string, type: VerifyOtpPayload['type']): Promise<{ message: string }> => {
    const { data } = await apiClient.post<ApiEnvelope<{ message: string }>>(
      API_ENDPOINTS.auth.resendOtp,
      { email, type },
    );
    return data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.auth.logout);
  },

  // Admin: create a verified user and attach roles/permissions atomically.
  adminCreateUser: async (payload: AdminCreateUserPayload): Promise<AdminCreateUserResult> => {
    const { data } = await apiClient.post<ApiEnvelope<AdminCreateUserResult>>(
      API_ENDPOINTS.auth.adminCreateUser,
      payload,
    );
    return data.data;
  },

  // Request a password-reset code (sent to the user's email as a PASSWORD_RESET OTP).
  forgotPassword: async (payload: ForgotPasswordPayload): Promise<{ message: string }> => {
    const { data } = await apiClient.post<ApiEnvelope<{ message: string }>>(
      API_ENDPOINTS.auth.forgotPassword,
      payload,
    );
    return data.data;
  },

  // Complete the reset with the emailed code + a new password.
  resetPassword: async (payload: ResetPasswordPayload): Promise<{ message: string }> => {
    const { data } = await apiClient.post<ApiEnvelope<{ message: string }>>(
      API_ENDPOINTS.auth.resetPassword,
      payload,
    );
    return data.data;
  },

  // Exchange a refresh token for a new access token.
  refresh: async (refreshToken: string): Promise<{ access_token: string }> => {
    const { data } = await apiClient.post<ApiEnvelope<{ access_token: string }>>(
      API_ENDPOINTS.auth.refresh,
      { refresh_token: refreshToken },
    );
    return data.data;
  },

  // ─── Two-factor authentication (Google Authenticator / TOTP) ─────────────────
  twoFactor: {
    // Current 2FA state for the signed-in user.
    status: async (): Promise<TwoFactorStatus> => {
      const { data } = await apiClient.get<ApiEnvelope<TwoFactorStatus>>(
        API_ENDPOINTS.auth.twoFactorStatus,
      );
      return data.data;
    },
    // Begin setup — returns a QR code (data URL) + manual key. Not enabled yet.
    setup: async (): Promise<TwoFactorSetup> => {
      const { data } = await apiClient.post<ApiEnvelope<TwoFactorSetup>>(
        API_ENDPOINTS.auth.twoFactorSetup,
      );
      return data.data;
    },
    // Verify the first code from the authenticator app to activate 2FA.
    verify: async (code: string): Promise<{ message: string; two_factor_enabled: boolean }> => {
      const { data } = await apiClient.post<
        ApiEnvelope<{ message: string; two_factor_enabled: boolean }>
      >(API_ENDPOINTS.auth.twoFactorVerify, { code });
      return data.data;
    },
    // Disable 2FA — requires the current password OR a valid code.
    disable: async (proof: {
      password?: string;
      code?: string;
    }): Promise<{ message: string; two_factor_enabled: boolean }> => {
      const { data } = await apiClient.post<
        ApiEnvelope<{ message: string; two_factor_enabled: boolean }>
      >(API_ENDPOINTS.auth.twoFactorDisable, proof);
      return data.data;
    },
    // Complete a 2FA login: exchange the challenge token + code for a session.
    loginVerify: async (tempToken: string, code: string): Promise<AuthResult> => {
      const { data } = await apiClient.post<ApiEnvelope<LoginData>>(
        API_ENDPOINTS.auth.twoFactorLogin,
        { tempToken, code },
      );
      return toAuthResult(data.data);
    },
  },
};

export interface TwoFactorStatus {
  two_factor_enabled: boolean;
  two_factor_enabled_at: string | null;
}
export interface TwoFactorSetup {
  qr_code: string; // data URL for <img src>
  manual_key: string;
  otpauth_url: string;
  message: string;
}
