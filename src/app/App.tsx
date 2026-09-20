import { RouterProvider } from 'react-router-dom';
import { AppProviders } from '@/providers/AppProviders';
import { router } from '@/app/routes';

// Composition root: mounts global providers + the router.
export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
