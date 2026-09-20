import { apiClient } from '@/infrastructure/api/api';
import { API_ENDPOINTS } from '@/infrastructure/api/endpoints';
import type { ApiEnvelope, PaginatedData } from '@/types/api';
import type { Notification } from '@/domain/entities/notification.types';

// The API returns `status` (UNREAD/READ); derive the `read` boolean the UI uses.
type RawNotification = Omit<Notification, 'read'>;
const withRead = (n: RawNotification): Notification => ({ ...n, read: n.status === 'READ' });

export const notificationService = {
  list: async (page = 1, limit = 10): Promise<PaginatedData<Notification>> => {
    const { data } = await apiClient.get<ApiEnvelope<PaginatedData<RawNotification>>>(
      API_ENDPOINTS.notifications.list,
      { params: { page, limit } },
    );
    const d = data.data;
    return { ...d, data: d.data.map(withRead) };
  },

  unreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get<ApiEnvelope<{ count: number }>>(
      API_ENDPOINTS.notifications.unreadCount,
    );
    return data.data?.count ?? 0;
  },

  getOne: async (id: string): Promise<Notification> => {
    const { data } = await apiClient.get<ApiEnvelope<RawNotification>>(
      API_ENDPOINTS.notifications.byId(id),
    );
    return withRead(data.data);
  },

  markRead: async (id: string): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.notifications.markRead(id));
  },

  markManyRead: async (ids: string[]): Promise<void> => {
    if (!ids.length) return;
    await apiClient.patch(API_ENDPOINTS.notifications.markManyRead, { ids });
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.notifications.markAllRead);
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.notifications.byId(id));
  },

  // ─── Web push ────────────────────────────────────────────────────────────────
  getVapidKey: async (): Promise<string> => {
    const { data } = await apiClient.get<ApiEnvelope<{ public_key: string }>>(
      API_ENDPOINTS.notifications.vapidKey,
    );
    return data.data?.public_key ?? '';
  },

  pushSubscribe: async (subscription: PushSubscriptionJSON): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.notifications.pushSubscribe, { subscription });
  },

  pushUnsubscribe: async (endpoint: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.notifications.pushUnsubscribe, { endpoint });
  },
};
