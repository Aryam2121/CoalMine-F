import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { canAccessPath } from '../utils/roles';
import AccessDenied from './AccessDenied';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="loading-spinner h-8 w-8" aria-label="Checking session" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = user?.role;

  if (allowedRoles?.length && !allowedRoles.map((r) => r.toLowerCase()).includes((role || '').toLowerCase())) {
    return <AccessDenied message="This page is limited to specific roles. Use the sidebar to see what your account can access." />;
  }

  if (!canAccessPath(role, location.pathname)) {
    return (
      <AccessDenied
        message={`This page is not available for the ${role || 'worker'} role. Managers and admins see additional modules in the sidebar.`}
      />
    );
  }

  return children;
};

export default ProtectedRoute;
