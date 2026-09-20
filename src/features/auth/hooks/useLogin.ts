import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  authService,
  isTwoFactorChallenge,
  type LoginPayload,
} from '../api/authService';
import { useAuthStore } from '@/store/authStore';
import { PATHS } from '@/app/routes/paths';

// Login mutation → either persists the session and redirects, or (for 2FA
// accounts) forwards to the two-factor screen with the challenge token.
export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (result) => {
      const from = (location.state as { from?: Location } | null)?.from?.pathname;

      if (isTwoFactorChallenge(result)) {
        // No session yet — collect the authenticator code first.
        navigate(PATHS.auth.twoFactor, {
          replace: true,
          state: { tempToken: result.tempToken, message: result.message, from },
        });
        return;
      }

      setSession(result);
      navigate(from ?? PATHS.app.dashboard, { replace: true });
    },
  });
}

// Complete a 2FA login with the authenticator code → persists the session.
export function useLoginTwoFactor(from?: string) {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: ({ tempToken, code }: { tempToken: string; code: string }) =>
      authService.twoFactor.loginVerify(tempToken, code),
    onSuccess: (result) => {
      setSession(result);
      navigate(from ?? PATHS.app.dashboard, { replace: true });
    },
  });
}
