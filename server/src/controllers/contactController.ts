import { Request, Response } from 'express';
import { Contact } from '../models/Contact';

export const submitContactForm = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, subject, message } = req.body;
        const ipAddress = req.ip || req.socket.remoteAddress || '0.0.0.0';

        if (!name || !email || !subject || !message) {
            res.status(400).json({
                success: false,
                message: 'Please provide all required fields',
            });
            return;
        }

        const newContact = await Contact.create({
            name,
            email,
            subject,
            message,
            ipAddress,
        });

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: {
                id: newContact._id,
            },
        });
    } catch (error) {
        console.error('Submit contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const messages = await Contact.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Contact.countDocuments();

        res.status(200).json({
            success: true,
            results: messages.length,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
            },
            data: messages,
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const getMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const message = await Contact.findById(req.params.id);

        if (!message) {
            res.status(404).json({
                success: false,
                message: 'Message not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: message,
        });
    } catch (error) {
        console.error('Get message error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const message = await Contact.findByIdAndDelete(req.params.id);

        if (!message) {
            res.status(404).json({
                success: false,
                message: 'Message not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Message deleted successfully',
        });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const message = await Contact.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true, runValidators: true }
        );

        if (!message) {
            res.status(404).json({
                success: false,
                message: 'Message not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: message,
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
