import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { permissionService, type CreatePermissionPayload } from '../api/permissionService';

const KEYS = {
  all: ['permissions'] as const,
  list: (page: number, limit: number) => ['permissions', 'list', page, limit] as const,
};

export function usePermissionsList(page = 1, limit = 100) {
  return useQuery({
    queryKey: KEYS.list(page, limit),
    queryFn: () => permissionService.list(page, limit),
  });
}

export function useCreatePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePermissionPayload) => permissionService.create(payload),
    meta: { successMessage: 'Permission created.' },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useDeletePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => permissionService.remove(id),
    meta: { successMessage: 'Permission deleted.' },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
