import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { getDeviceId } from '../../utils/deviceId';
import { Shield, AlertCircle, Mail, Key, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import GoogleOAuthButton from '../../components/GoogleOAuthButton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, setAdmin } = useAdminAuthStore();

  const [deviceChecked, setDeviceChecked] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOTP] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Check device on mount (optional logging only)
  useEffect(() => {
    const deviceId = getDeviceId();
    console.log('🔍 Device ID:', deviceId);
    setDeviceChecked(true);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/my-admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setOtpLoading(true);

    try {
      const response = await axios.post(`${API_URL}/admin/request-otp`, { email, password });

      if (response.data.success) {
        setOtpSent(true);
      }
    } catch (err: any) {
      setLoginError(err.response?.data?.message || 'Failed to verify credentials');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setVerifyLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/admin/verify-otp`,
        { email, otp, deviceId: getDeviceId() },
        { withCredentials: true }
      );

      if (response.data.success) {
        console.log('✅ [Admin Login] OTP Verified successfully');

        // Store tokens in localStorage with ADMIN-specific keys
        if (response.data.data.accessToken) {
          localStorage.setItem('adminAccessToken', response.data.data.accessToken);
          console.log('✅ [Admin Login] Access token stored');
        }

        if (response.data.data.refreshToken) {
          localStorage.setItem('adminRefreshToken', response.data.data.refreshToken);
          console.log('✅ [Admin Login] Refresh token stored');
        }

        // Set admin in Zustand store
        setAdmin(response.data.data.admin);
        console.log('✅ [Admin Login] Admin set in store:', response.data.data.admin);

        navigate('/my-admin/dashboard');
      }
    } catch (err: any) {
      setLoginError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOTP('');
    setOtpSent(false);
    // We don't clear password here so user can just click "Send OTP" again
  };

  // Loading state while checking device
  if (!deviceChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-white">Verifying device...</p>
        </div>
      </div>
    );
  }



  // Device authorized - show Login/OTP form
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="max-w-md w-full bg-white p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Botam Apparels" className="h-16 w-auto" />
          </div>
          <p className="text-secondary">Admin Panel</p>
        </div>

        {!otpSent ? (
          /* Credentials Form */
          <form onSubmit={handleRequestOTP} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-border focus:outline-none focus:border-primary transition-colors"
                  placeholder="admin@botamapparels.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3 border border-border focus:outline-none focus:border-primary transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 flex items-start gap-2 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={otpLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {otpLoading ? 'Verifying...' : 'Verify Credentials & Send OTP'}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-secondary">Or</span>
              </div>
            </div>

            {/* Google OAuth */}
            <GoogleOAuthButton isAdmin={true} />
          </form>
        ) : (
          /* Verify OTP Form */
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm mb-4">
              <p className="font-medium">Credentials Verified!</p>
              <p className="text-xs mt-1">OTP sent to {email}</p>
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm font-medium mb-2">
                Enter OTP
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  className="w-full pl-12 pr-4 py-3 border border-border focus:outline-none focus:border-primary transition-colors text-center text-2xl tracking-widest font-bold"
                  placeholder="000000"
                  autoFocus
                />
              </div>
              <p className="text-xs text-secondary mt-2">Enter the 6-digit code sent to your email</p>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 flex items-start gap-2 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={verifyLoading || otp.length !== 6}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifyLoading ? 'Verifying...' : 'Verify & Login'}
            </button>

            <button
              type="button"
              onClick={handleResendOTP}
              className="w-full text-sm text-secondary hover:text-primary transition-colors"
            >
              Back to Login
            </button>
          </form>
        )}

        {/* Device Info */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-secondary">
            <Shield className="w-4 h-4 text-green-600" />
            <span>Device Authorized</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
