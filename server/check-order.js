const mongoose = require('mongoose');
require('dotenv').config();

async function checkOrder(orderId) {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Order = require('./dist/models/Order').default;
        
        const order = await Order.findById(orderId);
        
        if (!order) {
            console.log('Order not found');
            process.exit(1);
        }
        
        console.log(`Order ID: ${orderId}`);
        console.log(`Total Items: ${order.items.length}\n`);
        
        order.items.forEach((item, i) => {
            console.log(`Item ${i}:`);
            console.log(`  Name: ${item.name}`);
            console.log(`  Image: "${item.image}"`);
            console.log(`  Image type: ${typeof item.image}`);
            console.log(`  Image length: ${item.image ? item.image.length : 0}`);
            console.log(`  Is empty: ${!item.image || item.image.trim() === ''}`);
            console.log('');
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

const orderId = process.argv[2] || '696f741eca6b30acffcad86d';
checkOrder(orderId);
