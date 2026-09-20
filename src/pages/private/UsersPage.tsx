import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { SearchIcon, PlusIcon, ShieldIcon, BanIcon, CheckIcon, TrashIcon } from '@/components/ui/icons';
import { AppLoadingState, AppErrorState, AppEmptyState } from '@/components/feedback/AppStates';
import {
  useUsersList,
  useSuspendUser,
  useActivateUser,
  useDeleteUser,
  useUserRoles,
} from '@/features/users/hooks/useUsers';
import { extractApiError } from '@/infrastructure/api/api';
import type { UserProfile } from '@/domain/entities/user.types';
import { UserRolesModal } from './UserRolesModal';
import { CreateUserModal } from './CreateUserModal';

// Initials for the avatar bubble, e.g. "Benoni Moges" → "BM".
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

// Role chips for a user — fetched from the permission-service by auth id.
function UserRolesCell({ authId }: { authId: string }) {
  const roles = useUserRoles(authId);
  if (roles.isLoading) return <span className="text-xs text-muted-foreground">…</span>;
  if (!roles.data?.length) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {roles.data.map((r) => (
        <Badge key={r.id}>{r.name}</Badge>
      ))}
    </div>
  );
}

// Admin user management — gated by <PermissionRoute require="users:list"> in
// the route table. The API also enforces the permission on every request.
export function UsersPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const users = useUsersList(page, limit);
  const suspend = useSuspendUser();
  const activate = useActivateUser();
  const remove = useDeleteUser();

  const [query, setQuery] = useState('');
  const [rolesFor, setRolesFor] = useState<UserProfile | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const list = users.data?.data ?? [];
    const q = query.trim().toLowerCase();
    return q
      ? list.filter(
          (u) =>
            u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
        )
      : list;
  }, [users.data, query]);

  return (
    <div>
      <PageHeader
        title="User Accounts"
        description="Manage system users, access credentials, and permission roles."
        action={
          <Button onClick={() => setCreating(true)}>
            <PlusIcon /> Add New User
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <div className="relative mb-4 w-full sm:max-w-md">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {users.isLoading ? (
            <AppLoadingState label="Loading users…" />
          ) : users.isError ? (
            <AppErrorState message={extractApiError(users.error)} />
          ) : !filtered.length ? (
            <AppEmptyState title="No users found" message={query ? 'Try a different search.' : undefined} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Roles</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const suspended = u.status === 'SUSPENDED';
                    return (
                      <tr key={u.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {initials(u.full_name)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">{u.full_name}</p>
                              <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <UserRolesCell authId={u.auth_id} />
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={suspended ? 'danger' : 'success'}>{u.status}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Manage roles"
                              className="text-primary"
                              onClick={() => setRolesFor(u)}
                            >
                              <ShieldIcon />
                            </Button>
                            {suspended ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Activate user"
                                className="text-green-600 dark:text-green-400"
                                disabled={activate.isPending}
                                onClick={() => activate.mutate(u.id)}
                              >
                                <CheckIcon />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Suspend user"
                                disabled={suspend.isPending}
                                onClick={() => suspend.mutate(u.id)}
                              >
                                <BanIcon />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete user"
                              className="text-destructive"
                              disabled={remove.isPending}
                              onClick={() => {
                                if (confirm(`Delete user "${u.full_name}"?`)) remove.mutate(u.id);
                              }}
                            >
                              <TrashIcon />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {users.data?.page ?? page} of {users.data?.total_pages ?? 1} ·{' '}
              {users.data?.total ?? 0} users
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!!users.data && page >= users.data.total_pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {rolesFor && <UserRolesModal user={rolesFor} open onClose={() => setRolesFor(null)} />}
      <CreateUserModal open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
