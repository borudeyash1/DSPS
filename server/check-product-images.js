const mongoose = require('mongoose');
require('dotenv').config();

async function checkProductImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Order = require('./dist/models/Order').default;
        const Product = require('./dist/models/Product').default;
        
        const order = await Order.findById('696f5c88ca6b30acffcacee6');
        
        if (order) {
            console.log('Checking products in order:');
            for (const item of order.items) {
                const product = await Product.findById(item.product);
                console.log(`\nProduct: ${item.name}`);
                console.log(`  Product ID: ${item.product}`);
                if (product) {
                    console.log(`  Product found: Yes`);
                    console.log(`  Images count: ${product.images ? product.images.length : 0}`);
                    if (product.images && product.images.length > 0) {
                        console.log(`  First image URL: "${product.images[0].url}"`);
                    } else {
                        console.log(`  No images in product`);
                    }
                } else {
                    console.log(`  Product found: No`);
                }
            }
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkProductImages();
