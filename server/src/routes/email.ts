import express from 'express';
import axios from 'axios';

const router = express.Router();

// n8n webhook URL for sending OTP emails
const N8N_EMAIL_WEBHOOK = process.env.N8N_EMAIL_WEBHOOK_URL || 'https://n8n-dev.sartthi.com/webhook/send-otp-email';

interface SendOTPRequest {
    email: string;
    otp: string;
    fullName: string;
    type: 'registration' | 'password-reset';
}

/**
 * POST /api/email/send-otp
 * Send OTP email via n8n Gmail workflow
 */
router.post('/send-otp', async (req: express.Request, res: express.Response) => {
    try {
        const { email, otp, fullName, type }: SendOTPRequest = req.body;

        // Validate required fields
        if (!email || !otp || !fullName || !type) {
            res.status(400).json({
                success: false,
                message: 'Missing required fields: email, otp, fullName, type'
            });
            return;
        }

        // Validate type
        if (type !== 'registration' && type !== 'password-reset') {
            res.status(400).json({
                success: false,
                message: 'Invalid type. Must be "registration" or "password-reset"'
            });
            return;
        }

        console.log(`📧 Sending ${type} OTP email to ${email} via n8n...`);

        // Call n8n webhook
        const response = await axios.post(N8N_EMAIL_WEBHOOK, {
            email,
            otp,
            fullName,
            type
        }, {
            timeout: 10000 // 10 second timeout
        });

        if (response.data.success) {
            console.log(`✅ OTP email sent successfully to ${email}`);
            res.status(200).json({
                success: true,
                message: 'OTP email sent successfully'
            });
        } else {
            throw new Error('n8n workflow returned failure');
        }

    } catch (error: any) {
        console.error('❌ Error sending OTP email via n8n:', error.message);

        // Return error to client
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP email',
            error: error.message
        });
    }
});

export default router;
