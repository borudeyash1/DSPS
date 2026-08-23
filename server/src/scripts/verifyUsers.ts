
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/botam-apparels';

const verifyConnection = async () => {
    try {
        console.log(`🔌 Connecting to MongoDB...`);
        await mongoose.connect(MONGODB_URI);
        console.log(`✅ Connected to ${mongoose.connection.name}`);

        const collectionName = 'users';
        console.log(`🔍 Checking collection: '${collectionName}'...`);

        if (!mongoose.connection.db) {
            throw new Error('Database connection not established');
        }
        const collection = mongoose.connection.db.collection(collectionName);
        const count = await collection.countDocuments();

        console.log(`📊 Total documents in '${collectionName}': ${count}`);

        if (count === 0) {
            console.log('⚠️ Warning: No users found. Case sensitivity issue?');
            // Check for 'Customers' or 'Users'
            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log('📂 Available collections:', collections.map(c => c.name));
        } else {
            console.log('✅ Users found. DB connection is healthy.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ DB Connection Error:', error);
        process.exit(1);
    }
};

verifyConnection();
