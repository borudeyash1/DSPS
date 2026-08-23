import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from './models/Admin';
import AllowedDevice from './models/AllowedDevice';

dotenv.config();

const seedAdminAndDevice = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('✅ Connected to MongoDB');

        // Create admin account 1: yborude678@gmail.com
        const admin1Email = 'yborude678@gmail.com';
        const admin1Password = 'Yash@123';

        const existingAdmin1 = await Admin.findOne({ email: admin1Email });

        if (!existingAdmin1) {
            const hashedPassword = await bcrypt.hash(admin1Password, 10);

            const admin = await Admin.create({
                email: admin1Email,
                password: hashedPassword,
                role: 'super-admin',
                isActive: true
            });

            console.log('✅ Admin 1 created:', admin.email);
        } else {
            console.log('ℹ️  Admin 1 already exists:', admin1Email);
        }

        // Create admin account 2: admin@botamapparels.com
        const admin2Email = 'surajbagul240305@gmail.com';
        const admin2Password = 'Suraj@123';

        const existingAdmin2 = await Admin.findOne({ email: admin2Email });

        if (!existingAdmin2) {
            const hashedPassword = await bcrypt.hash(admin2Password, 10);

            const admin = await Admin.create({
                email: admin2Email,
                password: hashedPassword,
                role: 'super-admin',
                isActive: true
            });

            console.log('✅ Admin 2 created:', admin.email);
        } else {
            console.log('ℹ️  Admin 2 already exists:', admin2Email);
        }

        // Create a sample allowed device for testing
        const sampleDeviceId = 'sample-device-' + Date.now();
        const existingDevice = await AllowedDevice.findOne({ deviceName: 'Sample Admin Device' });

        if (!existingDevice) {
            const device = await AllowedDevice.create({
                deviceId: sampleDeviceId,
                deviceName: 'Sample Admin Device',
                deviceType: 'admin',
                platform: 'Windows',
                userAgent: 'Mozilla/5.0',
                notes: 'Sample device for testing. Replace with actual device ID.',
                addedBy: admin1Email,
                isActive: true
            });

            console.log('✅ Sample device created:', device.deviceName);
            console.log('📝 Device ID:', device.deviceId);
            console.log('\n⚠️  IMPORTANT: This is a sample device. Add your actual device ID via admin panel.');
        } else {
            console.log('ℹ️  Sample device already exists');
        }

        console.log('\n📋 Admin Credentials:');
        console.log('Admin 1:');
        console.log('  Email:', admin1Email);
        console.log('  Password:', admin1Password);
        console.log('  Google OAuth: Enabled');
        console.log('\nAdmin 2:');
        console.log('  Email:', admin2Email);
        console.log('  Password:', admin2Password);
        console.log('\n🔐 Access: http://localhost:3000/my-admin/login');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdminAndDevice();
