// The single toast entry point for the whole app. Always import `toast`
// (and `toastError` for API failures) from here — never from 'sonner' directly.
import { toast } from 'sonner';
import { extractApiError } from '@/infrastructure/api/api';

export { toast };

// Show a destructive toast for any thrown/rejected error, pulling a
// human-readable message out of Axios errors via extractApiError.
export function toastError(error: unknown, fallback?: string): string | number {
  return toast.error(fallback ?? extractApiError(error));
}
