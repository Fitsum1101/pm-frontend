import type { PlatformRole } from '@/domain/enums/role.enum';

// Core auth identity returned by auth-service on login.
export interface User {
  id: string;
  email: string;
  role: PlatformRole;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Rich profile owned by user-service (created asynchronously via Kafka).
export interface UserProfile {
  id: string;
  auth_id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | string;
  created_at: string;
  updated_at: string;
  settings?: UserSettings;
  notification_settings?: NotificationSettings;
}

export interface UserSettings {
  id: string;
  user_id: string;
  language: string;
  theme: string;
  email_notifications: boolean;
  push_notifications: boolean;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  marketing_emails: boolean;
  security_alerts: boolean;
  product_updates: boolean;
  system_alerts: boolean;
}
