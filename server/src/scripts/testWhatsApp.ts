/**
 * WhatsApp Integration Test Script
 * 
 * This script tests the Interakt WhatsApp service to ensure it's properly configured.
 * Run this script to verify your WhatsApp integration is working.
 * 
 * Usage: npx ts-node src/scripts/testWhatsApp.ts
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { interaktWhatsAppService } from '../services/interaktWhatsappService';

async function testWhatsAppIntegration() {
    console.log('🧪 Testing WhatsApp Integration with Interakt...\n');

    // Check if service is configured
    console.log('1️⃣ Checking Configuration...');
    if (!interaktWhatsAppService.isReady()) {
        console.error('❌ Interakt WhatsApp service is not configured!');
        console.error('   Please set INTERAKT_SECRET_KEY in your .env file');
        process.exit(1);
    }
    console.log('✅ Service is configured\n');

    // Test phone number
    const testPhoneNumber = '8149196845'; // User's WhatsApp number
    console.log(`📱 Test Phone Number: ${testPhoneNumber}`);
    console.log('   (Make sure this is your WhatsApp number)\n');

    // Test 1: Send Template Message - Order Placed
    console.log('2️⃣ Testing Order Placed Template...');
    try {
        const result = await interaktWhatsAppService.sendTemplateMessage(
            testPhoneNumber,
            'order_confirmation_74',
            'en',
            ['#TEST123'] // Order number
        );

        if (result.success) {
            console.log('✅ Order placed template sent successfully!');
            console.log(`   Message ID: ${result.data?.id || 'N/A'}`);
        } else {
            console.error('❌ Failed to send order placed template');
            console.error(`   Error: ${result.error}`);
        }
    } catch (error: any) {
        console.error('❌ Exception:', error.message);
    }
    console.log('');

    // Wait 2 seconds between messages
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Send Template Message - Order Shipped
    console.log('3️⃣ Testing Order Shipped Template (using order_confirmation_74 fallback)...');
    try {
        // Using order_confirmation_74 which expects only order number
        const result = await interaktWhatsAppService.sendTemplateMessage(
            testPhoneNumber,
            'order_confirmation_74', // Using working template
            'en',
            ['#TEST123'] // Only order number
        );

        if (result.success) {
            console.log('✅ Order shipped template sent successfully!');
            console.log(`   Message ID: ${result.data?.id || 'N/A'}`);
        } else {
            console.error('❌ Failed to send order shipped template');
            console.error(`   Error: ${result.error}`);
        }
    } catch (error: any) {
        console.error('❌ Exception:', error.message);
    }
    console.log('');

    // Wait 2 seconds between messages
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: Send Template Message - Order Delivered
    console.log('4️⃣ Testing Order Delivered Template (using order_confirmation_74 fallback)...');
    try {
         // Using order_confirmation_74 which expects only order number
        const result = await interaktWhatsAppService.sendTemplateMessage(
            testPhoneNumber,
            'order_confirmation_74', // Using working template
            'en',
            ['#TEST123'] // Only order number
        );

        if (result.success) {
            console.log('✅ Order delivered template sent successfully!');
            console.log(`   Message ID: ${result.data?.id || 'N/A'}`);
        } else {
            console.error('❌ Failed to send order delivered template');
            console.error(`   Error: ${result.error}`);
        }
    } catch (error: any) {
        console.error('❌ Exception:', error.message);
    }
    console.log('');

    console.log('🎉 WhatsApp Integration Test Complete!\n');
    console.log('📋 Summary:');
    console.log('   - Check your WhatsApp for test messages');
    console.log('   - Verify templates are displaying correctly');
    console.log('   - Check Interakt dashboard for delivery status');
    console.log('   - If messages failed, check the error messages above\n');
}

// Run the test
testWhatsAppIntegration()
    .then(() => {
        console.log('✅ Test script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Test script failed:', error);
        process.exit(1);
    });
