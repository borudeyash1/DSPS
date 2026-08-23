import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { getDeviceId } from '../../utils/deviceId';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminGoogleCallbackPage = () => {
  const navigate = useNavigate();
  const { setAdmin } = useAdminAuthStore();
  const { toasts, showToast, hideToast } = useToast();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get authorization code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        console.log('🔍 [Admin OAuth Debug] Code:', code);

        if (!code) {
          const errorMsg = 'No authorization code received';
          setError(errorMsg);
          showToast(errorMsg, 'error');
          return;
        }

        // Exchange code for token via backend
        const response = await axios.post(
          `${API_URL}/admin/google-auth`,
          { code, deviceId: getDeviceId() },
          { withCredentials: true }
        );

        console.log('✅ [Admin OAuth Debug] Response:', response.data);

        if (response.data.success && response.data.data.admin) {
          // Store tokens in localStorage with ADMIN-specific keys
          if (response.data.data.accessToken) {
            localStorage.setItem('adminAccessToken', response.data.data.accessToken);
            console.log('✅ [Admin OAuth] Access token stored');
          }

          if (response.data.data.refreshToken) {
            localStorage.setItem('adminRefreshToken', response.data.data.refreshToken);
            console.log('✅ [Admin OAuth] Refresh token stored');
          }

          // Set admin in Zustand store
          setAdmin(response.data.data.admin);
          console.log('✅ [Admin OAuth] Admin set in store:', response.data.data.admin);

          showToast('Admin Google sign-in successful! Welcome back!', 'success');

          setTimeout(() => {
            navigate('/my-admin/dashboard');
          }, 1000);
        } else {
          const errorMsg = 'Failed to authenticate with Google';
          setError(errorMsg);
          showToast(errorMsg, 'error');
        }
      } catch (err: any) {
        console.error('Admin Google OAuth error:', err);
        const errorMsg = err.response?.data?.message || 'Authentication failed';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    };

    handleCallback();
  }, [navigate, setAdmin]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="max-w-md w-full bg-white p-8 text-center rounded-lg shadow-xl">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Authentication Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/my-admin/login')}
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors"
          >
            Back to Admin Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-xl">Verifying admin credentials...</p>
      </div>

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default AdminGoogleCallbackPage;
