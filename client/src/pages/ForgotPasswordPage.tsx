import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { validateInput, sanitizeEmail, sanitizePassword, sanitizeOTP } from '../utils/sanitize';
import '../pages/LoginPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { toasts, showToast, hideToast } = useToast();
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sanitize email
    const sanitizedEmail = sanitizeEmail(email);

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

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email: sanitizedEmail });
      if (response.data.success) {
        showToast('OTP sent to your email', 'success');
        setStep('otp');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to send OTP';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sanitize inputs
    const sanitizedOTP = sanitizeOTP(otp);
    const sanitizedPassword = sanitizePassword(password);
    const sanitizedConfirmPassword = sanitizePassword(confirmPassword);

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

    // Validate password
    const passwordValidation = validateInput(sanitizedPassword, 'password');
    if (!passwordValidation.isValid) {
      showToast(passwordValidation.error || 'Invalid password', 'error');
      return;
    }

    if (sanitizedPassword !== sanitizedConfirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (sanitizedPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);

    try {
      const sanitizedEmail = sanitizeEmail(email);
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        email: sanitizedEmail,
        otp: sanitizedOTP,
        password: sanitizedPassword,
      });

      if (response.data.success) {
        showToast('Password reset successful! Redirecting to login...', 'success');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to reset password';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4" style={{ backgroundColor: '#f9f9f9' }}>
      {step === 'email' ? (
        <form className="form" onSubmit={handleRequestOTP}>
          <div className="flex-column">
            <label style={{ textAlign: 'center', width: '100%', fontSize: '20px', marginBottom: '10px' }}>
              Forgot Password
            </label>
            <p className="p" style={{ marginBottom: '20px' }}>
              Enter your email to receive a password reset OTP
            </p>
          </div>

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
            />
          </div>

          <button className="button-submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send OTP'}
          </button>

          <p className="p">
            Remember your password? <Link to="/login"><span className="span">Sign In</span></Link>
          </p>
        </form>
      ) : step === 'otp' ? (
        <form className="form" onSubmit={handleVerifyOTP}>
          <div className="flex-column">
            <label style={{ textAlign: 'center', width: '100%', fontSize: '18px' }}>Reset Password</label>
            <p className="p">Enter OTP and new password</p>
          </div>

          <div className="flex-column">
            <label>OTP </label>
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
            />
          </div>

          <div className="flex-column">
            <label>New Password </label>
          </div>
          <div className="inputForm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="-64 0 512 512" height="20">
              <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"></path>
              <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"></path>
            </svg>
            <input
              placeholder="New Password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex-column">
            <label>Confirm Password </label>
          </div>
          <div className="inputForm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="-64 0 512 512" height="20">
              <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"></path>
              <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"></path>
            </svg>
            <input
              placeholder="Confirm Password"
              className="input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button className="button-submit" disabled={loading || otp.length !== 6}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

          <button
            type="button"
            onClick={() => setStep('email')}
            className="p"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2d79f3', width: '100%' }}
          >
            Back to Email
          </button>
        </form>
      ) : null}

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

export default ForgotPasswordPage;
