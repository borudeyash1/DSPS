import mongoose from 'mongoose';
import Product from '../models/Product';
import dotenv from 'dotenv';

dotenv.config();

async function cleanupNonMensProducts() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/botam-apparels');
        console.log('✅ Connected to MongoDB');

        // Count products before cleanup
        const totalBefore = await Product.countDocuments();
        const menProducts = await Product.countDocuments({ category: 'men' });
    // @ts-ignore
        const womenProducts = await Product.countDocuments({ category: 'women' });
    // @ts-ignore
        const kidsProducts = await Product.countDocuments({ category: 'kids' });
    // @ts-ignore
        const livingProducts = await Product.countDocuments({ category: 'living' });

        console.log('\n📊 Current Product Count:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   Total Products: ${totalBefore}`);
        console.log(`   Men: ${menProducts}`);
        console.log(`   Women: ${womenProducts}`);
        console.log(`   Kids: ${kidsProducts}`);
        console.log(`   Living: ${livingProducts}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Delete all non-men's products
        const deleteResult = await Product.deleteMany({
    // @ts-ignore
            category: { $in: ['women', 'kids', 'living'] }
        });

        console.log('🗑️  Cleanup Results:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   ✅ Deleted ${deleteResult.deletedCount} products`);
        console.log(`   ✅ Remaining Men's Products: ${menProducts}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Verify final count
        const totalAfter = await Product.countDocuments();
        console.log(`📊 Final Product Count: ${totalAfter} (all men's clothing)`);
        console.log('✅ Database cleanup completed successfully!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error cleaning up products:', error);
        process.exit(1);
    }
}

// Run the cleanup
cleanupNonMensProducts();
