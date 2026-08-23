import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { createCoupon, getCoupons, deleteCoupon, validateCoupon } from '../controllers/couponController';

const router = express.Router();

// Public routes
router.post('/validate', validateCoupon);

// Admin routes
router.post('/', authenticate, authorize('admin', 'super-admin', 'developer'), createCoupon);
router.get('/', authenticate, authorize('admin', 'super-admin', 'developer'), getCoupons);
router.delete('/:id', authenticate, authorize('admin', 'super-admin', 'developer'), deleteCoupon);

export default router;
