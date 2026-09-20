import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { PATHS } from '@/app/routes/paths';
import { useAuthStore } from '@/store/authStore';

export function HomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="mx-auto max-w-4xl px-6 py-24 text-center">
      <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
        Clean Architecture · React 19 · Vite
      </span>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Express Auth Web Client
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
        A production-ready React front-end integrated with the Express Auth Starter gateway —
        JWT auth, email OTP, permission-based access control, and a dashboard.
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        {isAuthenticated ? (
          <Link to={PATHS.app.dashboard}>
            <Button size="lg">Go to dashboard</Button>
          </Link>
        ) : (
          <>
            <Link to={PATHS.auth.signUp}>
              <Button size="lg">Get started</Button>
            </Link>
            <Link to={PATHS.auth.signIn}>
              <Button size="lg" variant="outline">
                Sign in
              </Button>
            </Link>
          </>
        )}
      </div>

      <div className="mt-16 grid gap-4 text-left sm:grid-cols-3">
        {[
          { icon: '🔐', title: 'JWT + OTP auth', body: 'Register, email verification, login, refresh & logout via the gateway.' },
          { icon: '🛡️', title: 'Permission gating', body: 'Routes and UI gated by permissions with a <Can> component and guards.' },
          { icon: '⚡', title: 'TanStack Query', body: 'Server state cached & synced; Zustand holds the session client-side.' },
        ].map((f) => (
          <div key={f.title} className="rounded-lg border border-border bg-card p-5">
            <div className="text-2xl">{f.icon}</div>
            <h3 className="mt-2 font-semibold text-foreground">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
