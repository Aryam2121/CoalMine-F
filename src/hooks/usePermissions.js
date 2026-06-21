import { useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  hasPermission,
  canAccessPath,
  isAdmin,
  isManager,
  getRoleInfo,
  PERMISSIONS,
  SERVER_SYNCED_PERMISSIONS,
} from '../utils/roles';

const resolvePermission = (user, role, permission) => {
  const serverPermissions = user?.permissions;
  if (
    Array.isArray(serverPermissions) &&
    SERVER_SYNCED_PERMISSIONS.has(permission)
  ) {
    return serverPermissions.includes(permission);
  }
  return hasPermission(role, permission);
};

export function usePermissions() {
  const { user } = useContext(AuthContext);
  const role = user?.role;

  return useMemo(
    () => ({
      user,
      role,
      roleInfo: getRoleInfo(role),
      isAdmin: user?.access?.isAdmin ?? isAdmin(role),
      isManager: user?.access?.isManager ?? isManager(role),
      can: (permission) => resolvePermission(user, role, permission),
      canAccess: (path) => canAccessPath(role, path),
      PERMISSIONS,
    }),
    [user, role]
  );
}

export default usePermissions;
