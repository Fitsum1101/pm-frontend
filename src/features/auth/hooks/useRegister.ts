import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService, type RegisterPayload } from '../api/authService';
import { PATHS } from '@/app/routes/paths';

// Register mutation → on success routes to OTP verification with the email.
export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    meta: { successMessage: 'Account created — check your email for a code.' },
    onSuccess: (_result, variables) => {
      navigate(PATHS.auth.verifyOtp, { state: { email: variables.email }, replace: true });
    },
  });
}
