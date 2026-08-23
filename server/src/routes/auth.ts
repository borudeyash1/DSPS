import express from 'express';
import {
    register,
    verifyEmailOTP,
    resendEmailOTP,
    login,
    logout,
    refreshToken,
    getCurrentUser,
    forgotPassword,
    resetPassword,
    googleAuth,
    requestLoginOTP,
    verifyLoginOTP,
    updateProfile,
    changePassword,
    sendPasswordChangeOTP,
    changePasswordWithOTP,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    sendWhatsappOtp,
    verifyWhatsappOtp,
    verifyOldPhoneOtp,
} from '../controllers/authController';
import { requestAccountDeletion, confirmAccountDeletion } from '../controllers/accountDeletionController';
import { authenticate, authenticateRefresh } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/verify-email', verifyEmailOTP);
router.post('/resend-otp', resendEmailOTP);
router.post('/login', login);
router.post('/request-login-otp', requestLoginOTP);
router.post('/verify-login-otp', verifyLoginOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google', googleAuth);
router.post('/send-whatsapp-otp', sendWhatsappOtp);
router.post('/verify-whatsapp-otp', authenticate, verifyWhatsappOtp);
router.post('/verify-old-phone-otp', authenticate, verifyOldPhoneOtp);

// Protected routes
router.post('/logout', authenticate, logout);
router.post('/refresh', authenticateRefresh, refreshToken);
router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.post('/send-password-change-otp', authenticate, sendPasswordChangeOTP);
router.put('/change-password-with-otp', authenticate, changePasswordWithOTP);

// Address management
router.get('/addresses', authenticate, getAddresses);
router.post('/addresses', authenticate, addAddress);
router.put('/addresses/:addressId', authenticate, updateAddress);
router.delete('/addresses/:addressId', authenticate, deleteAddress);
router.put('/addresses/:addressId/default', authenticate, setDefaultAddress);

// Account deletion
router.post('/request-account-deletion', authenticate, requestAccountDeletion);
router.get('/confirm-delete-account', confirmAccountDeletion);

export default router;
