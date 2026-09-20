import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/Toaster';

// Top-level layout wrapper for the whole app (a place for global chrome
// like toasts). Child layouts render into the <Outlet/>.
export function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
      <Toaster />
    </div>
  );
}
