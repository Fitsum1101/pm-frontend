import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../api/authService';

const KEY = ['2fa', 'status'] as const;

// Whether 2FA is currently enabled for the signed-in user.
export function useTwoFactorStatus() {
  return useQuery({ queryKey: KEY, queryFn: () => authService.twoFactor.status() });
}

// Begin setup — returns the QR code + manual key (does not enable 2FA yet).
export function useSetupTwoFactor() {
  return useMutation({ mutationFn: () => authService.twoFactor.setup() });
}

// Verify the first authenticator code to activate 2FA.
export function useVerifyTwoFactor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => authService.twoFactor.verify(code),
    meta: { successMessage: 'Two-factor authentication enabled.' },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

// Disable 2FA — requires the current password or a valid code.
export function useDisableTwoFactor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (proof: { password?: string; code?: string }) =>
      authService.twoFactor.disable(proof),
    meta: { successMessage: 'Two-factor authentication disabled.' },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
