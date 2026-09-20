import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { Card, CardContent, CardHeader, CardTitle } from './Card';

// Optional description under the title (Register/Add flows use it).
type ModalSize = 'md' | 'lg' | 'xl' | '2xl';

const SIZE: Record<ModalSize, string> = {
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
  '2xl': 'max-w-4xl',
};

// Lightweight modal — overlay + centered card. No portal needed for this app.
export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: ModalSize;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <Card className={cn('relative z-10 flex max-h-[90vh] w-full flex-col', SIZE[size])}>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div className="space-y-1.5">
            <CardTitle>{title}</CardTitle>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            ✕
          </button>
        </CardHeader>
        <CardContent className="overflow-y-auto">{children}</CardContent>
        {footer && <div className="flex justify-end gap-2 border-t border-border p-4">{footer}</div>}
      </Card>
    </div>
  );
}
