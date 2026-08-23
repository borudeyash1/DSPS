import { Request, Response } from 'express';
import Coupon from '../models/Coupon';
import { AuthenticatedRequest } from '../types';

/**
 * Create a new coupon (Admin only)
 */
export const createCoupon = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { code, type, value, minOrderAmount, maxDiscountAmount, expirationDate, usageLimit } = req.body;

        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            res.status(400).json({ success: false, message: 'Coupon code already exists' });
            return;
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            type,
            value,
            minOrderAmount,
            maxDiscountAmount,
            expirationDate,
            usageLimit
        });

        res.status(201).json({
            success: true,
            message: 'Coupon created successfully',
            data: coupon
        });
    } catch (error: any) {
        console.error('Create coupon error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to create coupon' });
    }
};

/**
 * Get all coupons (Admin only)
 */
export const getCoupons = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: coupons
        });
    } catch (error: any) {
        console.error('Get coupons error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch coupons' });
    }
};

/**
 * Delete a coupon (Admin only)
 */
export const deleteCoupon = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) {
            res.status(404).json({ success: false, message: 'Coupon not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error: any) {
        console.error('Delete coupon error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete coupon' });
    }
};

/**
 * Validate a coupon code (Public/User)
 */
export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code, orderAmount } = req.body;

        if (!code) {
            res.status(400).json({ success: false, message: 'Coupon code is required' });
            return;
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            res.status(404).json({ success: false, message: 'Invalid coupon code' });
            return;
        }

        // Check expiration
        if (coupon.expirationDate && new Date() > new Date(coupon.expirationDate)) {
            res.status(400).json({ success: false, message: 'Coupon has expired' });
            return;
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
            return;
        }

        // Check minimum order amount
        if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
            res.status(400).json({
                success: false,
                message: `Minimum order amount of ₹${coupon.minOrderAmount} required`
            });
            return;
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.type === 'fixed') {
            discountAmount = coupon.value;
        } else if (coupon.type === 'percentage') {
            discountAmount = (orderAmount * coupon.value) / 100;
            if (coupon.maxDiscountAmount) {
                discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
            }
        }

        // Ensure discount doesn't exceed order amount
        discountAmount = Math.min(discountAmount, orderAmount);

        res.status(200).json({
            success: true,
            data: {
                code: coupon.code,
                discountAmount,
                type: coupon.type,
                value: coupon.value
            }
        });
    } catch (error: any) {
        console.error('Validate coupon error:', error);
        res.status(500).json({ success: false, message: 'Failed to validate coupon' });
    }
};
