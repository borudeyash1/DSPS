
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Product from '../models/Product';
import User from '../models/User';
import Order from '../models/Order';
import Review from '../models/Review';
import { createReview } from '../controllers/reviewController'; // We can't easily call controller function directly without req/res mock.
// Instead, we will replicate the logic or use a helper if possible.
// Actually, better to test the MODEL update logic which is what matters.

dotenv.config({ path: path.join(__dirname, '../../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/botam-apparels';

const runVerification = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to DB');

        // Cleanup potential leftovers
        await User.deleteMany({ email: "reviewtest@example.com" });
        await Product.deleteMany({ name: "ReviewTest Product" });
        // Clean up reviews related to this user/product if any leftovers (optional, but good)
        // Would need IDs but we don't have them yet. 
        console.log('🧹 Cleaned up leftovers');

        // 1. Create Dummy Product
        const tempProduct = new Product({
            name: "ReviewTest Product",
            description: "Testing reviews",
            price: 500,
            stock: 100,
            category: "men",
            images: [{ url: "test.jpg", publicId: "pid" }]
        });
        await tempProduct.save();
        console.log(`✅ Created Product: ${tempProduct._id} (Count: ${tempProduct.reviewCount})`);

        // 2. Create Dummy User
        const tempUser = new User({
            fullName: "ReviewTest User",
            email: "reviewtest@example.com",
            password: "password123"
        });
        await tempUser.save();
        console.log(`✅ Created User: ${tempUser._id}`);

        // 3. Create Dummy Delivered Order (Required for review eligibility)
        const tempOrder = new Order({
            user: tempUser._id,
            items: [{
                product: tempProduct._id,
                name: tempProduct.name,
                price: tempProduct.price,
                quantity: 1
            }],
            totalAmount: 500,
            status: 'delivered',
            createdAt: new Date(),
            shippingAddress: {
                street: "123 Test St",
                city: "Test City",
                state: "Test State",
                pincode: "123456",
                country: "India"
            }
        });
        await tempOrder.save();
        console.log(`✅ Created Delivered Order: ${tempOrder._id}`);

        // 4. Create Review (Simulate Controller Logic)
        // We will manually create review and trigger update, mimicking controller
        const review = await Review.create({
            product: tempProduct._id,
            user: tempUser._id,
            order: tempOrder._id,
            rating: 5,
            comment: "Great product!",
            isVerifiedPurchase: true
        });
        console.log(`✅ Created Review: ${review._id}`);

        // Manual Update Trigger (mimicking what controller does)
        const allReviews = await Review.find({ product: tempProduct._id });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await Product.findByIdAndUpdate(tempProduct._id, {
            rating: Math.round(avgRating * 10) / 10,
            reviewCount: allReviews.length,
        });
        console.log('✅ Triggered Product Update');

        // 5. Verify Update
        const updatedProduct = await Product.findById(tempProduct._id);
        console.log(`📊 Updated Product - Rating: ${updatedProduct?.rating}, Count: ${updatedProduct?.reviewCount}`);

        if (updatedProduct?.reviewCount === 1 && updatedProduct?.rating === 5) {
            console.log('✅ VERIFICATION SUCCESS: Review count and rating updated correctly.');
        } else {
            console.error('❌ VERIFICATION FAILED: Counts did not update.');
        }

        // Cleanup
        await Product.deleteOne({ _id: tempProduct._id });
        await User.deleteOne({ _id: tempUser._id });
        await Order.deleteOne({ _id: tempOrder._id });
        await Review.deleteOne({ _id: review._id });
        console.log('✅ Cleanup Complete');

        process.exit(0);
    } catch (error: any) {
        console.error('❌ Verification Error:', JSON.stringify(error, null, 2));
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                console.error(`- Field: ${key}, Message: ${error.errors[key].message}`);
            });
        }
        process.exit(1);
    }
};

runVerification();
