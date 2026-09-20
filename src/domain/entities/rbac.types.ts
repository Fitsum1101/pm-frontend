// RBAC entities returned by permission-service.

export interface Role {
  id: string;
  name: string;
  description?: string;
  permission_count: number;
  user_count: number;
  created_at: string;
  updated_at: string;
}

export interface PermissionRecord {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  created_at: string;
  updated_at: string;
}

// permission-service list envelopes (data holds a named array + paging).
export interface RoleListData {
  roles: Role[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PermissionListData {
  permissions: PermissionRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
