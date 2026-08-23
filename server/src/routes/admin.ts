import express from 'express';
import {
    adminLogin,
    adminLogout,
    getDashboardStats,
    getAnalytics,
    getAllUsers,
    toggleUserStatus,
    checkDeviceAccess,
    getAllowedDevices,
    addAllowedDevice,
    updateAllowedDevice,
    deleteAllowedDevice,
    adminGoogleAuth,
    requestAdminOTP,
    verifyAdminOTP,
    refreshToken,
    createAdmin,
    getAllAdmins,
    toggleAdminStatus,
    deleteAdmin,
    initiateChangePassword,
    verifyChangePassword
} from '../controllers/adminController';
import { getAllOrders, updateOrderStatus } from '../controllers/orderController';
import {
    getAdminNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from '../controllers/adminNotificationController';
import {
    getPaymentSettings,
    updatePaymentSettings
} from '../controllers/paymentSettingsController';
import { authenticate, requireAdmin, requireFullAdmin, requireSuperAdmin, requireSuperAdminOrDeveloper } from '../middleware/auth';
import { sendEmail, getOTPEmailTemplate } from '../services/emailService';

const router = express.Router();

// Public route - check device access (BEFORE login)
router.post('/check-device', checkDeviceAccess);

// Admin login (public)
router.post('/login', adminLogin);
router.post('/register', authenticate, requireAdmin, requireFullAdmin, createAdmin);

// Admin Google OAuth (public)
router.post('/google-auth', adminGoogleAuth);

// Admin OTP login (public)
router.post('/request-otp', requestAdminOTP);
router.post('/verify-otp', verifyAdminOTP);

// Admin Refresh Token (public - verifies token internally)
router.post('/refresh', refreshToken);

// Admin logout (protected)
router.post('/logout', authenticate, requireAdmin, adminLogout);

// Admin Security (Password Change)
router.post('/change-password/initiate', authenticate, requireAdmin, initiateChangePassword);
router.post('/change-password/verify', authenticate, requireAdmin, verifyChangePassword);

// Dashboard stats (admin only)
router.get('/dashboard/stats', authenticate, requireAdmin, getDashboardStats);

// Analytics (admin only)
router.get('/analytics', authenticate, requireAdmin, requireFullAdmin, getAnalytics);

// User management (admin only)
router.get('/customers', authenticate, requireAdmin, getAllUsers);
router.patch('/users/:id/toggle-status', authenticate, requireAdmin, toggleUserStatus);

// Admin Staff Management
router.get('/admins', authenticate, requireAdmin, requireSuperAdmin, getAllAdmins);
router.patch('/admins/:id/toggle-status', authenticate, requireAdmin, requireSuperAdmin, toggleAdminStatus);
router.delete('/admins/:id', authenticate, requireAdmin, requireSuperAdmin, deleteAdmin);

// Device management (admin only)
router.get('/devices', authenticate, requireAdmin, requireFullAdmin, getAllowedDevices);
router.post('/devices', authenticate, requireSuperAdminOrDeveloper, addAllowedDevice);
router.put('/devices/:id', authenticate, requireSuperAdminOrDeveloper, updateAllowedDevice);
router.delete('/devices/:id', authenticate, requireSuperAdminOrDeveloper, deleteAllowedDevice);

// Order management (admin only)
router.get('/orders', authenticate, requireAdmin, getAllOrders);
router.patch('/orders/:id', authenticate, requireAdmin, updateOrderStatus);

// Admin notifications (admin only)
router.get('/notifications', authenticate, requireAdmin, getAdminNotifications);
router.get('/notifications/unread-count', authenticate, requireAdmin, getUnreadCount);
router.put('/notifications/:id/read', authenticate, requireAdmin, markAsRead);
router.put('/notifications/mark-all-read', authenticate, requireAdmin, markAllAsRead);
router.delete('/notifications/:id', authenticate, requireAdmin, deleteNotification);

// Payment settings (admin only)
router.get('/payment-settings', authenticate, requireAdmin, getPaymentSettings);
router.put('/payment-settings', authenticate, requireAdmin, updatePaymentSettings);

// WhatsApp Management
import { sendManualWhatsAppMessage } from '../controllers/whatsappController';
router.post('/whatsapp/send', authenticate, requireAdmin, sendManualWhatsAppMessage);

// Maintenance
import { cleanupOrphanedFiles } from '../services/imageCleanupService';
router.post('/maintenance/cleanup-images', authenticate, requireAdmin, requireSuperAdminOrDeveloper, async (req, res) => {
    try {
        console.log('🧹 Manual cleanup triggered by admin...');
        await cleanupOrphanedFiles();
        res.status(200).json({ success: true, message: 'Cleanup process started/completed.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Cleanup failed' });
    }
});

export default router;
