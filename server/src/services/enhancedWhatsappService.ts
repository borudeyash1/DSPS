import { interaktService, InteraktService } from './interaktService';

/**
 * Enhanced WhatsApp Notification Service
 * Uses comprehensive Interakt API for all WhatsApp communications
 */

// Template names from environment or defaults
const TEMPLATES = {
    ORDER_PLACED: process.env.INTERAKT_TEMPLATE_ORDER_PLACED || 'order_placed_prepaid_woocommerce',
    ORDER_SHIPPED: process.env.INTERAKT_TEMPLATE_ORDER_SHIPPED || 'order_placed_prepaid_woocommerce',
    ORDER_DELIVERED: process.env.INTERAKT_TEMPLATE_ORDER_DELIVERED || 'order_placed_prepaid_woocommerce',
    ORDER_CANCELLED: process.env.INTERAKT_TEMPLATE_ORDER_CANCELLED || 'order_placed_prepaid_woocommerce',
    OTP_VERIFICATION: process.env.INTERAKT_TEMPLATE_OTP || 'otp_verification',
    CART_ABANDONED: process.env.INTERAKT_TEMPLATE_CART_ABANDONED || 'cart_abandoned',
};

console.log('📋 WhatsApp Templates Configured:', TEMPLATES);

interface NotificationData {
    type: string;
    userPhone: string;
    fullName: string;
    email?: string;
    userId?: string;
    order?: any;
    orderId?: string;
    otp?: string;
    customData?: any;
}

/**
 * Send WhatsApp notification with automatic user tracking
 */
export const sendWhatsAppNotification = async (data: NotificationData): Promise<boolean> => {
    try {
        if (!data.userPhone) {
            console.log('⚠️ WhatsApp notification skipped: No phone number provided');
            return false;
        }

        if (!interaktService.isConfigured()) {
            console.log('⚠️ Interakt service not configured');
            return false;
        }

        // Format phone number
        const phoneData = InteraktService.formatPhoneNumber(data.userPhone);
        console.log(`📱 Processing WhatsApp notification (${data.type}) for ${phoneData.fullPhoneNumber}`);

        // Step 1: Track/Update user in Interakt
        await trackUserInInterakt(data, phoneData);

        // Step 2: Send appropriate template based on notification type
        const result = await sendTemplateByType(data, phoneData);

        // Step 3: Track event in Interakt
        if (result) {
            await trackEventInInterakt(data, phoneData);
        }

        return result;

    } catch (error) {
        console.error('❌ Failed to send WhatsApp notification:', error);
        return false;
    }
};

/**
 * Track or update user in Interakt
 */
async function trackUserInInterakt(data: NotificationData, phoneData: ReturnType<typeof InteraktService.formatPhoneNumber>) {
    try {
        const traits: any = {
            name: data.fullName,
            whatsapp_opted_in: true,
        };

        if (data.email) traits.email = data.email;
        if (data.order) {
            traits.last_order_id = data.order.orderNumber || data.orderId;
            traits.last_order_date = new Date().toISOString();
        }

        await interaktService.trackUser({
            userId: data.userId,
            phoneNumber: phoneData.phoneNumber,
            countryCode: phoneData.countryCode,
            traits,
        });

        console.log('✅ User tracked in Interakt');
    } catch (error) {
        console.error('⚠️ Failed to track user in Interakt:', error);
        // Don't fail the notification if user tracking fails
    }
}

/**
 * Send template message based on notification type
 */
async function sendTemplateByType(
    data: NotificationData,
    phoneData: ReturnType<typeof InteraktService.formatPhoneNumber>
): Promise<boolean> {
    const name = data.fullName.split(' ')[0]; // First name only
    const orderNumber = data.order?.orderNumber || data.orderId || '';

    let templateName = '';
    let bodyValues: string[] = [];

    switch (data.type) {
        case 'order_placed':
            templateName = TEMPLATES.ORDER_PLACED;
            // Template variables: {{1}} = customer name, {{2}} = order number, {{3}} = amount
            bodyValues = [
                name,
                orderNumber,
                data.order?.totalAmount?.toString() || '0'
            ];
            break;

        case 'order_shipped':
            templateName = TEMPLATES.ORDER_SHIPPED;
            const deliveryDate = data.order?.estimatedDelivery || 'soon';
            bodyValues = [name, orderNumber, deliveryDate];
            break;

        case 'order_delivered':
            templateName = TEMPLATES.ORDER_DELIVERED;
            bodyValues = [name, orderNumber];
            break;

        case 'order_cancelled':
            templateName = TEMPLATES.ORDER_CANCELLED;
            bodyValues = [name, orderNumber];
            break;

        case 'otp_verification':
            if (!data.otp) {
                console.error('❌ OTP not provided for OTP verification notification');
                return false;
            }
            templateName = TEMPLATES.OTP_VERIFICATION;
            bodyValues = [data.otp];
            break;

        case 'cart_abandoned':
            templateName = TEMPLATES.CART_ABANDONED;
            bodyValues = [name];
            break;

        default:
            console.log('⚠️ Unknown WhatsApp notification type:', data.type);
            return false;
    }

    // Send template message
    const result = await interaktService.sendTemplate({
        phoneNumber: phoneData.phoneNumber,
        countryCode: phoneData.countryCode,
        templateName,
        languageCode: 'en',
        bodyValues,
        callbackData: JSON.stringify({
            type: data.type,
            orderId: orderNumber,
            userId: data.userId,
        }),
    });

    if (result.success) {
        console.log(`✅ WhatsApp template (${templateName}) sent successfully`);
        return true;
    } else {
        console.error(`❌ Failed to send WhatsApp template: ${result.error}`);
        return false;
    }
}

/**
 * Track event in Interakt
 */
async function trackEventInInterakt(
    data: NotificationData,
    phoneData: ReturnType<typeof InteraktService.formatPhoneNumber>
) {
    try {
        let eventName = '';
        const eventTraits: any = {
            notification_type: data.type,
            sent_at: new Date().toISOString(),
        };

        switch (data.type) {
            case 'order_placed':
                eventName = 'OrderPlaced';
                if (data.order) {
                    eventTraits.order_number = data.order.orderNumber;
                    eventTraits.order_amount = data.order.totalAmount;
                    eventTraits.payment_method = data.order.paymentMethod;
                }
                break;

            case 'order_shipped':
                eventName = 'OrderShipped';
                if (data.order) {
                    eventTraits.order_number = data.order.orderNumber;
                    eventTraits.tracking_number = data.order.trackingNumber;
                }
                break;

            case 'order_delivered':
                eventName = 'OrderDelivered';
                if (data.order) {
                    eventTraits.order_number = data.order.orderNumber;
                }
                break;

            case 'order_cancelled':
                eventName = 'OrderCancelled';
                if (data.order) {
                    eventTraits.order_number = data.order.orderNumber;
                    eventTraits.cancellation_reason = data.order.cancellationReason;
                }
                break;

            case 'cart_abandoned':
                eventName = 'CartAbandoned';
                break;

            default:
                return; // Don't track unknown events
        }

        if (eventName) {
            await interaktService.trackEvent({
                userId: data.userId,
                phoneNumber: phoneData.phoneNumber,
                countryCode: phoneData.countryCode,
                event: eventName,
                traits: eventTraits,
            });

            console.log(`✅ Event "${eventName}" tracked in Interakt`);
        }
    } catch (error) {
        console.error('⚠️ Failed to track event in Interakt:', error);
        // Don't fail the notification if event tracking fails
    }
}

/**
 * Send OTP via WhatsApp
 */
export const sendWhatsAppOTP = async (
    phoneNumber: string,
    otp: string,
    userName?: string
): Promise<boolean> => {
    return sendWhatsAppNotification({
        type: 'otp_verification',
        userPhone: phoneNumber,
        fullName: userName || 'User',
        otp,
    });
};

/**
 * Send cart abandonment reminder
 */
export const sendCartAbandonmentReminder = async (
    phoneNumber: string,
    userName: string,
    userId?: string,
    cartData?: any
): Promise<boolean> => {
    return sendWhatsAppNotification({
        type: 'cart_abandoned',
        userPhone: phoneNumber,
        fullName: userName,
        userId,
        customData: cartData,
    });
};

/**
 * Check if WhatsApp service is ready
 */
export const isWhatsAppServiceReady = (): boolean => {
    return interaktService.isConfigured();
};
