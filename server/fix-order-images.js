const mongoose = require('mongoose');
require('dotenv').config();

async function fixOrderImages(orderId) {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Order = require('./dist/models/Order').default;
        const Product = require('./dist/models/Product').default;
        
        const order = await Order.findById(orderId);
        
        if (!order) {
            console.log('Order not found');
            process.exit(1);
        }
        
        console.log(`Fixing order: ${orderId}\n`);
        console.log('Current state:');
        order.items.forEach((item, i) => {
            console.log(`  Item ${i} (${item.name}): image = "${item.image}"`);
        });
        
        console.log('\nUpdating order images...\n');
        let updated = false;
        
        for (let i = 0; i < order.items.length; i++) {
            const item = order.items[i];
            const product = await Product.findById(item.product);
            
            if (product) {
                // Check if product has images
                let imageUrl = '';
                
                if (product.images && product.images.length > 0 && product.images[0].url) {
                    imageUrl = product.images[0].url;
                } else if (product.colorVariants && product.colorVariants.length > 0) {
                    // Try to get image from color variants
                    const variant = product.colorVariants[0];
                    if (variant.images && variant.images.length > 0 && variant.images[0].url) {
                        imageUrl = variant.images[0].url;
                    }
                }
                
                // If we found an image and it's not a full URL, make it one
                if (imageUrl) {
                    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
                        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
                        imageUrl = imageUrl.startsWith('/') ? `${baseUrl}${imageUrl}` : `${baseUrl}/${imageUrl}`;
                    }
                    
                    order.items[i].image = imageUrl;
                    updated = true;
                    console.log(`✅ Updated item ${i} (${item.name}):`);
                    console.log(`   ${imageUrl}`);
                } else {
                    // Use a placeholder
                    order.items[i].image = 'https://via.placeholder.com/150?text=No+Image';
                    updated = true;
                    console.log(`⚠️  No image found for item ${i} (${item.name}), using placeholder`);
                }
            } else {
                console.log(`❌ Product not found for item ${i}`);
            }
        }
        
        if (updated) {
            await order.save();
            console.log('\n✅ Order updated successfully!');
            
            // Verify the update
            console.log('\nVerifying update:');
            const verifyOrder = await Order.findById(orderId);
            verifyOrder.items.forEach((item, i) => {
                console.log(`  Item ${i}: ${item.image.substring(0, 60)}...`);
            });
        } else {
            console.log('\n⚠️  No updates needed');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Get order ID from command line argument or use default
const orderId = process.argv[2] || '696f741eca6b30acffcad86d';
fixOrderImages(orderId);
