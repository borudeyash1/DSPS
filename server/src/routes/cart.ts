import express from 'express';
import { authenticate } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { Response } from 'express';

const router = express.Router();

// Cart is stored in localStorage on frontend, but we'll create endpoints for syncing

// Get cart (placeholder - cart is client-side)
export const getCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        // Cart is managed on client-side with localStorage
        // This endpoint can be used for future server-side cart implementation
        res.status(200).json({
            success: true,
            message: 'Cart is managed on client-side',
            data: { cart: [] },
        });
    } catch (error: any) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Routes
router.get('/', authenticate, getCart);

export default router;
