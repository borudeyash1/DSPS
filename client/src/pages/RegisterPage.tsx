import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { validateInput, sanitizeName, sanitizeEmail, sanitizePhone, sanitizePassword, sanitizeOTP } from '../utils/sanitize';
import './LoginPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, error, isLoading, clearError } = useAuthStore();
  const { toasts, showToast, hideToast } = useToast();
  const [isLoginMode, setIsLoginMode] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: '', // Added gender
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);

  // Handle toggle between login and register
  const handleToggle = () => {
    if (isLoginMode) {
      setIsLoginMode(false);
    } else {
      navigate('/login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Sanitize all inputs
    const sanitizedFullName = sanitizeName(formData.fullName);
    const sanitizedEmail = sanitizeEmail(formData.email);
    const sanitizedPhone = sanitizePhone(formData.phone);
    const sanitizedPassword = sanitizePassword(formData.password);
    const sanitizedConfirmPassword = sanitizePassword(formData.confirmPassword);

    // Validate full name
    const nameValidation = validateInput(sanitizedFullName, 'name');
    if (!nameValidation.isValid) {
      showToast(nameValidation.error || 'Invalid name', 'error');
      return;
    }

    if (!sanitizedFullName || !sanitizedFullName.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }

    if (sanitizedFullName.trim().length < 2) {
      showToast('Full name must be at least 2 characters', 'error');
      return;
    }

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

    // Phone validation (optional but if provided, must be valid)
    if (sanitizedPhone && sanitizedPhone.trim()) {
      const phoneValidation = validateInput(sanitizedPhone, 'phone');
      if (!phoneValidation.isValid) {
        showToast(phoneValidation.error || 'Invalid phone number', 'error');
        return;
      }

      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(sanitizedPhone.trim())) {
        showToast('Please enter a valid phone number', 'error');
        return;
      }
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

    if (sanitizedPassword !== sanitizedConfirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    try {
      // Send sanitized data to API
      await register({
        fullName: sanitizedFullName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        gender: formData.gender as 'Male' | 'Female' | 'Other', // Pass gender
        password: sanitizedPassword,
        confirmPassword: sanitizedConfirmPassword,
      });
      setShowOTPModal(true);
      showToast('Registration successful! Please verify your email', 'success');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again';
      showToast(errorMessage, 'error');
      console.error('Registration error:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGoogleRegister = () => {
    clearError();
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
    const scope = 'email profile';
    sessionStorage.setItem('oauth_redirect', '/');

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    window.location.href = googleAuthUrl;
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4" style={{ backgroundColor: '#f9f9f9' }}>
      <div className="flex flex-col items-center">
        {/* Toggle Switch */}
        <label htmlFor="authToggleReg" className="switch" aria-label="Toggle between Login and Register">
          <input
            type="checkbox"
            id="authToggleReg"
            checked={!isLoginMode}
            onChange={handleToggle}
          />
          <span>Login</span>
          <span>Register</span>
        </label>

        {!showOTPModal ? (
          <form className="form" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="flex-column">
              <label>Full Name </label>
            </div>
            <div className="inputForm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input
                placeholder="Enter your full name"
                className="input"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                maxLength={50}
                required
              />
            </div>

            {/* Email */}
            <div className="flex-column">
              <label>Email Address </label>
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
                name="email"
                value={formData.email}
                onChange={handleChange}
                maxLength={100}
                required
              />
            </div>

            {/* Phone */}
            <div className="flex-column">
              <label>Phone Number (Optional) </label>
            </div>
            <div className="inputForm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <input
                placeholder="+91 1234567890"
                className="input"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                maxLength={15}
              />
            </div>

            {/* Gender */}
            <div className="flex-column">
              <label>Gender </label>
            </div>
            <div className="inputForm" style={{ padding: '0 10px', height: 'auto', minHeight: '45px' }}>
              <div style={{ display: 'flex', gap: '20px', width: '100%', alignItems: 'center', height: '100%' }}>
                {['Male', 'Female', 'Other'].map((g) => (
                  <label key={g} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#555',
                    margin: 0
                  }}>
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={formData.gender === g}
                      onChange={handleChange}
                      style={{ accentColor: '#2B2B2B', width: '16px', height: '16px', margin: 0 }}
                    />
                    {g}
                  </label>
                ))}
              </div>
            </div>

            {/* Password */}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                maxLength={30}
                style={{ paddingRight: '40px' }}
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
            <p className="p" style={{ fontSize: '12px', color: '#666', margin: '0 0 10px 0' }}>Minimum 6 characters</p>

            {/* Confirm Password */}
            <div className="flex-column">
              <label>Confirm Password </label>
            </div>
            <div className="inputForm" style={{ position: 'relative' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="-64 0 512 512" height="20">
                <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"></path>
                <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"></path>
              </svg>
              <input
                placeholder="Confirm your Password"
                className="input"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={{ paddingRight: '40px' }}
                maxLength={30}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                {showConfirmPassword ? (
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

            {error && (
              <p className="p" style={{ color: 'red' }}>{error}</p>
            )}

            <button className="button-submit" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <p className="p">
              Already have an account? <Link to="/login"><span className="span">Login</span></Link>
            </p>

            <p className="p line">Or With</p>

            <div className="flex-row">
              <button type="button" className="btn google" onClick={handleGoogleRegister}>
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
          <OTPVerification email={formData.email} />
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

// OTP Verification Component
const OTPVerification = ({ email }: { email: string }) => {
  const navigate = useNavigate();
  const { verifyEmail, resendOTP, error, isLoading } = useAuthStore();
  const { showToast } = useToast();
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Helper for cooldown timer
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    try {
      await resendOTP(email);
      showToast('New OTP sent successfully!', 'success');
      setResendCooldown(60); // 1 minute cooldown
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to resend OTP', 'error');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sanitize OTP
    const sanitizedOTP = sanitizeOTP(otp);
    const sanitizedEmail = sanitizeEmail(email);

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

    try {
      await verifyEmail(sanitizedEmail, sanitizedOTP);
      showToast('Email verified successfully! Redirecting...', 'success');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Invalid OTP. Please try again';
      showToast(errorMessage, 'error');
      console.error('OTP verification error:', err);
    }
  };

  return (
    <form className="form" onSubmit={handleVerify}>
      <div className="flex-column">
        <label style={{ textAlign: 'center', width: '100%', fontSize: '18px' }}>Verify Your Email</label>
        <p className="p">We've sent a 6-digit code to {email}</p>
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
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="Enter 6-digit OTP"
          maxLength={6}
          required
          autoFocus
        />
      </div>

      {error && (
        <p className="p" style={{ color: 'red' }}>{error}</p>
      )}

      <button className="button-submit" disabled={isLoading || otp.length !== 6}>
        {isLoading ? 'Verifying...' : 'Verify Email'}
      </button>

      <p className="p" style={{ fontSize: '14px' }}>
        Didn't receive the code?{' '}
        <span
          className="span"
          style={{
            cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
            opacity: resendCooldown > 0 ? 0.5 : 1
          }}
          onClick={handleResend}
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend'}
        </span>
      </p>
    </form>
  );
};

export default RegisterPage;
