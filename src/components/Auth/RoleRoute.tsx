import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: Array<'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'CLIENT'>;
  requiredPerms?: string[];
}

const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles, requiredPerms }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredPerms && requiredPerms.length > 0) {
    const hasAllPerms = requiredPerms.every((perm) => user.perms?.includes(perm));
    if (!hasAllPerms) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default RoleRoute;
