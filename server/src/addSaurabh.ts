import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Admin from './models/Admin';

dotenv.config();

const addSurajAccount = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('✅ Connected to MongoDB');

        const email = 'surajbagul240305@gmail.com';
        const password = 'Suraj@123';
        const fullName = 'Suraj Bagul';

        // Add as User
        console.log(`\n👤 Creating User Account...`);
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log('ℹ️  User already exists, updating password...');
            existingUser.password = password;
            existingUser.fullName = fullName;
            existingUser.isActive = true;
            existingUser.isEmailVerified = true;
            await existingUser.save();
            console.log('✅ User updated');
        } else {
            const user = await User.create({
                fullName,
                email,
                password, // Plain password - model hook will hash it
                isEmailVerified: true,
                isActive: true,
                shippingAddresses: [],
                wishlist: [],
                orderHistory: []
            });
            console.log('✅ User created:', user.email);
        }

        // Add as Admin
        console.log(`\n🔐 Creating Admin Account...`);
        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            console.log('ℹ️  Admin already exists, updating password...');
            existingAdmin.password = password;
            existingAdmin.role = 'admin';
            existingAdmin.isActive = true;
            await existingAdmin.save();
            console.log('✅ Admin updated');
        } else {
            const admin = await Admin.create({
                email,
                password, // Plain password - model hook will hash it
                role: 'admin',
                isActive: true
            });
            console.log('✅ Admin created:', admin.email);
        }

        console.log('\n📋 Suraj Account Created:');
        console.log('--------------------------------');
        console.log(`📧 Email:    ${email}`);
        console.log(`🔐 Password: ${password}`);
        console.log(`👤 Name:     ${fullName}`);
        console.log('--------------------------------');
        console.log('✅ User Login:  http://localhost:3000/login');
        console.log('✅ Admin Login: http://localhost:3000/my-admin/login');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding Suraj account:', error);
        process.exit(1);
    }
};

addSurajAccount();
