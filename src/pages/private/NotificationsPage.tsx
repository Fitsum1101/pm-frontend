import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AppLoadingState, AppErrorState, AppEmptyState } from '@/components/feedback/AppStates';
import {
  useNotifications,
  useMarkAllRead,
  useMarkRead,
  useDeleteNotification,
} from '@/features/notifications/hooks/useNotifications';
import { extractApiError } from '@/infrastructure/api/api';
import { cn } from '@/lib/utils/cn';

export function NotificationsPage() {
  const notifications = useNotifications(1, 20);
  const markAll = useMarkAllRead();
  const markRead = useMarkRead();
  const remove = useDeleteNotification();

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Notifications"
        description="Your latest account and system messages."
        action={
          <Button variant="outline" size="sm" onClick={() => markAll.mutate()} disabled={markAll.isPending}>
            Mark all read
          </Button>
        }
      />

      {notifications.isLoading ? (
        <AppLoadingState label="Loading notifications…" />
      ) : notifications.isError ? (
        <AppErrorState message={extractApiError(notifications.error)} />
      ) : !notifications.data?.data.length ? (
        <AppEmptyState title="No notifications" message="You're all caught up." />
      ) : (
        <div className="space-y-2">
          {notifications.data.data.map((n) => (
            <Card key={n.id}>
              <CardContent className="flex items-start gap-3 p-4">
                <span
                  className={cn(
                    'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                    n.read ? 'bg-muted' : 'bg-primary',
                  )}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{n.title}</p>
                      <Badge variant={n.read ? 'default' : 'primary'}>{n.type}</Badge>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  <div className="mt-2 flex gap-2">
                    {!n.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markRead.mutate(n.id)}
                        disabled={markRead.isPending}
                      >
                        Mark read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => remove.mutate(n.id)}
                      disabled={remove.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
