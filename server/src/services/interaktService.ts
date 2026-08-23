import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

/**
 * Comprehensive Interakt API Service
 * Implements all Interakt API functionalities based on official documentation
 * 
 * Features:
 * 1. User Track API - Create/Update users and their traits
 * 2. Event Track API - Record user events
 * 3. Contacts Retrieval API - Fetch contacts from Interakt
 * 4. Send WhatsApp Template API - Send template messages
 * 5. Chat Assignment API - Assign chats to agents
 * 6. Webhook Verification - Verify incoming webhooks
 */

interface InteraktConfig {
    secretKey: string;
    baseURL?: string;
}

interface UserTraits {
    [key: string]: string | number | boolean | Date | string[];
}

interface EventTraits {
    [key: string]: string | number | boolean | Date;
}

interface TemplateButton {
    [buttonIndex: string]: string[];
}

interface TemplatePayload {
    countryCode: string;
    phoneNumber: string;
    type: 'Template';
    callbackData?: string;
    campaignId?: string;
    template: {
        name: string;
        languageCode: string;
        headerValues?: string[];
        fileName?: string;
        bodyValues?: string[];
        buttonValues?: TemplateButton;
        buttonPayload?: TemplateButton;
    };
}

interface ContactFilter {
    trait: string;
    op: 'gt' | 'lt' | 'eq' | 'ne' | 'contains';
    val: string;
    supr_op?: 'and' | 'or';
}

export class InteraktService {
    private client: AxiosInstance;
    private secretKey: string;
    private baseURL: string;

    constructor(config: InteraktConfig) {
        this.secretKey = config.secretKey;
        this.baseURL = config.baseURL || 'https://api.interakt.ai/v1/public';

        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Authorization': `Basic ${this.secretKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * USER TRACK API
     * Create or update user details in Interakt
     * 
     * @param userId - Unique user identifier (optional if phoneNumber provided)
     * @param phoneNumber - User's phone number without country code
     * @param countryCode - Country code (e.g., "+91")
     * @param traits - User attributes (name, email, etc.)
     * @param tags - Optional tags to add to the user
     */
    async trackUser(params: {
        userId?: string;
        phoneNumber?: string;
        countryCode?: string;
        traits?: UserTraits;
        tags?: string[];
    }): Promise<{ success: boolean; error?: string; data?: any }> {
        try {
            if (!params.userId && !params.phoneNumber) {
                throw new Error('Either userId or phoneNumber must be provided');
            }

            const payload: any = {};

            if (params.userId) payload.userId = params.userId;
            if (params.phoneNumber) payload.phoneNumber = params.phoneNumber;
            if (params.countryCode) payload.countryCode = params.countryCode;
            if (params.traits) payload.traits = params.traits;
            if (params.tags) payload.tags = params.tags;

            console.log('📤 Tracking user in Interakt:', { userId: params.userId, phone: params.phoneNumber });

            const response = await this.client.post('/track/users/', payload);

            console.log('✅ User tracked successfully');
            return { success: true, data: response.data };
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message;
            console.error('❌ Failed to track user:', errorMsg);
            return { success: false, error: errorMsg, data: error.response?.data };
        }
    }

    /**
     * EVENT TRACK API
     * Record user events (e.g., OrderPlaced, CartAbandoned)
     * 
     * @param userId - User identifier (or use phoneNumber + countryCode)
     * @param event - Event name
     * @param traits - Event properties
     */
    async trackEvent(params: {
        userId?: string;
        phoneNumber?: string;
        countryCode?: string;
        event: string;
        traits?: EventTraits;
    }): Promise<{ success: boolean; error?: string; data?: any }> {
        try {
            if (!params.userId && !params.phoneNumber) {
                throw new Error('Either userId or phoneNumber must be provided');
            }

            const payload: any = {
                event: params.event
            };

            if (params.userId) payload.userId = params.userId;
            if (params.phoneNumber) payload.phoneNumber = params.phoneNumber;
            if (params.countryCode) payload.countryCode = params.countryCode;
            if (params.traits) payload.traits = params.traits;

            console.log(`📤 Tracking event "${params.event}" for user`);

            const response = await this.client.post('/track/events/', payload);

            console.log('✅ Event tracked successfully');
            return { success: true, data: response.data };
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message;
            console.error('❌ Failed to track event:', errorMsg);
            return { success: false, error: errorMsg, data: error.response?.data };
        }
    }

    /**
     * SEND WHATSAPP TEMPLATE API
     * Send WhatsApp template messages
     * 
     * @param phoneNumber - User's phone number (without country code)
     * @param countryCode - Country code (e.g., "+91")
     * @param templateName - Template code name from Interakt
     * @param languageCode - Template language (default: "en")
     * @param bodyValues - Values for template body variables
     * @param headerValues - Values for template header variables
     * @param buttonValues - Values for dynamic URL buttons
     * @param callbackData - Custom data to receive in webhooks
     * @param campaignId - Campaign ID for analytics tracking
     */
    async sendTemplate(params: {
        phoneNumber: string;
        countryCode: string;
        templateName: string;
        languageCode?: string;
        bodyValues?: string[];
        headerValues?: string[];
        fileName?: string;
        buttonValues?: TemplateButton;
        buttonPayload?: TemplateButton;
        callbackData?: string;
        campaignId?: string;
    }): Promise<{ success: boolean; error?: string; data?: any; messageId?: string }> {
        try {
            const payload: TemplatePayload = {
                countryCode: params.countryCode,
                phoneNumber: params.phoneNumber,
                type: 'Template',
                template: {
                    name: params.templateName,
                    languageCode: params.languageCode || 'en'
                }
            };

            if (params.headerValues) payload.template.headerValues = params.headerValues;
            if (params.fileName) payload.template.fileName = params.fileName;
            if (params.bodyValues) payload.template.bodyValues = params.bodyValues;
            if (params.buttonValues) payload.template.buttonValues = params.buttonValues;
            if (params.buttonPayload) payload.template.buttonPayload = params.buttonPayload;
            if (params.callbackData) payload.callbackData = params.callbackData;
            if (params.campaignId) payload.campaignId = params.campaignId;

            console.log(`📤 Sending template "${params.templateName}" to ${params.countryCode}${params.phoneNumber}`);

            const response = await this.client.post('/message/', payload);

            console.log(`✅ Template sent successfully. Message ID: ${response.data.id}`);
            return { 
                success: true, 
                data: response.data,
                messageId: response.data.id 
            };
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message;
            console.error('❌ Failed to send template:', errorMsg);
            return { success: false, error: errorMsg, data: error.response?.data };
        }
    }

    /**
     * CONTACTS RETRIEVAL API
     * Retrieve contacts from Interakt with filters
     * 
     * @param filters - Array of filter conditions
     * @param offset - Pagination offset (default: 0)
     * @param limit - Number of contacts to retrieve (max: 100)
     */
    async getContacts(params: {
        filters?: ContactFilter[];
        offset?: number;
        limit?: number;
    } = {}): Promise<{ success: boolean; error?: string; data?: any; contacts?: any[]; hasNextPage?: boolean }> {
        try {
            const offset = params.offset || 0;
            const limit = Math.min(params.limit || 100, 100);

            const url = `/apis/users/?offset=${offset}&limit=${limit}`;
            const payload = params.filters ? { filters: params.filters } : {};

            console.log(`📤 Retrieving contacts (offset: ${offset}, limit: ${limit})`);

            const response = await this.client.post(url, payload);

            console.log(`✅ Retrieved ${response.data.users?.length || 0} contacts`);
            return {
                success: true,
                data: response.data,
                contacts: response.data.users,
                hasNextPage: response.data.has_next_page
            };
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message;
            console.error('❌ Failed to retrieve contacts:', errorMsg);
            return { success: false, error: errorMsg, data: error.response?.data };
        }
    }

    /**
     * CHAT ASSIGNMENT API
     * Assign a chat to a specific agent
     * 
     * @param userPhoneNumber - User's phone number with country code (e.g., "919876543210")
     * @param agentEmail - Agent's email address
     * @param wcId - WhatsApp Cloud ID
     */
    async assignChat(params: {
        userPhoneNumber: string;
        agentEmail: string;
        wcId: string;
    }): Promise<{ success: boolean; error?: string; data?: any }> {
        try {
            const payload = {
                user_phone_number: params.userPhoneNumber,
                agent_email: params.agentEmail,
                wc_id: params.wcId
            };

            console.log(`📤 Assigning chat for ${params.userPhoneNumber} to ${params.agentEmail}`);

            const response = await this.client.post('/assignment/', payload);

            console.log('✅ Chat assigned successfully');
            return { success: true, data: response.data };
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message;
            console.error('❌ Failed to assign chat:', errorMsg);
            return { success: false, error: errorMsg, data: error.response?.data };
        }
    }

    /**
     * WEBHOOK VERIFICATION
     * Verify webhook signature from Interakt
     * 
     * @param payload - Raw request body (stringified JSON)
     * @param signature - Interakt-Signature header value
     * @param secretKey - Your webhook secret key
     */
    static verifyWebhook(payload: string, signature: string, secretKey: string): boolean {
        try {
            const generatedSignature = 'sha256=' + crypto
                .createHmac('sha256', secretKey)
                .update(payload)
                .digest('hex');

            return generatedSignature === signature;
        } catch (error) {
            console.error('❌ Webhook verification failed:', error);
            return false;
        }
    }

    /**
     * UTILITY: Format phone number for Interakt
     * Removes all non-digit characters and ensures proper format
     */
    static formatPhoneNumber(phoneNumber: string, defaultCountryCode: string = '91'): {
        countryCode: string;
        phoneNumber: string;
        fullPhoneNumber: string;
    } {
        // Remove all non-digit characters
        let cleaned = phoneNumber.replace(/\D/g, '');

        // If starts with +, it's already been cleaned
        if (phoneNumber.startsWith('+')) {
            cleaned = phoneNumber.substring(1).replace(/\D/g, '');
        }

        let countryCode = defaultCountryCode;
        let number = cleaned;

        // If number is 10 digits, assume it needs country code
        if (cleaned.length === 10) {
            number = cleaned;
        } else if (cleaned.length > 10) {
            // Extract country code (assuming 2-3 digit country code)
            if (cleaned.startsWith('91') && cleaned.length === 12) {
                countryCode = '91';
                number = cleaned.substring(2);
            } else if (cleaned.length === 12) {
                countryCode = cleaned.substring(0, 2);
                number = cleaned.substring(2);
            } else if (cleaned.length === 13) {
                countryCode = cleaned.substring(0, 3);
                number = cleaned.substring(3);
            }
        }

        return {
            countryCode: `+${countryCode}`,
            phoneNumber: number,
            fullPhoneNumber: `${countryCode}${number}`
        };
    }

    /**
     * Check if service is properly configured
     */
    isConfigured(): boolean {
        return !!this.secretKey;
    }
}

// Export singleton instance
export const interaktService = new InteraktService({
    secretKey: process.env.INTERAKT_SECRET_KEY || ''
});
