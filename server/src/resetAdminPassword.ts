import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from './models/Admin';

dotenv.config();

const resetAdminPassword = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('✅ Connected to MongoDB');

        const email = 'yborude678@gmail.com';
        const newPassword = 'Yash@123';

        console.log(`🔍 Finding admin: ${email}`);
        const admin = await Admin.findOne({ email });

        if (!admin) {
            console.error('❌ Admin not found!');
            process.exit(1);
        }

        console.log('🔑 Setting new password (will be hashed by model hook)...');
        // DON'T hash manually here because the model pre-save hook will do it!
        // If we hash here, it gets hashed TWICE.
        admin.password = newPassword;

        console.log('💾 Updating admin...');
        admin.role = 'super-admin';
        admin.isActive = true;
        await admin.save();

        console.log('✅ Password Reset Successfully!');
        console.log('--------------------------------');
        console.log(`📧 Email:    ${email}`);
        console.log(`🔐 Password: ${newPassword}`);
        console.log('--------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting password:', error);
        process.exit(1);
    }
};

resetAdminPassword();
