import { interaktWhatsAppService } from './interaktWhatsappService';

/**
 * Send WhatsApp notifications using Interakt Templates.
 * This checks if the user has a phone number.
 */

// Define template names - using verified Interakt templates
const TEMPLATES = {
    ORDER_PLACED: process.env.INTERAKT_TEMPLATE_ORDER_PLACED || 'order_confirmation_74',
    ORDER_SHIPPED: process.env.INTERAKT_TEMPLATE_ORDER_SHIPPED || 'shipping_update_po',
    ORDER_DELIVERED: process.env.INTERAKT_TEMPLATE_ORDER_DELIVERED || 'thank_you_message_9z',
    ORDER_CANCELLED: process.env.INTERAKT_TEMPLATE_ORDER_CANCELLED || 'order_confirmation_74', // Using order confirmation as fallback
    OUT_FOR_DELIVERY: process.env.INTERAKT_TEMPLATE_OUT_FOR_DELIVERY || 'shipping_update_po' // Using shipping update as fallback
};

console.log('📋 Interakt Templates Configured:', TEMPLATES);

export const sendWhatsAppNotification = async (data: any) => {
    try {
        if (!data.userPhone) {
            console.log('⚠️ WhatsApp notification skipped: No phone number provided');
            return;
        }

        const phone = data.userPhone;
        const name = data.fullName?.split(' ')[0] || 'Customer'; // First name only
        const orderNumber = data.order?.orderNumber || data.orderId || 'N/A';

        console.log(`📱 Processing WhatsApp notification (${data.type}) for ${phone}`);

        let templateName = '';
        let bodyValues: string[] = [];
        let fallbackMessage = '';

        switch (data.type) {
            case 'order_placed':
                templateName = TEMPLATES.ORDER_PLACED;
                // order_confirmation_74 template: only needs {{1}} = order number
                bodyValues = [orderNumber];
                fallbackMessage = `Hi ${name}, your order ${orderNumber} has been placed successfully! Thank you for shopping with Botam Apparels.`;
                break;
            case 'order_shipped':
                templateName = TEMPLATES.ORDER_SHIPPED;
                // shipping_update_po uses: {{1}} = order number, {{2}} = delivery date
                const deliveryDate = data.order?.estimatedDelivery || 'soon';
                const trackingNumber = data.order?.trackingNumber || '';
                bodyValues = [orderNumber, deliveryDate];
                fallbackMessage = `Hi ${name}, your order ${orderNumber} has been shipped! ${trackingNumber ? `Tracking: ${trackingNumber}` : 'You will receive it soon.'}`;
                break;

            case 'out_for_delivery':
                templateName = TEMPLATES.OUT_FOR_DELIVERY;
                // Using shipping update template with OTP
                const otp = data.otp || '';
                bodyValues = [orderNumber, otp ? `Your delivery OTP is: ${otp}` : 'Your order is out for delivery'];
                fallbackMessage = `Hi ${name}, your order ${orderNumber} is out for delivery! ${otp ? `Delivery OTP: ${otp}. Please share this with the delivery agent.` : ''}`;
                break;

            case 'order_delivered':
                templateName = TEMPLATES.ORDER_DELIVERED;
                // thank_you_message_9z - no variables needed
                bodyValues = [];
                fallbackMessage = `Hi ${name}, your order ${orderNumber} has been delivered! Thank you for shopping with us. We hope you love your purchase!`;
                break;

            case 'order_cancelled':
                templateName = TEMPLATES.ORDER_CANCELLED;
                // Using order_confirmation_74 as fallback: {{1}} = order number
                bodyValues = [orderNumber];
                fallbackMessage = `Hi ${name}, your order ${orderNumber} has been cancelled. If you have any questions, please contact our support team.`;
                break;

            default:
                console.log('⚠️ Unknown WhatsApp notification type:', data.type);
                return;
        }

        // Try sending Template Message (Preferred for business initiated)
        const templateResult = await interaktWhatsAppService.sendTemplateMessage(
            phone,
            templateName,
            'en',
            bodyValues
        );

        if (templateResult.success) {
            console.log(`✅ WhatsApp template (${templateName}) sent successfully to ${phone}`);
            console.log(`   Message ID: ${templateResult.data?.id}`);
        } else {
            // Fallback: If template doesn't exist or fails, try sending text
            // This assumes the user MIGHT have an active session
            console.log(`⚠️ Template failed (${templateResult.error}), falling back to text...`);

            if (fallbackMessage) {
                const textResult = await interaktWhatsAppService.sendMessage(phone, fallbackMessage);
                if (textResult.success) {
                    console.log(`✅ WhatsApp text message sent successfully to ${phone}`);
                } else {
                    console.log(`❌ Both template and text message failed for ${phone}`);
                }
            }
        }

    } catch (error) {
        console.error('❌ Failed to send WhatsApp notification:', error);
    }
};
