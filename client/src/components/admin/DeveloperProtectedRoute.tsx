import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuthStore } from '../../store/adminAuthStore';

const DeveloperProtectedRoute = () => {
    const { admin, isAuthenticated, isLoading } = useAdminAuthStore();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }

    // Check if authenticated AND is a developer
    if (!isAuthenticated || admin?.role !== 'developer') {
        // Redirect to dashboard if logged in but not dev, or login if not logged in
        return <Navigate to={isAuthenticated ? "/my-admin/dashboard" : "/my-admin/login"} replace />;
    }

    return <Outlet />;
};

export default DeveloperProtectedRoute;
