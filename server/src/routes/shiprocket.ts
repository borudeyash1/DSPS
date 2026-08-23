import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
    createShipment,
    checkServiceability,
    generateAWB,
    trackShipment,
    cancelShipment,
    generateLabel,
    requestPickup,
    getPickupLocations,
    getShiprocketOrders,
    updateDeliveryAddress,
    getWalletBalance
} from '../controllers/shiprocketController';
import {
    handleShiprocketWebhook,
    testWebhook
} from '../controllers/shiprocketWebhookController';

const router = express.Router();

// Webhook routes (no auth required - called by Shiprocket)
router.post('/webhook', handleShiprocketWebhook);
router.post('/webhook/test', testWebhook); // For testing

// Public routes
router.get('/track/:awbOrOrderId', trackShipment);
router.post('/serviceability', checkServiceability);

// Admin routes
router.post('/create-shipment', authenticate, requireAdmin, createShipment);
router.post('/generate-awb', authenticate, requireAdmin, generateAWB);
router.post('/cancel', authenticate, requireAdmin, cancelShipment);
router.post('/generate-label', authenticate, requireAdmin, generateLabel);
router.post('/request-pickup', authenticate, requireAdmin, requestPickup);
router.get('/pickup-locations', authenticate, requireAdmin, getPickupLocations);
router.get('/orders', authenticate, requireAdmin, getShiprocketOrders);
router.post('/update-address', authenticate, requireAdmin, updateDeliveryAddress);
router.get('/wallet-balance', authenticate, requireAdmin, getWalletBalance);

export default router;


