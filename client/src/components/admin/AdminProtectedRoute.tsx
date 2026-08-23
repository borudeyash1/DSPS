import { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../../store/adminAuthStore';

const AdminProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAdminAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/my-admin/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/my-admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
