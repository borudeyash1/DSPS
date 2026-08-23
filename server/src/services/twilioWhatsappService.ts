import twilio from 'twilio';

// Twilio WhatsApp Service
class TwilioWhatsAppService {
    private client: any;
    private fromNumber: string;
    private isConfigured: boolean;

    constructor() {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        this.fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || '';

        this.isConfigured = !!(accountSid && authToken && this.fromNumber);

        if (this.isConfigured) {
            this.client = twilio(accountSid, authToken);
            console.log('✅ Twilio WhatsApp service initialized');
        } else {
            console.log('⚠️  Twilio WhatsApp not configured - set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER in .env');
        }
    }

    /**
     * Send WhatsApp message
     * @param to - Phone number in E.164 format (e.g., +919876543210)
     * @param message - Message text
     */
    async sendMessage(to: string, message: string): Promise<boolean> {
        if (!this.isConfigured) {
            console.log('⚠️  Twilio WhatsApp not configured, skipping message');
            return false;
        }

        try {
            // Ensure phone number is in E.164 format
            const formattedTo = this.formatPhoneNumber(to);
            const formattedFrom = this.formatWhatsAppNumber(this.fromNumber);

            console.log(`📤 Sending WhatsApp message to ${formattedTo}`);

            const result = await this.client.messages.create({
                body: message,
                from: formattedFrom,
                to: `whatsapp:${formattedTo}`
            });

            console.log(`✅ WhatsApp message sent successfully. SID: ${result.sid}`);
            return true;
        } catch (error: any) {
            console.error('❌ Failed to send WhatsApp message:', error.message);
            return false;
        }
    }

    /**
     * Send OTP via WhatsApp
     * @param phoneNumber - Phone number in any format
     * @param otp - OTP code
     * @param userName - User's name (optional)
     */
    async sendOTP(phoneNumber: string, otp: string, userName?: string): Promise<boolean> {
        const greeting = userName ? `Hello ${userName}` : 'Hello';
        const message = `${greeting},\n\nYour Botam Apparels verification code is: *${otp}*\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this code, please ignore this message.`;

        return this.sendMessage(phoneNumber, message);
    }

    /**
     * Send order confirmation via WhatsApp
     * @param phoneNumber - Phone number
     * @param orderDetails - Order information
     */
    async sendOrderConfirmation(phoneNumber: string, orderDetails: {
        orderId: string;
        totalAmount: number;
        items: number;
    }): Promise<boolean> {
        const message = `🎉 *Order Confirmed!*\n\nOrder ID: ${orderDetails.orderId}\nItems: ${orderDetails.items}\nTotal: ₹${orderDetails.totalAmount}\n\nThank you for shopping with Botam Apparels!\n\nTrack your order: https://ecom.sartthi.com/orders/${orderDetails.orderId}`;

        return this.sendMessage(phoneNumber, message);
    }

    /**
     * Format phone number to E.164 format
     * @param phoneNumber - Phone number in any format
     */
    private formatPhoneNumber(phoneNumber: string): string {
        // Remove all non-digit characters
        let cleaned = phoneNumber.replace(/\D/g, '');

        // If number doesn't start with country code, assume India (+91)
        if (!cleaned.startsWith('91') && cleaned.length === 10) {
            cleaned = '91' + cleaned;
        }

        return '+' + cleaned;
    }

    /**
     * Format WhatsApp number for Twilio
     * @param phoneNumber - Phone number
     */
    private formatWhatsAppNumber(phoneNumber: string): string {
        const formatted = this.formatPhoneNumber(phoneNumber);
        return `whatsapp:${formatted}`;
    }

    /**
     * Check if service is configured
     */
    isReady(): boolean {
        return this.isConfigured;
    }
}

// Export singleton instance
export const twilioWhatsAppService = new TwilioWhatsAppService();
