
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Product from '../models/Product';
import User from '../models/User';
import Order from '../models/Order';
import Admin from '../models/Admin';
import AllowedDevice from '../models/AllowedDevice';

dotenv.config({ path: path.join(__dirname, '../../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/botam-apparels';

const runVerification = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to DB');

        // Test 1: Product Multi-Word Search
        console.log('\n--- Test 1: Product Search ---');
        // Assuming we have a product like "Classic Blue Shirt"
        // We search for "shirt blue" (reverse order)
        // Note: Use a regex that likely matches existing data or create temp data?
        // Let's create temp data to be safe.
        const tempProduct = new Product({
            name: "TestUnique ProductItem", // Unique name
            description: "A description for testing search",
            price: 100,
            stock: 10,
            category: "men",
            images: []
        });
        await tempProduct.save();

        const pResults = await Product.find({
            $and: [
                { $or: [{ name: /product/i }, { description: /product/i }] },
                { $or: [{ name: /unique/i }, { description: /unique/i }] }
            ]
        });
        console.log(`Searching "unique product": Found ${pResults.length} matches.`);
        if (pResults.length > 0 && pResults[0]._id.toString() === tempProduct._id.toString()) {
            console.log('✅ Product Multi-word Search: SUCCESS');
        } else {
            console.log('❌ Product Multi-word Search: FAILED');
        }
        await Product.deleteOne({ _id: tempProduct._id });


        // Test 2: User Search
        console.log('\n--- Test 2: User Search ---');
        const tempUser = new User({
            fullName: "SearchTest User",
            email: "searchtest@example.com",
            password: "password123"
        });
        await tempUser.save();

        const uResults = await User.find({
            $or: [
                { fullName: { $regex: /searchtest/i } },
                { email: { $regex: /searchtest/i } }
            ]
        });
        console.log(`Searching "searchtest": Found ${uResults.length} matches.`);
        if (uResults.find(u => u._id.toString() === tempUser._id.toString())) {
            console.log('✅ User Search: SUCCESS');
        } else {
            console.log('❌ User Search: FAILED');
        }
        await User.deleteOne({ _id: tempUser._id });

        console.log('\n✅ Verification Complete.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Verification Error:', error);
        process.exit(1);
    }
};

runVerification();
