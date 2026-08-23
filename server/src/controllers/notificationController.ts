import { Request, Response } from 'express';
import Notification from '../models/Notification';

// Get all notifications for the logged-in user
export const getNotifications = async (req: any, res: Response) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 notifications

        const unreadCount = await Notification.countDocuments({
            user: req.user._id,
            isRead: false,
        });

        res.status(200).json({
            success: true,
            data: notifications,
            unreadCount,
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
        });
    }
};

// Mark a single notification as read
export const markAsRead = async (req: any, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, user: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: notification,
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
        });
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req: any, res: Response) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { isRead: true }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read',
        });
    }
};

// Create a notification (Internal use mostly, but exposed if needed)
export const createNotification = async (req: any, res: Response) => {
    try {
        const { type, title, message, metadata } = req.body;

        const notification = await Notification.create({
            user: req.user._id,
            type,
            title,
            message,
            metadata,
        });

        res.status(201).json({
            success: true,
            data: notification,
        });
    } catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create notification',
        });
    }
};

// Delete a notification
export const deleteNotification = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        await Notification.findOneAndDelete({ _id: id, user: req.user._id });

        res.status(200).json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification'
        });
    }
}
