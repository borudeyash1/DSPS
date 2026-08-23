import express from 'express';
import { authenticate } from '../middleware/auth';
import User from '../models/User';
import Product from '../models/Product';
import { AuthenticatedRequest } from '../types';
import { Response } from 'express';

const router = express.Router();

// Get user's wishlist
export const getWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;

        const user = await User.findById(userId).populate('wishlist');

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: { wishlist: user.wishlist },
        });
    } catch (error: any) {
        console.error('Get wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Add product to wishlist
export const addToWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        const { productId } = req.body;

        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Product not found',
            });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        // Check if already in wishlist
        const isInWishlist = user.wishlist.some((id: any) => id.toString() === productId.toString());
        if (isInWishlist) {
            res.status(400).json({
                success: false,
                message: 'Product already in wishlist',
            });
            return;
        }

        // Add to wishlist
        user.wishlist.push(productId);
        await user.save();

        // Increment wishlist count on product
        await Product.findByIdAndUpdate(productId, {
            $inc: { wishlistCount: 1 },
        });

        res.status(200).json({
            success: true,
            message: 'Product added to wishlist',
            data: { wishlist: user.wishlist },
        });
    } catch (error: any) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Remove product from wishlist
export const removeFromWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        const { productId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        // Remove from wishlist
        user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
        await user.save();

        // Decrement wishlist count on product
        await Product.findByIdAndUpdate(productId, {
            $inc: { wishlistCount: -1 },
        });

        res.status(200).json({
            success: true,
            message: 'Product removed from wishlist',
            data: { wishlist: user.wishlist },
        });
    } catch (error: any) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Routes
router.get('/', authenticate, getWishlist);
router.post('/', authenticate, addToWishlist);
router.delete('/:productId', authenticate, removeFromWishlist);

export default router;
