// Reads Vite env (import.meta.env.VITE_*). In dev the default "/api" is
// proxied to the Express gateway by vite.config.ts.
export const API_CONFIG = {
  baseURL: (import.meta.env.VITE_API_BASE_URL as string) || '/api',
  timeout: 30_000,
} as const;
