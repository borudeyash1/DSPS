import express from 'express';
import { submitContactForm, getMessages, getMessage, deleteMessage, markAsRead } from '../controllers/contactController';
import { contactLimiter } from '../middleware/rateLimiter';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Public route - Submit contact form with rate limiting
router.post('/', contactLimiter, submitContactForm);

// Admin routes - Protected
router.use(authenticate);
router.use(requireAdmin);

router.get('/', getMessages);
router.get('/:id', getMessage);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteMessage);

export default router;
