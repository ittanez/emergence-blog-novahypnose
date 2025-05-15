
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/contexts/AuthContext';
import { ReactNode } from 'react';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <div className="container mx-auto py-8 text-center">Chargement...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
