import mongoose from 'mongoose';
import Notification from '../models/Notification';
import dotenv from 'dotenv';

dotenv.config();

async function cleanupOldNotifications() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/botam-apparels');
        console.log('✅ Connected to MongoDB');

        // Calculate date 2 days ago
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        console.log(`\n🗓️  Deleting notifications older than: ${twoDaysAgo.toLocaleString()}`);

        // Count notifications before cleanup
        const totalBefore = await Notification.countDocuments();
        const oldNotifications = await Notification.countDocuments({
            createdAt: { $lt: twoDaysAgo }
        });

        console.log(`\n📊 Current Notification Count:`);
        console.log(`   Total: ${totalBefore}`);
        console.log(`   Older than 2 days: ${oldNotifications}`);

        // Delete old notifications
        const deleteResult = await Notification.deleteMany({
            createdAt: { $lt: twoDaysAgo }
        });

        console.log(`\n🗑️  Cleanup Results:`);
        console.log(`   ✅ Deleted ${deleteResult.deletedCount} old notifications`);

        // Verify final count
        const totalAfter = await Notification.countDocuments();
        console.log(`   ✅ Remaining notifications: ${totalAfter}`);
        console.log('\n✅ Notification cleanup completed successfully!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error cleaning up notifications:', error);
        process.exit(1);
    }
}

// Run the cleanup
cleanupOldNotifications();
