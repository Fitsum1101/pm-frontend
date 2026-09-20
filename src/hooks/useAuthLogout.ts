import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '@/features/auth/api/authService';
import { useAuthStore } from '@/store/authStore';
import { PATHS } from '@/app/routes/paths';

// Logout: call the API (best-effort), clear the store + storage token,
// drop all cached server state, then redirect home.
export function useAuthLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((s) => s.clearSession);

  return async () => {
    try {
      await authService.logout();
    } catch {
      /* ignore network failure — we clear locally regardless */
    }
    clearSession();
    queryClient.clear();
    navigate(PATHS.home, { replace: true });
  };
}
