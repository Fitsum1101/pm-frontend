import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { AppLoadingState } from '@/components/feedback/AppStates';
import { useRoles } from '@/features/roles/hooks/useRoles';
import { useUserRoles, useAssignUserRole, useRemoveUserRole } from '@/features/users/hooks/useUsers';
import type { UserProfile } from '@/domain/entities/user.types';

// Assign / remove roles for a user. Role membership is keyed by the auth
// user id (UserProfile.auth_id) in the permission-service.
export function UserRolesModal({
  user,
  open,
  onClose,
}: {
  user: UserProfile;
  open: boolean;
  onClose: () => void;
}) {
  const authId = user.auth_id;
  const allRoles = useRoles();
  const userRoles = useUserRoles(authId);
  const assign = useAssignUserRole();
  const remove = useRemoveUserRole();

  const assignedIds = new Set((userRoles.data ?? []).map((r) => r.id));
  const busy = assign.isPending || remove.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Roles — ${user.full_name}`}
      footer={
        <Button onClick={onClose}>Done</Button>
      }
    >
      {allRoles.isLoading || userRoles.isLoading ? (
        <AppLoadingState label="Loading roles…" />
      ) : !allRoles.data?.roles.length ? (
        <p className="text-sm text-muted-foreground">
          No roles exist yet. Create one on the Roles page first.
        </p>
      ) : (
        <div className="space-y-2">
          {allRoles.data.roles.map((role) => {
            const assigned = assignedIds.has(role.id);
            return (
              <div
                key={role.id}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2"
              >
                <div>
                  <span className="font-medium text-foreground">{role.name}</span>
                  {assigned && (
                    <Badge variant="success" className="ml-2">
                      assigned
                    </Badge>
                  )}
                  {role.description && (
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  )}
                </div>
                {assigned ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => remove.mutate({ userId: authId, roleId: role.id })}
                  >
                    Remove
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() => assign.mutate({ userId: authId, roleId: role.id })}
                  >
                    {busy && <Spinner />} Assign
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
