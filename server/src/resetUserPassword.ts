import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

const resetUserPassword = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('✅ Connected to MongoDB');

        const email = 'borudeyash12@gmail.com';
        const newPassword = 'Yash@123';

        console.log(`🔍 Finding user: ${email}`);
        const user = await User.findOne({ email });

        if (!user) {
            console.error('❌ User not found!');
            process.exit(1);
        }

        console.log('🔑 Setting new password (will be hashed by model hook)...');
        // DON'T hash manually here because the User model pre-save hook will do it!
        user.password = newPassword;

        console.log('💾 Updating user...');
        user.isActive = true;
        user.isEmailVerified = true;
        await user.save();

        console.log('✅ User Password Reset Successfully!');
        console.log('--------------------------------');
        console.log(`📧 Email:    ${email}`);
        console.log(`🔐 Password: ${newPassword}`);
        console.log('--------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting user password:', error);
        process.exit(1);
    }
};

resetUserPassword();
