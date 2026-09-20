// Permission strings mirror the backend's PERMISSIONS registry
// (packages/shared-types). The API is the authority on what is granted;
// this type is the shared client-side vocabulary used by guards, the store,
// and the <Can> component. Extend as new capabilities are added.
export type Permission =
  | 'users:create'
  | 'users:read'
  | 'users:update'
  | 'users:delete'
  | 'users:list'
  | 'users:suspend'
  | 'roles:create'
  | 'roles:read'
  | 'roles:update'
  | 'roles:delete'
  | 'roles:list'
  | 'roles:assign'
  | 'permissions:create'
  | 'permissions:read'
  | 'permissions:update'
  | 'permissions:delete'
  | 'permissions:list'
  | 'permissions:assign'
  | 'audit:read'
  | 'audit:list'
  | 'notifications:read'
  | 'notifications:update'
  | 'notifications:delete'
  | 'notifications:list';
