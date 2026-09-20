import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Spinner } from '@/components/ui/Spinner';
import { SearchIcon } from '@/components/ui/icons';
import { AppLoadingState, AppErrorState } from '@/components/feedback/AppStates';
import { useSaveRole, useRolePermissions } from '@/features/roles/hooks/useRoles';
import { usePermissionsList } from '@/features/permissions/hooks/usePermissions';
import { extractApiError } from '@/infrastructure/api/api';
import { permissionLabel } from '@/features/permissions/permissionLabel';
import type { Role } from '@/domain/entities/rbac.types';
import { cn } from '@/lib/utils/cn';

// Add / Edit Role — name + a searchable checkbox grid of permissions to attach.
export function RoleModal({ role, onClose }: { role: Role | null; onClose: () => void }) {
  const permissions = usePermissionsList();
  const existing = useRolePermissions(role?.id ?? '', !!role);
  const save = useSaveRole();

  const [name, setName] = useState(role?.name ?? '');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Prefill selected permissions when editing (once they load).
  useEffect(() => {
    if (role && existing.data) setSelected(new Set(existing.data.map((p) => p.id)));
  }, [role, existing.data]);

  const all = permissions.data?.permissions ?? [];
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((p) => permissionLabel(p).toLowerCase().includes(q));
  }, [all, query]);

  const visibleIds = visible.map((p) => p.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAllVisible = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });

  const submit = () => {
    if (!name.trim()) return;
    save.mutate(
      { id: role?.id, name: name.trim(), permissionIds: [...selected] },
      { onSuccess: onClose },
    );
  };

  const loadingExisting = !!role && existing.isLoading;

  return (
    <Modal
      open
      onClose={onClose}
      size="2xl"
      title={role ? 'Edit Role' : 'Add Role'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={save.isPending || loadingExisting || !name.trim()}>
            {save.isPending && <Spinner />} {role ? 'Update Role' : 'Add Role'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="role-name">Role Name *</Label>
          <Input
            id="role-name"
            placeholder="Role Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">
            Attach Permissions{' '}
            <span className="text-muted-foreground">({selected.size} selected)</span>
          </p>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-primary">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[hsl(var(--primary))]"
              checked={allVisibleSelected}
              onChange={toggleAllVisible}
            />
            Select All Visible
          </label>
        </div>

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search permissions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {permissions.isLoading || loadingExisting ? (
          <AppLoadingState label="Loading permissions…" />
        ) : permissions.isError ? (
          <AppErrorState message={extractApiError(permissions.error)} />
        ) : !visible.length ? (
          <p className="rounded-md border border-border p-4 text-center text-sm text-muted-foreground">
            No permissions match your search.
          </p>
        ) : (
          <div className="max-h-[46vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((p) => {
                const checked = selected.has(p.id);
                return (
                  <label
                    key={p.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 text-sm transition-colors',
                      checked
                        ? 'border-primary bg-primary/5 text-foreground'
                        : 'border-border hover:bg-accent',
                    )}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[hsl(var(--primary))]"
                      checked={checked}
                      onChange={() => toggle(p.id)}
                    />
                    <span className="truncate font-medium">{permissionLabel(p)}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
