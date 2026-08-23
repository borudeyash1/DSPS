import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';
import { useAuthStore } from '../store/authStore';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

const GoogleCallbackPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const { toasts, showToast, hideToast } = useToast();
  const [error, setError] = useState('');

  const hasCalled = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent double invocation in Strict Mode
      if (hasCalled.current) return;
      hasCalled.current = true;

      try {
        // Get authorization code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        console.log('🔍 [OAuth Debug] Full URL:', window.location.href);
        console.log('🔍 [OAuth Debug] Code from URL:', code);

        if (!code) {
          const errorMsg = 'No authorization code received';
          setError(errorMsg);
          showToast(errorMsg, 'error');
          return;
        }

        // Exchange code for token via backend
        console.log('📤 [OAuth Debug] Sending code to backend:', code);
        const response = await authService.googleAuth(code);

        console.log('✅ [OAuth Debug] Response:', response);

        if (response.success && response.data.user) {
          // Store tokens in localStorage
          if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
            console.log('✅ [OAuth Debug] Access token stored');
          }

          if (response.data.refreshToken) {
            localStorage.setItem('refreshToken', response.data.refreshToken);
            console.log('✅ [OAuth Debug] Refresh token stored');
          }

          // Set user in Zustand store
          setUser(response.data.user);
          console.log('✅ [OAuth Debug] User set in store:', response.data.user);

          // Show success toast
          showToast('Google sign-in successful! Welcome back!', 'success');

          // Get redirect URL from sessionStorage
          const redirect = sessionStorage.getItem('oauth_redirect') || '/';
          sessionStorage.removeItem('oauth_redirect');

          console.log('🔄 [OAuth Debug] Redirecting to:', redirect);
          setTimeout(() => {
            navigate(redirect);
          }, 1000);
        } else {
          const errorMsg = 'Failed to authenticate with Google';
          setError(errorMsg);
          showToast(errorMsg, 'error');
        }
      } catch (err: any) {
        console.error('Google OAuth error:', err);
        const errorMsg = err.response?.data?.message || 'Authentication failed';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    };

    handleCallback();
  }, [navigate, setUser]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Failed</h1>
          <p className="text-secondary mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="spinner mb-4"></div>
        <p className="text-secondary">Completing Google sign-in...</p>
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

export default GoogleCallbackPage;
