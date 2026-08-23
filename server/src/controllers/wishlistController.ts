import { Response } from 'express';
import User from '../models/User';
import Product from '../models/Product';
import { AuthenticatedRequest } from '../types';

// Get user's wishlist
export const getWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id;

        const user = await User.findById(userId).populate({
            path: 'wishlist',
            select: 'name price discountPrice images colorVariants category subcategory stock'
        });

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Wishlist retrieved successfully',
            data: user.wishlist
        });
    } catch (error: any) {
        console.error('Get wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Add product to wishlist
export const addToWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        console.log('🛒 [WISHLIST] Add to wishlist called');
        console.log('🛒 [WISHLIST] Request body:', req.body);
        console.log('🛒 [WISHLIST] User ID:', req.user?._id);
        
        const userId = req.user!._id;
        const { productId } = req.body;

        // Validate productId
        if (!productId) {
            console.log('🛒 [WISHLIST] Error: Product ID is missing');
            res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
            return;
        }

        console.log('🛒 [WISHLIST] Product ID:', productId);

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Product not found'
            });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        // Check if already in wishlist
        if (user.wishlist.includes(productId as any)) {
            res.status(400).json({
                success: false,
                message: 'Product already in wishlist'
            });
            return;
        }

        // Add to wishlist
        user.wishlist.push(productId as any);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Product added to wishlist',
            data: { productId }
        });
    } catch (error: any) {
        console.error('Add to wishlist error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            body: req.body
        });
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// Remove product from wishlist
export const removeFromWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id;
        const { productId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        // Remove from wishlist
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Product removed from wishlist',
            data: { productId }
        });
    } catch (error: any) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Clear wishlist
export const clearWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id;

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        user.wishlist = [];
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Wishlist cleared successfully'
        });
    } catch (error: any) {
        console.error('Clear wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
