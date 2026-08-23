import express from 'express';
import {
    createOrder,
    getUserOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
} from '../controllers/orderController';
import {
    createHDFCOrderForPayment,
    verifyHDFCPayment,
    getPaymentSettingsForCheckout,
    handleHDFCCallback
} from '../controllers/paymentController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Admin routes (must be before :id route to avoid conflict)
router.get('/all', authenticate, requireAdmin, getAllOrders);

// User routes (authentication required - login at checkout)
router.post('/', authenticate, createOrder);
router.get('/', authenticate, getUserOrders);  // Get user's own orders
router.get('/:id', authenticate, getOrderById);
router.delete('/:id', authenticate, cancelOrder); // User can cancel their own order

// Payment routes
router.get('/payment/settings', getPaymentSettingsForCheckout); // Public - for checkout page
router.post('/payment/create-hdfc-order', authenticate, createHDFCOrderForPayment);
router.post('/payment/verify', authenticate, verifyHDFCPayment);
router.post('/payment/hdfc-callback', handleHDFCCallback); // Public callback route



export default router;
