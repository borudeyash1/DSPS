import { Request, Response } from 'express';
import User from '../models/User';
import Order from '../models/Order';
import Support from '../models/Support';

export const getN8nContext = async (req: Request, res: Response): Promise<void> => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            res.status(400).json({ success: false, message: 'Phone number is required' });
            return;
        }

        // 1. Find User
        // Sanitize phone number (remove +, spaces, dashes for flexible matching if needed, 
        // but for now we assume exact match or contains)
        // Adjust regex based on your phone number format strategy
        const user = await User.findOne({
            phone: { $regex: phoneNumber.replace('+', ''), $options: 'i' }
        });

        if (!user) {
            res.status(200).json({
                found: false,
                message: 'User not found',
                ai: {
                    allowed: true, // Guest users allowed basic Qs
                    currentUsage: 0,
                    remaining: 10
                }
            });
            return;
        }

        // 2. Check & Update Rate Limit
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let currentCount = user.aiInteractionCount || 0;
        const lastInteraction = user.lastAiInteraction ? new Date(user.lastAiInteraction) : new Date(0);
        lastInteraction.setHours(0, 0, 0, 0);

        if (lastInteraction < today) {
            // Reset if last interaction was before today
            currentCount = 0;
        }

        // Increment count (this endpoint implies an interaction is about to happen or happened)
        // Check if we should block
        const AI_DAILY_LIMIT = 10;
        const aiAllowed = currentCount < AI_DAILY_LIMIT;

        if (aiAllowed) {
            user.aiInteractionCount = currentCount + 1;
            user.lastAiInteraction = new Date();
            await user.save();
        }

        // 3. fetch Recent Orders
    // @ts-ignore
        const recentOrders = await Order.find({ user: user._id })
            .sort({ createdAt: -1 })
            .limit(3)
            .select('status totalAmount items trackingNumber createdAt');

        // 4. Fetch Support Contact
        const supportInfo = await Support.findOne({ isActive: true });

        // 5. Return Context
        res.status(200).json({
            found: true,
            user: {
                firstName: user.fullName ? user.fullName.split(' ')[0] : 'Guest',
                fullName: user.fullName,
                id: user._id
            },
            orders: recentOrders.map(order => ({
                id: order._id,
                status: order.status,
                total: order.totalAmount,
                items: order.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
                date: order.createdAt,
                tracking: order.trackingNumber || 'Not available'
            })),
            support: supportInfo ? {
                phone: supportInfo.phoneNumber,
                hours: supportInfo.hours
            } : {
                phone: '+919999999999', // Fallback
                hours: '10 AM - 6 PM'
            },
            ai: {
                allowed: aiAllowed,
                currentUsage: currentCount,
                remaining: Math.max(0, AI_DAILY_LIMIT - currentCount)
            }
        });

    } catch (error) {
        console.error('n8n context error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
