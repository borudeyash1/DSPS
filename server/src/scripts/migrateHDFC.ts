import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PaymentSettings from '../models/PaymentSettings';

// Load env vars
dotenv.config();

const migrate = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const settings = await PaymentSettings.findOne();

        if (settings) {
            console.log('Current Settings:', {
                razorpayEnabled: (settings as any).razorpayEnabled, // might be in _doc
                hdfcEnabled: settings.hdfcEnabled
            });

            // Force enable HDFC
            settings.hdfcEnabled = true;

            // Ensure ALL online methods are accepted (including UPI and Wallet)
            settings.acceptedPaymentMethods = ['upi', 'card', 'netbanking', 'wallet', 'cod'];
            console.log('✅ Enabled all payment methods: UPI, Card, NetBanking, Wallet, COD');

            await settings.save();
            console.log('✅ Payment Settings updated: HDFC Enabled = TRUE');
        } else {
            console.log('❌ No Payment Settings found to migrate');
             // Create default
             await PaymentSettings.create({
                codEnabled: true,
                codMinimumAmount: 0,
                hdfcEnabled: true,
                acceptedPaymentMethods: ['upi', 'card', 'netbanking', 'wallet', 'cod']
            });
            console.log('✅ Created default Payment Settings with HDFC Enabled');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrate();
