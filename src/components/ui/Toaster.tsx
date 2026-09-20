import { Toaster as SonnerToaster } from 'sonner';
import { useTheme } from '@/providers/ThemeProvider';

// App-wide toast surface. Mounted once (in RootLayout) and kept in sync with
// the current theme so toasts match light/dark mode.
export function Toaster() {
  const { theme } = useTheme();
  return (
    <SonnerToaster
      theme={theme}
      position="top-right"
      richColors
      closeButton
      toastOptions={{ duration: 4000 }}
    />
  );
}
