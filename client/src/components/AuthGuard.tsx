import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface AuthGuardProps {
    children: React.ReactNode;
    requireAuth?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth = true }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (requireAuth && !isAuthenticated) {
            // Store the current path for redirect after login
            const redirectPath = location.pathname + location.search;
            navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`, { replace: true });
        }
    }, [isAuthenticated, requireAuth, navigate, location]);

    // If not authenticated, don't render anything (will redirect)
    if (requireAuth && !isAuthenticated) {
        return null;
    }

    return <>{children}</>;
};

export default AuthGuard;
