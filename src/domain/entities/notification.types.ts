// Mirrors notification-service. The API stores read state as `status`
// (UNREAD/READ); the service layer derives the `read` boolean for the UI.
export type NotificationType = 'SYSTEM' | 'ACCOUNT' | 'SECURITY' | 'MESSAGE' | (string & {});
export type NotificationStatus = 'UNREAD' | 'READ';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  status: NotificationStatus;
  // Derived client-side from `status` for convenient rendering.
  read: boolean;
  created_at: string;
  updated_at?: string;
}
