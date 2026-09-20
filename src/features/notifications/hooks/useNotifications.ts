import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../api/notificationService';

const KEYS = {
  list: (page: number, limit: number) => ['notifications', 'list', page, limit] as const,
  unread: ['notifications', 'unread-count'] as const,
};

export function useNotifications(page = 1, limit = 10) {
  return useQuery({
    queryKey: KEYS.list(page, limit),
    queryFn: () => notificationService.list(page, limit),
  });
}

export function useUnreadCount() {
  return useQuery({ queryKey: KEYS.unread, queryFn: notificationService.unreadCount });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkManyRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => notificationService.markManyRead(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAllRead,
    meta: { successMessage: 'All notifications marked as read.' },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.remove(id),
    meta: { successMessage: 'Notification removed.' },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
