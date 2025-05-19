
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/contexts/AuthContext';
import { ReactNode, useEffect } from 'react';
import { toast } from 'sonner';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      toast.error("Vous devez vous connecter pour accéder à cette page");
    } else if (!isLoading && user && !isAdmin) {
      toast.error("Vous n'avez pas les droits administrateur");
    }
  }, [isLoading, user, isAdmin]);

  if (isLoading) {
    return <div className="container mx-auto py-8 text-center">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/admin" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
