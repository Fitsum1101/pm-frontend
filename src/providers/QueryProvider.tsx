import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import { toast, toastError } from '@/lib/toast';

// Per-mutation toast controls, declared via `meta` on each useMutation call.
// This keeps feedback declarative: hooks say what to say, the cache says it.
declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      // Toast shown on success. Omit for mutations that give their own feedback.
      successMessage?: string;
      // Set true to opt out of the automatic error toast (e.g. the page shows
      // the error inline instead).
      suppressErrorToast?: boolean;
    };
  }
}

// Owns the single QueryClient. Server state (profile, notifications, users)
// is cached here and read via feature hooks. All mutation feedback funnels
// through the MutationCache so success/error toasts are consistent app-wide.
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onSuccess: (_data, _vars, _ctx, mutation) => {
            const message = mutation.meta?.successMessage;
            if (message) toast.success(message);
          },
          onError: (error, _vars, _ctx, mutation) => {
            if (mutation.meta?.suppressErrorToast) return;
            toastError(error);
          },
        }),
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 30_000,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
