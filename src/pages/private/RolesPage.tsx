import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import {
  SearchIcon,
  PlusIcon,
  MoreIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PencilIcon,
  TrashIcon,
} from '@/components/ui/icons';
import { AppLoadingState, AppErrorState, AppEmptyState } from '@/components/feedback/AppStates';
import { useRoles, useDeleteRole, useRolePermissions } from '@/features/roles/hooks/useRoles';
import { extractApiError } from '@/infrastructure/api/api';
import { permissionLabel } from '@/features/permissions/permissionLabel';
import type { Role } from '@/domain/entities/rbac.types';
import { RoleModal } from './RoleModal';

export function RolesPage() {
  const roles = useRoles();
  const deleteRole = useDeleteRole();

  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Role | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const list = roles.data?.roles ?? [];
    const q = query.trim().toLowerCase();
    return q ? list.filter((r) => r.name.toLowerCase().includes(q)) : list;
  }, [roles.data, query]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (role: Role) => {
    setEditing(role);
    setModalOpen(true);
  };

  return (
    <div>
      <PageHeader title="Role and Permission" />

      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-primary">Roles</h3>

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button onClick={openCreate} className="shrink-0">
              <PlusIcon /> Add Role
            </Button>
          </div>

          {roles.isLoading ? (
            <AppLoadingState label="Loading roles…" />
          ) : roles.isError ? (
            <AppErrorState message={extractApiError(roles.error)} />
          ) : !filtered.length ? (
            <AppEmptyState
              title="No roles found"
              message={query ? 'Try a different search.' : 'Create your first role to get started.'}
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((role) => (
                <RoleRow
                  key={role.id}
                  role={role}
                  onEdit={() => openEdit(role)}
                  onDelete={() => {
                    if (confirm(`Delete role "${role.name}"?`)) deleteRole.mutate(role.id);
                  }}
                  deleting={deleteRole.isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {modalOpen && <RoleModal role={editing} onClose={() => setModalOpen(false)} />}
    </div>
  );
}

// A single role row: name + kebab menu (Edit/Delete) + expand to see the
// permissions assigned to the role.
function RoleRow({
  role,
  onEdit,
  onDelete,
  deleting,
}: {
  role: Role;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const perms = useRolePermissions(role.id, expanded);

  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between px-5 py-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <span className="font-semibold text-foreground">{role.name}</span>
          {role.description && (
            <span className="hidden text-xs text-muted-foreground sm:inline">
              — {role.description}
            </span>
          )}
        </button>

        <div className="flex items-center gap-1">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Role actions"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <MoreIcon />
            </Button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden />
                <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-md border border-border bg-card shadow-md">
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit();
                    }}
                  >
                    <PencilIcon /> Edit
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent disabled:opacity-50"
                    disabled={deleting}
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete();
                    }}
                  >
                    <TrashIcon /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label={expanded ? 'Collapse' : 'Expand'}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border p-5">
          <p className="mb-3 text-sm font-medium text-primary">Assigned Permissions</p>
          {perms.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner /> Loading…
            </div>
          ) : perms.isError ? (
            <p className="text-sm text-destructive">{extractApiError(perms.error)}</p>
          ) : !perms.data?.length ? (
            <p className="text-sm text-muted-foreground">No permissions assigned to this role.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {perms.data.map((p) => (
                <div key={p.id} className="rounded-md border border-border bg-background p-3">
                  <p className="text-sm font-medium text-foreground">{permissionLabel(p)}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.description || 'No description available'}
                  </p>
                  <span className="mt-1 inline-block text-xs font-medium text-green-600 dark:text-green-400">
                    Assigned
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
