import axios, { AxiosError } from 'axios';
import { API_CONFIG } from './config';
import { authStorage } from '@/infrastructure/storage/auth.storage';
import { useAuthStore } from '@/store/authStore';

// The single Axios instance for the whole app. Only feature services use it —
// never call it from a component or hook directly.
export const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: { 'Content-Type': 'application/json' },
});

// Request: attach the bearer token to every request.
apiClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: normalize errors and clear the session on 401 centrally.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token invalid/expired/blacklisted → drop the session.
      // Guards will bounce the user to sign-in on the next render.
      useAuthStore.getState().clearSession();
    }
    return Promise.reject(error);
  },
);

// Pull a human-readable message out of an Axios error (the gateway returns
// { success:false, message, code }).
export function extractApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || error.message || 'Request failed';
  }
  return error instanceof Error ? error.message : 'Something went wrong';
}
