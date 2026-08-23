import { interaktService } from './interaktService';

/**
 * Template Message Service
 * Handles sending WhatsApp template messages to contacts
 */

// Available templates (update these based on your Interakt dashboard)
export const TEMPLATES = {
    ORDER_PLACED: process.env.INTERAKT_TEMPLATE_ORDER_PLACED || 'order_placed_prepaid_woocommerce',
    ORDER_SHIPPED: process.env.INTERAKT_TEMPLATE_ORDER_SHIPPED || 'order_placed_prepaid_woocommerce',
    ORDER_DELIVERED: process.env.INTERAKT_TEMPLATE_ORDER_DELIVERED || 'order_placed_prepaid_woocommerce',
    ORDER_CANCELLED: process.env.INTERAKT_TEMPLATE_ORDER_CANCELLED || 'order_placed_prepaid_woocommerce',
    WELCOME: process.env.INTERAKT_TEMPLATE_WELCOME || 'order_placed_prepaid_woocommerce',
    CUSTOM: process.env.INTERAKT_TEMPLATE_CUSTOM || 'order_placed_prepaid_woocommerce'
};

interface SendTemplateParams {
    phoneNumber: string;
    templateType?: keyof typeof TEMPLATES;
    templateName?: string;
    variables?: string[];
    userName?: string;
    orderNumber?: string;
    amount?: string;
    customData?: any;
}

/**
 * Send template message to a contact
 * Automatically formats phone number and handles errors
 */
export async function sendTemplateToContact(params: SendTemplateParams): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
    data?: any;
}> {
    try {
        // Format phone number
    // @ts-ignore
        const phoneData = interaktService.constructor.formatPhoneNumber(params.phoneNumber);
        
        // Determine template name
        let templateName = params.templateName;
        if (!templateName && params.templateType) {
            templateName = TEMPLATES[params.templateType];
        }
        if (!templateName) {
            templateName = TEMPLATES.CUSTOM;
        }

        // Prepare body values based on template type
        let bodyValues: string[] = [];
        
        if (params.variables) {
            // Use provided variables
            bodyValues = params.variables;
        } else {
            // Auto-generate based on template type
            const name = params.userName || 'Customer';
            const orderNum = params.orderNumber || 'N/A';
            const amount = params.amount || '0';

            switch (params.templateType) {
                case 'ORDER_PLACED':
                case 'ORDER_SHIPPED':
                case 'ORDER_DELIVERED':
                case 'ORDER_CANCELLED':
                    bodyValues = [name, orderNum, amount];
                    break;
                case 'WELCOME':
                    bodyValues = [name];
                    break;
                default:
                    bodyValues = [name, orderNum, amount];
            }
        }

        console.log(`📤 Sending template "${templateName}" to ${phoneData.fullPhoneNumber}`);
        console.log(`   Variables: ${JSON.stringify(bodyValues)}`);

        // Send template
        const result = await interaktService.sendTemplate({
            phoneNumber: phoneData.phoneNumber,
            countryCode: phoneData.countryCode,
            templateName,
            languageCode: 'en',
            bodyValues,
            callbackData: JSON.stringify({
                templateType: params.templateType,
                customData: params.customData,
                sentAt: new Date().toISOString()
            })
        });

        if (result.success) {
            console.log(`✅ Template sent successfully. Message ID: ${result.messageId}`);
            return {
                success: true,
                messageId: result.messageId,
                data: result.data
            };
        } else {
            console.error(`❌ Failed to send template: ${result.error}`);
            return {
                success: false,
                error: result.error,
                data: result.data
            };
        }
    } catch (error: any) {
        console.error('❌ Error sending template:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Send template to multiple contacts
 */
export async function sendTemplateToMultipleContacts(
    contacts: Array<{ phoneNumber: string; userName?: string }>,
    templateParams: Omit<SendTemplateParams, 'phoneNumber' | 'userName'>
): Promise<{
    success: number;
    failed: number;
    results: Array<{ phoneNumber: string; success: boolean; messageId?: string; error?: string }>;
}> {
    const results: Array<{ phoneNumber: string; success: boolean; messageId?: string; error?: string }> = [];
    let successCount = 0;
    let failedCount = 0;

    console.log(`📤 Sending template to ${contacts.length} contacts...`);

    for (const contact of contacts) {
        const result = await sendTemplateToContact({
            ...templateParams,
            phoneNumber: contact.phoneNumber,
            userName: contact.userName
        });

        results.push({
            phoneNumber: contact.phoneNumber,
            success: result.success,
            messageId: result.messageId,
            error: result.error
        });

        if (result.success) {
            successCount++;
        } else {
            failedCount++;
        }

        // Rate limiting: wait 200ms between messages (max 300/min for Growth plan)
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`✅ Bulk send complete: ${successCount} succeeded, ${failedCount} failed`);

    return {
        success: successCount,
        failed: failedCount,
        results
    };
}

/**
 * Send order confirmation template
 */
export async function sendOrderConfirmation(
    phoneNumber: string,
    userName: string,
    orderNumber: string,
    amount: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return sendTemplateToContact({
        phoneNumber,
        templateType: 'ORDER_PLACED',
        userName,
        orderNumber,
        amount
    });
}

/**
 * Send order shipped template
 */
export async function sendOrderShipped(
    phoneNumber: string,
    userName: string,
    orderNumber: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return sendTemplateToContact({
        phoneNumber,
        templateType: 'ORDER_SHIPPED',
        userName,
        orderNumber
    });
}

/**
 * Send welcome message template
 */
export async function sendWelcomeMessage(
    phoneNumber: string,
    userName: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return sendTemplateToContact({
        phoneNumber,
        templateType: 'WELCOME',
        userName
    });
}

/**
 * Send custom template with specific variables
 */
export async function sendCustomTemplate(
    phoneNumber: string,
    templateName: string,
    variables: string[]
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return sendTemplateToContact({
        phoneNumber,
        templateName,
        variables
    });
}

/**
 * Check if template service is ready
 */
export function isTemplateServiceReady(): boolean {
    return interaktService.isConfigured();
}
