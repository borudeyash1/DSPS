import { Request, Response } from 'express';
import { interaktWhatsAppService } from '../services/interaktWhatsappService';
import User from '../models/User';

export const sendManualWhatsAppMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, message, phoneNumber } = req.body;

        if (!message) {
            res.status(400).json({
                success: false,
                message: 'Message content is required'
            });
            return;
        }

        let phoneToSend = phoneNumber;

        // If userId is provided, fetch user's phone
        if (userId && !phoneToSend) {
            const user = await User.findById(userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }
            phoneToSend = user.phone;
        }

        if (!phoneToSend) {
            res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
            return;
        }

        // Check if this is a template message or text message
        let result;
        if (req.body.type === 'template') {
            const { templateName, languageCode, bodyValues, headerValues } = req.body;
            console.log(`Sending template ${templateName} to ${phoneToSend}`);
            result = await interaktWhatsAppService.sendTemplateMessage(
                phoneToSend, 
                templateName, 
                languageCode || 'en', 
                bodyValues || [], 
                headerValues || []
            );
        } else {
            console.log(`Sending text message to ${phoneToSend}`);
            result = await interaktWhatsAppService.sendMessage(phoneToSend, message);
        }

        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'Message sent successfully',
                data: result.data
            });
        } else {
            console.log('WhatsApp send failed details:', result);
            res.status(500).json({
                success: false,
                message: `Failed to send message: ${result.error || 'Unknown error'}`,
                details: result.error
            });
        }

    } catch (error: any) {
        console.error('Send manual WhatsApp message error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
