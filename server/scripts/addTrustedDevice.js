const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from server/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const allowedDeviceSchema = new mongoose.Schema({
    deviceId: { type: String, required: true, unique: true },
    deviceName: { type: String, required: true },
    deviceType: { type: String, enum: ['admin', 'trusted'], default: 'admin', required: true },
    isActive: { type: Boolean, default: true },
    addedBy: { type: String, required: true },
    lastAccess: Date,
    loginAttempts: { type: Number, default: 0 }
}, { timestamps: true });

const AllowedDevice = mongoose.models.AllowedDevice || mongoose.model('AllowedDevice', allowedDeviceSchema);

const addTrustedDevice = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI not found in .env');
            process.exit(1);
        }
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const deviceId = 'device_g8h7nd_mj3730y7';
        
        // Check if exists
        const existing = await AllowedDevice.findOne({ deviceId });
        if (existing) {
            console.log(`Device ${deviceId} already exists. Updating to trusted...`);
            existing.deviceType = 'trusted';
            existing.isActive = true;
            await existing.save();
            console.log('Updated to Trusted.');
        } else {
            console.log(`Creating new trusted device ${deviceId}...`);
            await AllowedDevice.create({
                deviceId,
                deviceName: 'Test Trusted Device',
                deviceType: 'trusted',
                isActive: true,
                addedBy: 'Script',
                lastAccess: new Date()
            });
            console.log('Created Trusted Device.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

addTrustedDevice();
