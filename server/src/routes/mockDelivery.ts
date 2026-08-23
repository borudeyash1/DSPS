import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
    initiateMockDelivery,
    generateDeliveryOtp,
    updateDeliveryStatus,
    getMockTracking,
    autoProgressOrder,
    bulkUpdateOrderStatus,
    getAllMockOrders
} from '../controllers/mockDeliveryController';

const router = express.Router();

// Public routes
router.get('/track/:trackingNumber', getMockTracking);

// Admin routes
router.get('/tracking/mock-all', authenticate, requireAdmin, getAllMockOrders);

// Admin routes
router.post('/initiate', authenticate, requireAdmin, initiateMockDelivery);
router.post('/generate-otp', authenticate, requireAdmin, generateDeliveryOtp); // New route
router.post('/update-status', authenticate, requireAdmin, updateDeliveryStatus);
router.post('/auto-progress', authenticate, requireAdmin, autoProgressOrder);
router.post('/bulk-update', authenticate, requireAdmin, bulkUpdateOrderStatus);

export default router;
