import express from 'express';
import { authenticate } from '../middleware/auth';
import {
    canReviewProduct,
    createReview,
    getProductReviews,
    getUserReviews,
    markReviewHelpful,
    getMyReviews,
    updateMyReview,
    deleteMyReview,
} from '../controllers/reviewController';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes (require authentication)
router.get('/can-review/:productId', authenticate, canReviewProduct);
router.post('/', authenticate, createReview);
router.get('/my-reviews', authenticate, getUserReviews);
router.get('/user/my-reviews', authenticate, getMyReviews); // New: Get all user's reviews
router.put('/user/:reviewId', authenticate, updateMyReview); // New: Update review
router.delete('/user/:reviewId', authenticate, deleteMyReview); // New: Delete review
router.post('/:reviewId/helpful', authenticate, markReviewHelpful);

export default router;
