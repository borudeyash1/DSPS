import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const GuestGuard = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestGuard;
