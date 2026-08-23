const mongoose = require('mongoose');
require('dotenv').config();

async function fixAllOrderImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Order = require('./dist/models/Order').default;
        const Product = require('./dist/models/Product').default;
        
        // Find all orders with empty image fields
        const orders = await Order.find({
            'items.image': { $in: ['', null] }
        });
        
        console.log(`Found ${orders.length} orders with missing images\n`);
        
        if (orders.length === 0) {
            console.log('✅ All orders have images!');
            process.exit(0);
        }
        
        let fixedCount = 0;
        
        for (const order of orders) {
            console.log(`\n📦 Processing order: ${order._id}`);
            let orderUpdated = false;
            
            for (let i = 0; i < order.items.length; i++) {
                const item = order.items[i];
                
                // Skip if already has image
                if (item.image && item.image.trim() !== '') {
                    continue;
                }
                
                const product = await Product.findById(item.product);
                
                if (product) {
                    let imageUrl = '';
                    
                    // Try to get image from product.images
                    if (product.images && product.images.length > 0 && product.images[0].url) {
                        imageUrl = product.images[0].url;
                    } 
                    // Try to get image from colorVariants
                    else if (product.colorVariants && product.colorVariants.length > 0) {
                        const variant = product.colorVariants[0];
                        if (variant.images && variant.images.length > 0 && variant.images[0].url) {
                            imageUrl = variant.images[0].url;
                        }
                    }
                    
                    // Make URL absolute if needed
                    if (imageUrl) {
                        if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
                            const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
                            imageUrl = imageUrl.startsWith('/') ? `${baseUrl}${imageUrl}` : `${baseUrl}/${imageUrl}`;
                        }
                        
                        order.items[i].image = imageUrl;
                        orderUpdated = true;
                        console.log(`  ✅ Fixed: ${item.name}`);
                    } else {
                        order.items[i].image = 'https://via.placeholder.com/150?text=No+Image';
                        orderUpdated = true;
                        console.log(`  ⚠️  Placeholder: ${item.name} (no image found)`);
                    }
                }
            }
            
            if (orderUpdated) {
                await order.save();
                fixedCount++;
                console.log(`  💾 Saved order ${order._id}`);
            }
        }
        
        console.log(`\n✅ Fixed ${fixedCount} orders!`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

fixAllOrderImages();
