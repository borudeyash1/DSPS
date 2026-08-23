const mongoose = require('mongoose');
const express = require('express');
require('dotenv').config();

async function testAPI() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Order = require('./dist/models/Order').default;
        
        const orderId = '696f741eca6b30acffcad86d';
        const order = await Order.findById(orderId).populate('items.product', 'name');
        
        if (!order) {
            console.log('Order not found');
            process.exit(1);
        }
        
        console.log('API Response Data:');
        console.log(JSON.stringify({
            _id: order._id,
            items: order.items.map(item => ({
                product: item.product,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                image: item.image
            }))
        }, null, 2));
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

testAPI();
