import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  authService,
  type ForgotPasswordPayload,
  type ResetPasswordPayload,
} from '../api/authService';
import { PATHS } from '@/app/routes/paths';

// Request a reset code → on success route to the reset page, prefilling the email.
export function useForgotPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authService.forgotPassword(payload),
    meta: { successMessage: 'Reset code sent — check your email.' },
    onSuccess: (_result, variables) => {
      navigate(PATHS.auth.resetPassword, { state: { email: variables.email } });
    },
  });
}

// Complete the reset → on success route back to sign-in.
export function useResetPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authService.resetPassword(payload),
    meta: { successMessage: 'Password reset. Please sign in.' },
    onSuccess: () => {
      navigate(PATHS.auth.signIn, { replace: true });
    },
  });
}
