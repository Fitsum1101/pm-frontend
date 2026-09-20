import type { ReactNode } from 'react';
import { Spinner } from '@/components/ui/Spinner';

export function AppLoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <Spinner className="h-6 w-6 text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function AppErrorState({
  title = 'Something went wrong',
  message,
  action,
}: {
  title?: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        !
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      {message && <p className="max-w-sm text-sm text-muted-foreground">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function AppEmptyState({
  title = 'Nothing here yet',
  message,
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
      <h3 className="font-semibold text-foreground">{title}</h3>
      {message && <p className="max-w-sm text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
