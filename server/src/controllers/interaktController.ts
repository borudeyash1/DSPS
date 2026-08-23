import { Request, Response } from 'express';
import { interaktService, InteraktService } from '../services/interaktService';
import User from '../models/User';
import Order from '../models/Order';

/**
 * Interakt Controller
 * Handles all Interakt API operations
 */

/**
 * Sync user to Interakt
 * POST /api/interakt/users/sync
 */
export const syncUserToInterakt = async (req: Request, res: Response) => {
    try {
        const { userId, phoneNumber, countryCode, traits, tags } = req.body;

        if (!userId && !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Either userId or phoneNumber is required'
            });
        }

        const result = await interaktService.trackUser({
            userId,
            phoneNumber,
            countryCode: countryCode || '+91',
            traits,
            tags
        });

        if (result.success) {
            return res.status(200).json({
                success: true,
                message: 'User synced to Interakt successfully',
                data: result.data
            });
        } else {
            return res.status(400).json({
                success: false,
                message: result.error || 'Failed to sync user',
                data: result.data
            });
        }
    } catch (error: any) {
        console.error('Error syncing user to Interakt:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Track event in Interakt
 * POST /api/interakt/events/track
 */
export const trackEventToInterakt = async (req: Request, res: Response) => {
    try {
        const { userId, phoneNumber, countryCode, event, traits } = req.body;

        if (!event) {
            return res.status(400).json({
                success: false,
                message: 'Event name is required'
            });
        }

        if (!userId && !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Either userId or phoneNumber is required'
            });
        }

        const result = await interaktService.trackEvent({
            userId,
            phoneNumber,
            countryCode: countryCode || '+91',
            event,
            traits
        });

        if (result.success) {
            return res.status(200).json({
                success: true,
                message: 'Event tracked successfully',
                data: result.data
            });
        } else {
            return res.status(400).json({
                success: false,
                message: result.error || 'Failed to track event',
                data: result.data
            });
        }
    } catch (error: any) {
        console.error('Error tracking event to Interakt:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Send WhatsApp template message
 * POST /api/interakt/messages/send-template
 */
export const sendTemplateMessage = async (req: Request, res: Response) => {
    try {
        const {
            phoneNumber,
            countryCode,
            templateName,
            languageCode,
            bodyValues,
            headerValues,
            fileName,
            buttonValues,
            buttonPayload,
            callbackData,
            campaignId
        } = req.body;

        if (!phoneNumber || !templateName) {
            return res.status(400).json({
                success: false,
                message: 'phoneNumber and templateName are required'
            });
        }

        const result = await interaktService.sendTemplate({
            phoneNumber,
            countryCode: countryCode || '+91',
            templateName,
            languageCode,
            bodyValues,
            headerValues,
            fileName,
            buttonValues,
            buttonPayload,
            callbackData,
            campaignId
        });

        if (result.success) {
            return res.status(200).json({
                success: true,
                message: 'Template message sent successfully',
                messageId: result.messageId,
                data: result.data
            });
        } else {
            return res.status(400).json({
                success: false,
                message: result.error || 'Failed to send template',
                data: result.data
            });
        }
    } catch (error: any) {
        console.error('Error sending template message:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get contacts from Interakt
 * POST /api/interakt/contacts/retrieve
 */
export const getContacts = async (req: Request, res: Response) => {
    try {
        const { filters, offset, limit } = req.body;

        const result = await interaktService.getContacts({
            filters,
            offset,
            limit
        });

        if (result.success) {
            return res.status(200).json({
                success: true,
                message: 'Contacts retrieved successfully',
                contacts: result.contacts,
                hasNextPage: result.hasNextPage,
                data: result.data
            });
        } else {
            return res.status(400).json({
                success: false,
                message: result.error || 'Failed to retrieve contacts',
                data: result.data
            });
        }
    } catch (error: any) {
        console.error('Error retrieving contacts:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Assign chat to agent
 * POST /api/interakt/chats/assign
 */
export const assignChatToAgent = async (req: Request, res: Response) => {
    try {
        const { userPhoneNumber, agentEmail, wcId } = req.body;

        if (!userPhoneNumber || !agentEmail || !wcId) {
            return res.status(400).json({
                success: false,
                message: 'userPhoneNumber, agentEmail, and wcId are required'
            });
        }

        const result = await interaktService.assignChat({
            userPhoneNumber,
            agentEmail,
            wcId
        });

        if (result.success) {
            return res.status(200).json({
                success: true,
                message: 'Chat assigned successfully',
                data: result.data
            });
        } else {
            return res.status(400).json({
                success: false,
                message: result.error || 'Failed to assign chat',
                data: result.data
            });
        }
    } catch (error: any) {
        console.error('Error assigning chat:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Webhook handler for Interakt
 * POST /api/interakt/webhooks
 */
export const handleWebhook = async (req: Request, res: Response) => {
    try {
        const signature = req.headers['interakt-signature'] as string;
        const payload = JSON.stringify(req.body);
        const secretKey = process.env.INTERAKT_WEBHOOK_SECRET || process.env.INTERAKT_SECRET_KEY || '';

        // Verify webhook signature
        const isValid = InteraktService.verifyWebhook(payload, signature, secretKey);

        if (!isValid) {
            console.error('❌ Invalid webhook signature');
            return res.status(401).json({
                success: false,
                message: 'Invalid signature'
            });
        }

        console.log('✅ Webhook verified successfully');
        console.log('Webhook type:', req.body.type);
        console.log('Webhook data:', JSON.stringify(req.body, null, 2));

        // Process webhook based on type
        const webhookType = req.body.type;

        switch (webhookType) {
            case 'message_api_sent':
            case 'message_campaign_sent':
                console.log('📤 Message sent:', req.body.data?.message?.id);
                break;

            case 'message_api_delivered':
            case 'message_campaign_delivered':
                console.log('✅ Message delivered:', req.body.data?.message?.id);
                break;

            case 'message_api_read':
            case 'message_campaign_read':
                console.log('👁️ Message read:', req.body.data?.message?.id);
                break;

            case 'message_api_failed':
            case 'message_campaign_failed':
                console.log('❌ Message failed:', req.body.data?.message?.channel_failure_reason);
                break;

            case 'message_api_clicked':
                console.log('🖱️ Button clicked:', req.body.data?.message?.meta_data);
                break;

            case 'message_received':
                console.log('📥 Message received from customer:', req.body.data?.customer?.channel_phone_number);
                // You can process incoming messages here
                break;

            case 'workflow_response_update':
                console.log('🔄 Workflow response updated');
                break;

            default:
                console.log('ℹ️ Unknown webhook type:', webhookType);
        }

        // Always respond with 200 OK within 3 seconds
        return res.status(200).json({
            success: true,
            message: 'Webhook received'
        });

    } catch (error: any) {
        console.error('Error processing webhook:', error);
        // Still return 200 to prevent retries
        return res.status(200).json({
            success: false,
            message: 'Webhook processed with errors'
        });
    }
};

/**
 * Sync all users to Interakt
 * POST /api/interakt/users/sync-all
 */
export const syncAllUsersToInterakt = async (req: Request, res: Response) => {
    try {
        const users = await User.find({ phone: { $exists: true, $ne: '' } });

        let successCount = 0;
        let failCount = 0;
        const errors: any[] = [];

        for (const user of users) {
            try {
                const phoneData = InteraktService.formatPhoneNumber(user.phone as string);

                const result = await interaktService.trackUser({
                    userId: user._id.toString(),
                    phoneNumber: phoneData.phoneNumber,
                    countryCode: phoneData.countryCode,
                    traits: {
                        name: user.fullName,
                        email: user.email || '',
                        whatsapp_opted_in: true,
                        created_at: user.createdAt
                    }
                });

                if (result.success) {
                    successCount++;
                } else {
                    failCount++;
                    errors.push({ userId: user._id, error: result.error });
                }

                // Rate limiting: wait 200ms between requests (max 300/min for Growth plan)
                await new Promise(resolve => setTimeout(resolve, 200));

            } catch (error: any) {
                failCount++;
                errors.push({ userId: user._id, error: error.message });
            }
        }

        return res.status(200).json({
            success: true,
            message: 'User sync completed',
            stats: {
                total: users.length,
                success: successCount,
                failed: failCount
            },
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error: any) {
        console.error('Error syncing all users:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Send template to contact (Simplified)
 * POST /api/interakt/messages/send-to-contact
 */
export const sendTemplateToContact = async (req: Request, res: Response) => {
    try {
        const {
            phoneNumber,
            userName,
            templateType,
            orderNumber,
            amount,
            variables
        } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'phoneNumber is required'
            });
        }

        // Format phone number
        const phoneData = InteraktService.formatPhoneNumber(phoneNumber);

        // Determine template and variables
        const templateName = process.env.INTERAKT_TEMPLATE_ORDER_PLACED || 'order_placed_prepaid_woocommerce';
        let bodyValues: string[] = [];

        if (variables && Array.isArray(variables)) {
            bodyValues = variables;
        } else {
            // Auto-generate based on provided data
            const name = userName || 'Customer';
            const order = orderNumber || 'N/A';
            const amt = amount || '0';
            bodyValues = [name, order, amt];
        }

        console.log(`📤 Sending template to ${phoneData.fullPhoneNumber}`);
        console.log(`   Template: ${templateName}`);
        console.log(`   Variables: ${JSON.stringify(bodyValues)}`);

        const result = await interaktService.sendTemplate({
            phoneNumber: phoneData.phoneNumber,
            countryCode: phoneData.countryCode,
            templateName,
            languageCode: 'en',
            bodyValues,
            callbackData: JSON.stringify({
                templateType: templateType || 'custom',
                sentAt: new Date().toISOString()
            })
        });

        if (result.success) {
            return res.status(200).json({
                success: true,
                message: 'Template sent successfully',
                messageId: result.messageId,
                data: result.data
            });
        } else {
            return res.status(400).json({
                success: false,
                message: result.error || 'Failed to send template',
                data: result.data
            });
        }
    } catch (error: any) {
        console.error('Error sending template to contact:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Send template to multiple contacts
 * POST /api/interakt/messages/send-bulk
 */
export const sendBulkTemplates = async (req: Request, res: Response) => {
    try {
        const { contacts, templateType, templateName, defaultVariables } = req.body;

        if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'contacts array is required'
            });
        }

        const template = templateName || process.env.INTERAKT_TEMPLATE_ORDER_PLACED || 'order_placed_prepaid_woocommerce';
        const results: any[] = [];
        let successCount = 0;
        let failCount = 0;

        console.log(`📤 Sending template to ${contacts.length} contacts...`);

        for (const contact of contacts) {
            try {
                const phoneData = InteraktService.formatPhoneNumber(contact.phoneNumber);

                // Use contact-specific variables or defaults
                let bodyValues = contact.variables || defaultVariables || [
                    contact.userName || 'Customer',
                    contact.orderNumber || 'N/A',
                    contact.amount || '0'
                ];

                const result = await interaktService.sendTemplate({
                    phoneNumber: phoneData.phoneNumber,
                    countryCode: phoneData.countryCode,
                    templateName: template,
                    languageCode: 'en',
                    bodyValues
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
                    failCount++;
                }

                // Rate limiting: 200ms between messages
                await new Promise(resolve => setTimeout(resolve, 200));

            } catch (error: any) {
                failCount++;
                results.push({
                    phoneNumber: contact.phoneNumber,
                    success: false,
                    error: error.message
                });
            }
        }

        console.log(`✅ Bulk send complete: ${successCount} succeeded, ${failCount} failed`);

        return res.status(200).json({
            success: true,
            message: 'Bulk send completed',
            stats: {
                total: contacts.length,
                success: successCount,
                failed: failCount
            },
            results
        });

    } catch (error: any) {
        console.error('Error sending bulk templates:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Add contact and create chat automatically
 * POST /api/interakt/contacts/add-with-chat
 */
export const addContactWithChat = async (req: Request, res: Response) => {
    try {
        const { phoneNumber, userName, countryCode } = req.body;

        if (!phoneNumber || !userName) {
            return res.status(400).json({
                success: false,
                message: 'phoneNumber and userName are required'
            });
        }

        const phoneData = InteraktService.formatPhoneNumber(phoneNumber);
        const firstName = userName.split(' ')[0];

        // Step 1: Add contact
        const userResult = await interaktService.trackUser({
            phoneNumber: phoneData.phoneNumber,
            countryCode: phoneData.countryCode,
            traits: {
                name: userName,
                whatsapp_opted_in: true,
                source: 'New Chat',
                added_at: new Date().toISOString()
            }
        });

        if (!userResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to add contact',
                error: userResult.error
            });
        }

        // Step 2: Create chat by sending message
        const messageResult = await interaktService.sendTemplate({
            phoneNumber: phoneData.phoneNumber,
            countryCode: phoneData.countryCode,
            templateName: process.env.INTERAKT_TEMPLATE_ORDER_PLACED || 'order_placed_prepaid_woocommerce',
            languageCode: 'en',
            bodyValues: [firstName, 'WELCOME', '0']
        });

        return res.status(200).json({
            success: true,
            message: messageResult.success ? 'Contact added and chat created' : 'Contact added, chat needs manual creation',
            contactAdded: true,
            chatCreated: messageResult.success,
            messageId: messageResult.messageId,
            phoneNumber: phoneData.fullPhoneNumber
        });

    } catch (error: any) {
        console.error('Error adding contact with chat:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

