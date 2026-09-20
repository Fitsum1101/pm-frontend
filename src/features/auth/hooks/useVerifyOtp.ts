import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService, type VerifyOtpPayload } from '../api/authService';
import { PATHS } from '@/app/routes/paths';

// Verify the email OTP → on success routes to sign-in.
export function useVerifyOtp() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => authService.verifyOtp(payload),
    meta: { successMessage: 'Email verified. Please sign in.' },
    onSuccess: () => {
      navigate(PATHS.auth.signIn, { replace: true });
    },
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: ({ email, type }: { email: string; type: VerifyOtpPayload['type'] }) =>
      authService.resendOtp(email, type),
    meta: { successMessage: 'A new code has been sent.' },
  });
}
