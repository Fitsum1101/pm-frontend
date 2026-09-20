import { Outlet, Link } from 'react-router-dom';
import { PATHS } from '@/app/routes/paths';
import { ThemeToggle } from '@/components/ThemeToggle';

// Centered card shell for sign-in / sign-up / verify-otp.
export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link to={PATHS.home} className="text-lg font-bold text-primary">
          ⬡ Express Auth
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
