import cron from 'node-cron';
import Notification from '../models/Notification';

/**
 * Cleanup notifications older than 2 days
 * Runs daily at midnight (00:00)
 */
export const startNotificationCleanupCron = () => {
    // Schedule task to run every day at midnight
    cron.schedule('0 0 * * *', async () => {
        try {
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

            const result = await Notification.deleteMany({
                createdAt: { $lt: twoDaysAgo }
            });

            console.log(`[CRON] Notification cleanup completed: Deleted ${result.deletedCount} notifications older than 2 days`);
        } catch (error) {
            console.error('[CRON] Error during notification cleanup:', error);
        }
    });

    console.log('✅ Notification cleanup cron job started (runs daily at midnight)');
};

/**
 * Manual cleanup function (can be called anytime)
 */
export const cleanupOldNotifications = async () => {
    try {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const result = await Notification.deleteMany({
            createdAt: { $lt: twoDaysAgo }
        });

        console.log(`[MANUAL] Notification cleanup: Deleted ${result.deletedCount} notifications`);
        return result.deletedCount;
    } catch (error) {
        console.error('[MANUAL] Error during notification cleanup:', error);
        throw error;
    }
};
