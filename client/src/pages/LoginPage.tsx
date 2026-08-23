import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { validateInput, sanitizeEmail, sanitizePassword, sanitizeOTP } from '../utils/sanitize';
import './LoginPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, clearError } = useAuthStore();
  const { toasts, showToast, hideToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOTP] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Handle toggle between login and register
  const handleToggle = () => {
    if (isRegisterMode) {
      // Switching to login
      setIsRegisterMode(false);
    } else {
      // Switching to register
      navigate('/register');
    }
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedPassword = sanitizePassword(password);

    // Validate email
    const emailValidation = validateInput(sanitizedEmail, 'email');
    if (!emailValidation.isValid) {
      showToast(emailValidation.error || 'Invalid email address', 'error');
      return;
    }

    if (!sanitizedEmail || !sanitizedEmail.trim()) {
      showToast('Please enter your email address', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    // Validate password
    const passwordValidation = validateInput(sanitizedPassword, 'password');
    if (!passwordValidation.isValid) {
      showToast(passwordValidation.error || 'Invalid password', 'error');
      return;
    }

    if (!sanitizedPassword || sanitizedPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setOtpLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/request-login-otp`, { 
        email: sanitizedEmail, 
        password: sanitizedPassword 
      });

      if (response.data.success) {
        setOtpSent(true);
        showToast('OTP sent successfully to your email', 'success');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to verify credentials';
      setLoginError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Sanitize OTP
    const sanitizedOTP = sanitizeOTP(otp);

    // Validate OTP
    const otpValidation = validateInput(sanitizedOTP, 'otp');
    if (!otpValidation.isValid) {
      showToast(otpValidation.error || 'Invalid OTP', 'error');
      return;
    }

    if (!sanitizedOTP || sanitizedOTP.length !== 6) {
      showToast('Please enter a valid 6-digit OTP', 'error');
      return;
    }

    setVerifyLoading(true);

    try {
      const sanitizedEmail = sanitizeEmail(email);
      const response = await axios.post(
        `${API_URL}/auth/verify-login-otp`,
        { email: sanitizedEmail, otp: sanitizedOTP },
        { withCredentials: true }
      );

      if (response.data.success && response.data.data.user) {
        if (response.data.data.accessToken) {
          localStorage.setItem('accessToken', response.data.data.accessToken);
        }

        if (response.data.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.data.refreshToken);
        }

        // Store email if remember me is checked
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', sanitizedEmail);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        setUser(response.data.data.user);
        showToast('Login successful! Redirecting...', 'success');

        setTimeout(() => {
          const redirect = searchParams.get('redirect') || '/';
          navigate(redirect);
        }, 1000);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Invalid OTP. Please try again';
      setLoginError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendOTP = () => {
    setOTP('');
    setOtpSent(false);
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    clearError();

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
    const scope = 'email profile';
    const redirect = searchParams.get('redirect') || '/';
    sessionStorage.setItem('oauth_redirect', redirect);

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

    window.location.href = googleAuthUrl;
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4" style={{ backgroundColor: '#f9f9f9' }}>
      <div className="flex flex-col items-center">
        {/* Toggle Switch */}
        <label htmlFor="authToggle" className="switch" aria-label="Toggle between Login and Register">
          <input 
            type="checkbox" 
            id="authToggle" 
            checked={isRegisterMode}
            onChange={handleToggle}
          />
          <span>Login</span>
          <span>Register</span>
        </label>

      {!otpSent ? (
        <form className="form" onSubmit={handleRequestOTP}>
          <div className="flex-column">
            <label>Email </label>
          </div>
          <div className="inputForm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 32 32" height="20">
              <g data-name="Layer 3" id="Layer_3">
                <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"></path>
              </g>
            </svg>
            <input
              placeholder="Enter your Email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={100}
            />
          </div>

          <div className="flex-column">
            <label>Password </label>
          </div>
          <div className="inputForm" style={{ position: 'relative' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="-64 0 512 512" height="20">
              <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"></path>
              <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"></path>
            </svg>
            <input
              placeholder="Enter your Password"
              className="input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingRight: '40px' }}
              maxLength={30}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '5px',
                display: 'flex',
                alignItems: 'center',
                color: '#666'
              }}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>

          <div className="flex-row">
            <div>
              <input 
                type="checkbox" 
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe">Remember me </label>
            </div>
            <Link to="/forgot-password">
               <span className="span">Forgot password?</span>
            </Link>
          </div>
          
          {loginError && (
             <p className="p" style={{color: 'red'}}>{loginError}</p>
          )}

          <button className="button-submit" disabled={otpLoading}>
             {otpLoading ? 'Verifying...' : 'Verify Credentials & Send OTP'}
          </button>
          
          <p className="p">
            Don't have an account? <Link to="/register"><span className="span">Register</span></Link>
          </p>
          
          <p className="p line">Or With</p>

          <div className="flex-row">
            <button type="button" className="btn google" onClick={handleGoogleLogin} disabled={googleLoading}>
              <svg
                xmlSpace="preserve"
                viewBox="0 0 512 512"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                version="1.1"
              >
                <path d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256	c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456	C103.821,274.792,107.225,292.797,113.47,309.408z" style={{ fill: '#FBBB00' }}></path>
                <path d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451	c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535	c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176L507.527,208.176z" style={{ fill: '#518EF8' }}></path>
                <path d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512	c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.91c21.619,57.698,77.278,98.771,142.53,98.771	c28.047,0,54.323-7.582,76.87-20.818L416.253,455.624z" style={{ fill: '#28B446' }}></path>
                <path d="M419.404,58.936l-82.933,67.896c-23.335-14.586-50.919-23.012-80.471-23.012	c-66.729,0-123.429,42.957-143.965,102.724l-83.397-68.276h-0.014C71.23,56.123,157.06,0,256,0	C318.115,0,375.068,22.126,419.404,58.936z" style={{ fill: '#F14336' }}></path>
              </svg>
              Google
            </button>
          </div>
        </form>
      ) : (
        <form className="form" onSubmit={handleVerifyOTP}>
          <div className="flex-column">
             <label style={{textAlign: 'center', width: '100%', fontSize: '18px'}}>Verify OTP</label>
             <p className="p">Sent to {email}</p>
          </div>
          
          <div className="inputForm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
               <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <input
              type="text"
              className="input"
              value={otp}
              onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              required
              autoFocus
            />
          </div>

          {loginError && (
             <p className="p" style={{color: 'red'}}>{loginError}</p>
          )}

          <button className="button-submit" disabled={verifyLoading || otp.length !== 6}>
            {verifyLoading ? 'Verifying...' : 'Verify & Login'}
          </button>

          <button
            type="button"
            onClick={handleResendOTP}
            className="p"
            style={{background: 'none', border: 'none', cursor: 'pointer', color: '#2d79f3', width: '100%'}}
          >
            Back to Login
          </button>
        </form>
      )}
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

export default LoginPage;
