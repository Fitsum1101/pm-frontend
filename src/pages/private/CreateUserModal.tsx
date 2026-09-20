import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Label } from '@/components/ui/Label';
import { Spinner } from '@/components/ui/Spinner';
import { ChevronDownIcon } from '@/components/ui/icons';
import { useCreateUser } from '@/features/users/hooks/useUsers';
import { useRoles } from '@/features/roles/hooks/useRoles';

interface CreateUserForm {
  full_name: string;
  email: string;
  password: string;
}

// Admin: register a new system account with one or more RBAC roles. The
// account is created already verified — the user can sign in immediately.
export function CreateUserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const roles = useRoles();
  const createUser = useCreateUser();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserForm>();

  const [roleIds, setRoleIds] = useState<Set<string>>(new Set());
  const [rolesOpen, setRolesOpen] = useState(false);

  const close = () => {
    reset();
    setRoleIds(new Set());
    setRolesOpen(false);
    onClose();
  };

  const toggleRole = (id: string) =>
    setRoleIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const submit = (values: CreateUserForm) => {
    createUser.mutate(
      {
        full_name: values.full_name,
        email: values.email,
        password: values.password,
        roleIds: [...roleIds],
      },
      { onSuccess: close },
    );
  };

  const selectedNames = (roles.data?.roles ?? [])
    .filter((r) => roleIds.has(r.id))
    .map((r) => r.name);

  return (
    <Modal
      open={open}
      onClose={close}
      size="lg"
      title="Register New User"
      description="Create a new system account with specific roles and credentials."
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(submit)} disabled={createUser.isPending}>
            {createUser.isPending && <Spinner />} Create User
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <FormField label="Full Name *" htmlFor="cu-name" error={errors.full_name && 'Required (min 2 characters)'}>
          <Input id="cu-name" placeholder="Full Name" {...register('full_name', { required: true, minLength: 2 })} />
        </FormField>

        <FormField label="Email Address *" htmlFor="cu-email" error={errors.email && 'Valid email required'}>
          <Input id="cu-email" type="email" placeholder="Email Address" {...register('email', { required: true })} />
        </FormField>

        <div className="space-y-1.5">
          <Label htmlFor="cu-roles">Roles *</Label>
          <div className="relative">
            <button
              type="button"
              id="cu-roles"
              onClick={() => setRolesOpen((v) => !v)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className={selectedNames.length ? 'text-foreground' : 'text-muted-foreground'}>
                {selectedNames.length ? selectedNames.join(', ') : 'Select roles'}
              </span>
              <ChevronDownIcon className="text-muted-foreground" />
            </button>
            {rolesOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setRolesOpen(false)} aria-hidden />
                <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-md border border-border bg-card shadow-md">
                  {roles.isLoading ? (
                    <p className="px-3 py-2 text-sm text-muted-foreground">Loading roles…</p>
                  ) : !roles.data?.roles.length ? (
                    <p className="px-3 py-2 text-sm text-muted-foreground">No roles available.</p>
                  ) : (
                    roles.data.roles.map((r) => (
                      <label
                        key={r.id}
                        className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-accent"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[hsl(var(--primary))]"
                          checked={roleIds.has(r.id)}
                          onChange={() => toggleRole(r.id)}
                        />
                        <span className="font-medium text-foreground">{r.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <FormField label="Password *" htmlFor="cu-password" error={errors.password && 'Min 8 characters'}>
          <Input
            id="cu-password"
            type="password"
            placeholder="Password"
            {...register('password', { required: true, minLength: 8 })}
          />
        </FormField>

        <p className="rounded-md bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
          The account is created already verified — the user can sign in right away with these
          credentials.
        </p>
      </form>
    </Modal>
  );
}
