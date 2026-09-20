import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AppLoadingState, AppErrorState } from '@/components/feedback/AppStates';
import { Can } from '@/features/auth/components/Can';
import { useAuthStore } from '@/store/authStore';
import { useMe } from '@/features/users/hooks/useUsers';
import { useUnreadCount } from '@/features/notifications/hooks/useNotifications';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const permissions = useAuthStore((s) => s.permissions);
  const profile = useMe();
  const unread = useUnreadCount();

  return (
    <div>
      <PageHeader
        title={`Welcome back${profile.data?.full_name ? `, ${profile.data.full_name}` : ''}`}
        description="Here's an overview of your account."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Role" value={user?.role ?? '—'} icon="🛡️" />
        <StatCard
          label="Email verified"
          value={user?.is_verified ? 'Yes' : 'No'}
          icon="✓"
        />
        <StatCard label="Permissions" value={permissions.length} icon="🔑" hint="granted to you" />
        <StatCard
          label="Unread notifications"
          value={unread.isLoading ? '…' : unread.data ?? 0}
          icon="🔔"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account profile</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.isLoading ? (
              <AppLoadingState label="Loading profile…" />
            ) : profile.isError ? (
              <AppErrorState message="Your profile is still being provisioned. Try again shortly." />
            ) : (
              <dl className="space-y-3 text-sm">
                <Row label="Full name" value={profile.data?.full_name} />
                <Row label="Email" value={profile.data?.email} />
                <Row label="Status" value={profile.data?.status} />
                <Row
                  label="Member since"
                  value={
                    profile.data?.created_at
                      ? new Date(profile.data.created_at).toLocaleDateString()
                      : '—'
                  }
                />
              </dl>
            )}
          </CardContent>
        </Card>

        <Can
          require="users:list"
          fallback={
            <Card>
              <CardHeader>
                <CardTitle>Your access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  You have {permissions.length} permission(s). Admin tools appear here when granted.
                </p>
              </CardContent>
            </Card>
          }
        >
          <Card>
            <CardHeader>
              <CardTitle>Admin</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You can manage users and roles. Head to the Users section from the sidebar.
              </p>
            </CardContent>
          </Card>
        </Can>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between border-b border-border pb-2 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value ?? '—'}</dd>
    </div>
  );
}
