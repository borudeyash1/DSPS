import { Response } from 'express';
import Notification from '../models/Notification';
import { AuthenticatedRequest } from '../types';

// Get all admin notifications (paginated)
export const getAdminNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 20, type, read } = req.query;

        // Build filter for admin notifications
        const filter: any = { isAdminNotification: true };

        if (type) {
            filter.type = type;
        }

        if (read !== undefined) {
            filter.isRead = read === 'true';
        }

        const skip = (Number(page) - 1) * Number(limit);

        const notifications = await Notification.find(filter)
            .sort('-createdAt')
            .skip(skip)
            .limit(Number(limit));

        const total = await Notification.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Admin notifications retrieved successfully',
            data: notifications,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error: any) {
        console.error('Get admin notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get unread count
export const getUnreadCount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const count = await Notification.countDocuments({
            isAdminNotification: true,
            isRead: false
        });

        res.status(200).json({
            success: true,
            count
        });
    } catch (error: any) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Mark notification as read
export const markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const notification = await Notification.findById(id);

        if (!notification) {
            res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
            return;
        }

        if (!notification.isAdminNotification) {
            res.status(403).json({
                success: false,
                message: 'Not an admin notification'
            });
            return;
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: notification
        });
    } catch (error: any) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Mark all as read
export const markAllAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        await Notification.updateMany(
            { isAdminNotification: true, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error: any) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Delete notification
export const deleteNotification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const notification = await Notification.findById(id);

        if (!notification) {
            res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
            return;
        }

        if (!notification.isAdminNotification) {
            res.status(403).json({
                success: false,
                message: 'Not an admin notification'
            });
            return;
        }

        await notification.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error: any) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

