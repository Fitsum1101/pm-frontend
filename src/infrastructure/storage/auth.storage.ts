// Single wrapper around localStorage for auth tokens. Never read localStorage
// directly from a component or service — go through here.
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const authStorage = {
  getToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  setToken: (t: string): void => localStorage.setItem(ACCESS_TOKEN_KEY, t),

  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (t: string): void => localStorage.setItem(REFRESH_TOKEN_KEY, t),

  clear: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
