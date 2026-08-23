import express from 'express';
import {
    syncUserToInterakt,
    trackEventToInterakt,
    sendTemplateMessage,
    getContacts,
    assignChatToAgent,
    handleWebhook,
    syncAllUsersToInterakt,
    sendTemplateToContact,
    sendBulkTemplates,
    addContactWithChat
} from '../controllers/interaktController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * Interakt API Routes
 * All routes except webhook require admin authentication
 */

// User Management
router.post('/users/sync', authenticate, syncUserToInterakt);
router.post('/users/sync-all', authenticate, syncAllUsersToInterakt);

// Event Tracking
router.post('/events/track', authenticate, trackEventToInterakt);

// Messaging
router.post('/messages/send-template', authenticate, sendTemplateMessage);
router.post('/messages/send-to-contact', authenticate, sendTemplateToContact);
router.post('/messages/send-bulk', authenticate, sendBulkTemplates);

// Contacts
router.post('/contacts/retrieve', authenticate, getContacts);
router.post('/contacts/add-with-chat', authenticate, addContactWithChat);

// Chat Assignment
router.post('/chats/assign', authenticate, assignChatToAgent);

// Webhooks (no auth required - verified by signature)
router.post('/webhooks', handleWebhook);

export default router;

