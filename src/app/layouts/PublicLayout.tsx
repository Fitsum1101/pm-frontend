import { Outlet, Link } from 'react-router-dom';
import { PATHS } from '@/app/routes/paths';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuthStore } from '@/store/authStore';

// Marketing / public shell with a top nav.
export function PublicLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <Link to={PATHS.home} className="text-lg font-bold text-primary">
          ⬡ Express Auth
        </Link>
        <nav className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <Link to={PATHS.app.dashboard}>
              <Button size="sm">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to={PATHS.auth.signIn}>
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link to={PATHS.auth.signUp}>
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border px-6 py-4 text-center text-sm text-muted-foreground">
        Express Auth Web · Clean Architecture React client
      </footer>
    </div>
  );
}
