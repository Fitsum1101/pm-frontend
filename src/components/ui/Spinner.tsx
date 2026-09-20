import { cn } from '@/lib/utils/cn';

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent',
        className,
      )}
      role="status"
      aria-label="loading"
    />
  );
}

// Full-page spinner used by route/guard suspense fallbacks.
export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Spinner className="h-8 w-8 text-primary" />
    </div>
  );
}
