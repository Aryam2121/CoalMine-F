import { useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  hasPermission,
  canAccessPath,
  isAdmin,
  isManager,
  getRoleInfo,
  PERMISSIONS,
} from '../utils/roles';

export function usePermissions() {
  const { user } = useContext(AuthContext);
  const role = user?.role;

  return useMemo(
    () => ({
      user,
      role,
      roleInfo: getRoleInfo(role),
      isAdmin: isAdmin(role),
      isManager: isManager(role),
      can: (permission) => hasPermission(role, permission),
      canAccess: (path) => canAccessPath(role, path),
      PERMISSIONS,
    }),
    [user, role]
  );
}

export default usePermissions;
