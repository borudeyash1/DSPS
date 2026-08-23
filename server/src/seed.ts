import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User';
import Admin from './models/Admin';

dotenv.config();

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('✅ Connected to MongoDB');

        // Create your user account
        const userEmail = 'borudeyash12@gmail.com';
        const userPassword = 'Yash@123';

        // Check if user already exists
        const existingUser = await User.findOne({ email: userEmail });

        if (!existingUser) {
            // Updated: Pass plain password, let User model pre-save hook hash it
            // const hashedPassword = await bcrypt.hash(userPassword, 10);

            const user = await User.create({
                fullName: 'Yash Borude',
                email: userEmail,
                password: userPassword, // Plain password
                isEmailVerified: true,
                isActive: true,
                shippingAddresses: [],
                wishlist: [],
                orderHistory: []
            });

            console.log('✅ User created:', user.email);
        } else {
            console.log('ℹ️  User already exists:', userEmail);
            // Optional: Update password if user exists to ensure it's correct
            // existingUser.password = userPassword;
            // await existingUser.save();
        }

        // Create admin account
        const adminEmail = 'admin@botamapparels.com';
        const adminPassword = 'Admin@123';

        const existingAdmin = await Admin.findOne({ email: adminEmail });

        if (!existingAdmin) {
            // Updated: Pass plain password, let Admin model pre-save hook hash it
            // const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

            const admin = await Admin.create({
                email: adminEmail,
                password: adminPassword, // Plain password
                role: 'super-admin',
                isActive: true
            });

            console.log('✅ Admin created:', admin.email);
        } else {
            console.log('ℹ️  Admin already exists:', adminEmail);
        }

        console.log('\n📋 Credentials:');
        console.log('User Email:', userEmail);
        console.log('User Password:', userPassword);
        console.log('\nAdmin Email:', adminEmail);
        console.log('Admin Password:', adminPassword);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
