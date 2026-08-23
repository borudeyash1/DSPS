import express from 'express';
import { authenticate as protect } from '../middleware/auth';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification
} from '../controllers/notificationController';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getNotifications);
router.post('/', createNotification); // For manually testing or client-side triggers if needed
router.put('/mark-all-read', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;
