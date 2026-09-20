import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { PATHS } from '@/app/routes/paths';

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-xl font-semibold text-foreground">Page not found</h1>
      <p className="text-muted-foreground">The page you’re looking for doesn’t exist.</p>
      <Link to={PATHS.home}>
        <Button>Back home</Button>
      </Link>
    </div>
  );
}
