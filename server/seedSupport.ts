import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Support from './src/models/Support';
import connectDB from './src/config/database';

dotenv.config();

const seedSupport = async () => {
    try {
        await connectDB();

        // Clear existing
        await Support.deleteMany({});

        // Create default
        await Support.create({
            phoneNumber: '+919175079745',
            email: 'support@botamapparels.com',
            hours: 'Mon-Sat, 9:00 AM - 7:00 PM',
            isActive: true
        });

        console.log('✅ Support contact seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedSupport();
