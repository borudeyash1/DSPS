import axios from 'axios';

// Interakt WhatsApp Service
class InteraktWhatsAppService {
    private baseURL: string = 'https://api.interakt.ai/v1/public';

    // Get config dynamically to avoid initialization ordering issues
    private get secretKey(): string | undefined {
        return process.env.INTERAKT_SECRET_KEY;
    }

    private get isConfigured(): boolean {
        return !!process.env.INTERAKT_SECRET_KEY;
    }

    private get headers() {
        return {
            'Authorization': `Basic ${this.secretKey}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Send WhatsApp text message (Session Message)
     * Note: This only works if the user has messaged the business within the last 24 hours.
     * @param to - Phone number in E.164 format or 10 digit
     * @param message - Message text
     */
    async sendMessage(to: string, message: string): Promise<{ success: boolean; error?: string; data?: any }> {
        if (!this.isConfigured) {
            console.log('⚠️  Interakt WhatsApp not configured, skipping message');
            return { success: false, error: 'Service not configured (Missing INTERAKT_SECRET_KEY)' };
        }

        const formattedTo = this.formatPhoneNumber(to);
        const payload = {
            fullPhoneNumber: formattedTo,
            type: 'Text',
            data: {
                message: message
            }
        };

        try {
            console.log(`📤 Sending Interakt text message to ${formattedTo}`);
            const response = await axios.post(`${this.baseURL}/message/`, payload, {
                headers: this.headers
            });

            console.log(`✅ Interakt message sent successfully. ID: ${response.data.id}`);
            return { success: true, data: response.data };
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.response?.data?.result || error.message;
            console.error('❌ Failed to send Interakt message:', errorMsg);

            // Check if error is due to session expiry (common with text messages outside 24h window)
            // Interakt often returns specific codes or messages for this.
            // If so, we can't do much for a pure text message unless we switch to a template.

            return {
                success: false,
                error: errorMsg,
                data: error.response?.data
            };
        }
    }

    /**
     * Send Template Message
     * Required for business-initiated conversations.
     */
    async sendTemplateMessage(to: string, templateName: string, languageCode: string = 'en', bodyValues: string[] = [], headerValues: string[] = []): Promise<{ success: boolean; error?: string; data?: any }> {
        if (!this.isConfigured) {
            return { success: false, error: 'Service not configured' };
        }

        try {
            const formattedTo = this.formatPhoneNumber(to);
            console.log(`📤 Sending Interakt template ${templateName} to ${formattedTo}`);

            const payload = {
                fullPhoneNumber: formattedTo,
                type: 'Template',
                template: {
                    name: templateName,
                    languageCode: languageCode,
                    bodyValues: bodyValues,
                    headerValues: headerValues
                }
            };

            const response = await axios.post(`${this.baseURL}/message/`, payload, {
                headers: this.headers
            });

            console.log(`✅ Interakt template sent successfully. ID: ${response.data.id}`);
            return { success: true, data: response.data };
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.response?.data?.result || error.message;
            console.error('❌ Failed to send Interakt template:', errorMsg);
            return {
                success: false,
                error: errorMsg,
                data: error.response?.data
            };
        }
    }

    /**
     * Send OTP via WhatsApp
     * Assumes a template named 'otp_verification' exists (or similar).
     * Since we don't know the template, this might need adjustment.
     * Fallback to text if session exists for now, or user needs to configure template.
     */
    async sendOTP(phoneNumber: string, otp: string, userName?: string): Promise<boolean> {
        // TODO: Replace with actual template name when available
        // Example: await this.sendTemplateMessage(phoneNumber, 'otp_verification', 'en', [otp]);

        // For now, trying text message (only works for active sessions)
        const greeting = userName ? `Hello ${userName}` : 'Hello';
        const message = `${greeting},\n\nYour Botam Apparels verification code is: *${otp}*\n\nThis code will expire in 5 minutes.`;

        const result = await this.sendMessage(phoneNumber, message);
        return result.success;
    }

    /**
     * Format phone number to E.164 format (Interakt strictly needs fullPhoneNumber with country code)
     */
    private formatPhoneNumber(phoneNumber: string): string {
        let cleaned = phoneNumber.replace(/\D/g, '');

        // If number doesn't start with country code (assuming India 91 for 12 digits total or just length check)
        // If length is 10, add 91
        if (cleaned.length === 10) {
            cleaned = '91' + cleaned;
        }

        return '+' + cleaned;
    }

    isReady(): boolean {
        return this.isConfigured;
    }
}

export const interaktWhatsAppService = new InteraktWhatsAppService();
